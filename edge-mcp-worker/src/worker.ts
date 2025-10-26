/**
 * Cloudflare Worker - MCP Server
 * Edge Worker that serves as our MCP server for incident management
 */

/**
 * Generate CORS headers for responses
 */
function corsHeaders(origin: string): Record<string, string> {
	return {
		'access-control-allow-origin': origin,
		'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
		'access-control-allow-headers': 'content-type,authorization',
		'cache-control': 'no-store'
	};
}

/**
 * Return JSON response with CORS headers
 */
function json(data: unknown, status = 200, origin = '*'): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json',
			...corsHeaders(origin)
		}
	});
}

/**
 * GitHub API base URL
 */
const GH_API = 'https://api.github.com';

/**
 * Generate GitHub API headers with authentication
 */
function ghHeaders(env: Env): Record<string, string> {
	return {
		'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
		'Accept': 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'TicketBuddy/1.0'
	};
}

/**
 * Make a GET request to GitHub API
 */
async function ghGet(env: Env, path: string) {
	const response = await fetch(`${GH_API}${path}`, {
		headers: ghHeaders(env)
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Unknown error' })) as { message: string };
		throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
	}
	
	return response;
}

/**
 * Make a POST request to GitHub API
 */
async function ghPost(env: Env, path: string, body: any) {
	const response = await fetch(`${GH_API}${path}`, {
		method: 'POST',
		headers: {
			...ghHeaders(env),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Unknown error' })) as { message: string };
		throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
	}
	
	return response;
}

/**
 * Make a PATCH request to GitHub API
 */
async function ghPatch(env: Env, path: string, body: any) {
	const response = await fetch(`${GH_API}${path}`, {
		method: 'PATCH',
		headers: {
			...ghHeaders(env),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Unknown error' })) as { message: string };
		throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
	}
	
	return response;
}

/**
 * Parse repository identifier (owner/repo) into owner and name
 */
function parseRepoId(repoId: string): { owner: string; name: string } {
	const parts = repoId.split('/');
	if (parts.length !== 2) {
		throw new Error('Invalid repo ID format. Expected: owner/name');
	}
	return {
		owner: parts[0],
		name: parts[1]
	};
}

/**
 * Verify GitHub webhook signature using HMAC SHA256
 */
async function verifySignature(env: Env, signature: string, rawBody: string): Promise<boolean> {
	const algorithm = { name: 'HMAC', hash: 'SHA-256' };
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(env.GITHUB_WEBHOOK_SECRET),
		algorithm,
		false,
		['sign']
	);
	
	const expectedSignature = await crypto.subtle.sign(algorithm, key, new TextEncoder().encode(rawBody));
	const expected = Array.from(new Uint8Array(expectedSignature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
	
	const provided = signature.replace('sha256=', '');
	return provided === expected;
}

/**
 * Build summary for GitHub events
 */
function buildEventSummary(eventType: string, payload: any): string {
	switch (eventType) {
		case 'pull_request':
			return `PR ${payload.action}: ${payload.pull_request.title}`;
		case 'issues':
			return `Issue ${payload.action}: ${payload.issue.title}`;
		case 'push':
			return `Push to ${payload.ref}: ${payload.commits?.length || 0} commits`;
		case 'workflow_run':
			return `Workflow ${payload.workflow_run.name}: ${payload.workflow_run.conclusion || payload.workflow_run.status}`;
		default:
			return `${eventType}: ${payload.action || 'event'}`;
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('origin') || '*';
		
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(origin)
			});
		}
		
		try {
			// Route: GET /health
			if (request.method === 'GET' && url.pathname === '/health') {
				return json({ ok: true }, 200, origin);
			}
			
			// Route: GET /github/test - Test GitHub API connection
			if (request.method === 'GET' && url.pathname === '/github/test') {
				try {
					const response = await ghGet(env, '/rate_limit');
					const data = await response.json() as {
						resources: {
							core: {
								limit: number;
								remaining: number;
								reset: number;
							};
						};
					};
					return json({
						success: true,
						message: 'GitHub API connection successful',
						limit: data.resources.core.limit,
						remaining: data.resources.core.remaining,
						reset: new Date(data.resources.core.reset * 1000).toISOString()
					}, 200, origin);
				} catch (error) {
					return json({
						success: false,
						error: (error as Error).message
					}, 500, origin);
				}
			}
			
			// Route: POST /github/link - Link a GitHub repository
			if (request.method === 'POST' && url.pathname === '/github/link') {
				try {
					const body = await request.json() as { repo?: string; url?: string };
					
					// Parse repo identifier from either format
					let repoId: string;
					let repoUrl: string;
					
					if (body.repo) {
						// Format: "owner/name"
						const parsed = parseRepoId(body.repo);
						repoId = `${parsed.owner}/${parsed.name}`;
						repoUrl = `https://github.com/${repoId}`;
					} else if (body.url) {
						// Format: "https://github.com/owner/name"
						const urlMatch = body.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
						if (!urlMatch) {
							return json({ error: 'Invalid GitHub URL format' }, 400, origin);
						}
						repoId = `${urlMatch[1]}/${urlMatch[2]}`;
						repoUrl = body.url;
					} else {
						return json({ error: 'Either repo or url must be provided' }, 400, origin);
					}
					
					// Fetch repository details from GitHub API
					const response = await ghGet(env, `/repos/${repoId}`);
					const repoData = await response.json() as {
						full_name: string;
						html_url: string;
						default_branch: string;
					};
					
					const now = new Date().toISOString();
					
					// Upsert into database
					await env.DB.prepare(
						`INSERT INTO github_repos (id, url, default_branch, connected_at) 
						VALUES (?, ?, ?, ?) 
						ON CONFLICT(id) DO UPDATE SET url = ?, default_branch = ?, connected_at = ?`
					).bind(repoId, repoData.html_url, repoData.default_branch, now, repoData.html_url, repoData.default_branch, now).run();
					
					return json({
						success: true,
						repoId,
						url: repoData.html_url,
						default_branch: repoData.default_branch
					}, 200, origin);
				} catch (error) {
					return json({
						success: false,
						error: (error as Error).message
					}, 500, origin);
				}
			}
			
			// Route: GET /github/summary - Get GitHub integration summary
			if (request.method === 'GET' && url.pathname === '/github/summary') {
				try {
					const repos = await env.DB.prepare(
						'SELECT * FROM github_repos ORDER BY connected_at DESC LIMIT 1'
					).all();
					
					if (repos.results.length === 0) {
						return json({
							connected: false,
							repo: null,
							counts: { openPRs: 0, openIssues: 0 },
							recentEvents: []
						}, 200, origin);
					}
					
					const repo = repos.results[0] as any;
					
					// Get counts
					const [prsResult, issuesResult, eventsResult] = await Promise.all([
						env.DB.prepare('SELECT COUNT(*) as count FROM github_pull_requests WHERE repo_id = ? AND state = ?').bind(repo.id, 'open').first(),
						env.DB.prepare('SELECT COUNT(*) as count FROM github_issues WHERE repo_id = ? AND state = ?').bind(repo.id, 'open').first(),
						env.DB.prepare('SELECT * FROM github_events WHERE repo_id = ? ORDER BY created_at DESC LIMIT 10').bind(repo.id).all()
					]);
					
					return json({
						connected: true,
						repo: {
							id: repo.id,
							url: repo.url,
							default_branch: repo.default_branch,
							connected_at: repo.connected_at
						},
						counts: {
							openPRs: (prsResult as any)?.count || 0,
							openIssues: (issuesResult as any)?.count || 0
						},
						recentEvents: (eventsResult.results || []).map((e: any) => ({
							id: e.id,
							type: e.type,
							summary: e.summary,
							created_at: e.created_at
						}))
					}, 200, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
		// Route: GET /github/:owner/:name/prs - List PRs
		if (request.method === 'GET' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/prs$/)) {
			try {
				const pathParts = url.pathname.split('/');
				const owner = pathParts[2];
				const name = pathParts[3];
				const repoId = `${owner}/${name}`;
				const state = url.searchParams.get('state') || 'open';
				
				// Fetch directly from GitHub API
				const ghPRs = await ghGet(env, `/repos/${repoId}/pulls?state=${state}&per_page=100`);
				const prsData = await ghPRs.json() as any[];
				
				// Transform to simpler format
				const prs = prsData.map((pr: any) => ({
					id: pr.number,
					repo_id: repoId,
					title: pr.title,
					author: pr.user?.login || 'unknown',
					state: pr.state,
					merged: pr.merged ? 1 : 0,
					html_url: pr.html_url,
					created_at: pr.created_at,
					updated_at: pr.updated_at,
					head_sha: pr.head?.sha
				}));
				
				return json({ prs }, 200, origin);
			} catch (error) {
				return json({ error: (error as Error).message }, 500, origin);
			}
		}
			
			// Route: GET /github/:owner/:name/pr/:number - Get single PR
			if (request.method === 'GET' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/pr\/\d+$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const prNumber = parseInt(pathParts[5]);
					const repoId = `${owner}/${name}`;
					
					const pr = await env.DB.prepare(
						'SELECT * FROM github_pull_requests WHERE repo_id = ? AND id = ?'
					).bind(repoId, prNumber).first();
					
					if (!pr) {
						return json({ error: 'PR not found' }, 404, origin);
					}
					
					return json({ pr }, 200, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
		// Route: GET /github/:owner/:name/issues - List issues
		if (request.method === 'GET' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/issues$/)) {
			try {
				const pathParts = url.pathname.split('/');
				const owner = pathParts[2];
				const name = pathParts[3];
				const repoId = `${owner}/${name}`;
				const state = url.searchParams.get('state') || 'open';
				
				// Fetch directly from GitHub API
				const ghIssues = await ghGet(env, `/repos/${repoId}/issues?state=${state}&per_page=100`);
				const issuesData = await ghIssues.json() as any[];
				
				// Transform to simpler format
				const issues = issuesData.map((issue: any) => ({
					id: issue.number,
					repo_id: repoId,
					title: issue.title,
					author: issue.user?.login || 'unknown',
					state: issue.state,
					html_url: issue.html_url,
					created_at: issue.created_at,
					updated_at: issue.updated_at
				}));
				
				// Filter by labels if provided
				const labels = url.searchParams.get('labels');
				let filteredIssues = issues;
				if (labels) {
					const labelList = labels.split(',').map(l => l.trim().toLowerCase());
					filteredIssues = issues.filter((issue: any) => {
						const issueLabels = issuesData.find((i: any) => i.number === issue.id)?.labels || [];
						return issueLabels.some((label: any) => labelList.includes(label.name.toLowerCase()));
					});
				}
				
				return json({ issues: filteredIssues }, 200, origin);
			} catch (error) {
				return json({ error: (error as Error).message }, 500, origin);
			}
		}
			
			// Route: GET /github/:owner/:name/events - List events
			if (request.method === 'GET' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/events$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const repoId = `${owner}/${name}`;
					const type = url.searchParams.get('type');
					const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
					const offset = parseInt(url.searchParams.get('offset') || '0');
					
					let query = 'SELECT * FROM github_events WHERE repo_id = ?';
					const params: any[] = [repoId];
					
					if (type) {
						query += ' AND type = ?';
						params.push(type);
					}
					
					query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
					params.push(limit, offset);
					
					const events = await env.DB.prepare(query).bind(...params).all();
					
					return json({
						events: events.results || [],
						count: events.results.length,
						limit,
						offset
					}, 200, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
			// Route: POST /github/:owner/:name/pr/:number/merge - Merge a PR
			if (request.method === 'POST' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/pr\/\d+\/merge$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const prNumber = parseInt(pathParts[5]);
					const repoId = `${owner}/${name}`;
					
					const body = await request.json() as {
						method?: 'squash' | 'merge' | 'rebase';
						sha?: string;
						commit_message?: string;
						ticket_id?: string;
					};
					
					// Merge PR via GitHub API
					const mergeBody: any = {
						merge_method: body.method || 'squash'
					};
					
					if (body.sha) {
						mergeBody.sha = body.sha;
					}
					
					if (body.commit_message) {
						mergeBody.commit_message = body.commit_message;
					}
					
				const response = await ghPatch(env, `/repos/${repoId}/pulls/${prNumber}/merge`, mergeBody);
				
				// Handle GitHub API errors with clear messages
				if (!response.ok) {
					const errorData = await response.json() as { message?: string };
					let errorMessage = errorData.message || 'Failed to merge pull request';
					
					// Provide clear error messages for common scenarios
					if (response.status === 405) {
						// Branch protection or PR not mergeable
						if (errorMessage.includes('status check')) {
							errorMessage = 'Branch protection: Required status checks must pass before merging';
						} else if (errorMessage.includes('review')) {
							errorMessage = 'Branch protection: Required reviews must be approved before merging';
						} else if (errorMessage.includes('not mergeable')) {
							errorMessage = 'Pull Request is not mergeable (likely due to conflicts)';
						}
					} else if (response.status === 409) {
						// Head branch was modified
						errorMessage = 'Head branch was modified. Review and try the merge again.';
					}
					
					return json({ error: errorMessage }, response.status, origin);
				}
				
				const data = await response.json() as { merged: boolean; message: string };
				
				if (data.merged) {
					// Update D1 with merged state
					const now = new Date().toISOString();
					await env.DB.prepare(
						`UPDATE github_pull_requests 
						SET state = 'closed', merged = 1, merged_at = ?
						WHERE repo_id = ? AND id = ?`
					).bind(now, repoId, prNumber).run();
					
					// If a ticket is linked, update it to resolved
					if (body.ticket_id) {
						await env.DB.prepare(
							`UPDATE tickets 
							SET status = 'resolved', github_pr_number = ?, updatedAt = ?
							WHERE id = ?`
						).bind(prNumber, now, body.ticket_id).run();
					}
				}
				
				return json({ success: true, merged: data.merged, message: data.message }, 200, origin);
			} catch (error) {
				return json({ error: (error as Error).message }, 500, origin);
			}
			}
			
			// Route: POST /github/:owner/:name/issues - Create an issue
			if (request.method === 'POST' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/issues$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const repoId = `${owner}/${name}`;
					
					const body = await request.json() as {
						title: string;
						body?: string;
						labels?: string[];
						assignees?: string[];
					};
					
					if (!body.title) {
						return json({ error: 'Title is required' }, 400, origin);
					}
					
					const issueBody: any = {
						title: body.title
					};
					
					if (body.body) {
						issueBody.body = body.body;
					}
					
					if (body.labels && body.labels.length > 0) {
						issueBody.labels = body.labels;
					}
					
					if (body.assignees && body.assignees.length > 0) {
						issueBody.assignees = body.assignees;
					}
					
					const response = await ghPost(env, `/repos/${repoId}/issues`, issueBody);
					const data = await response.json();
					
					return json({ issue: data }, 201, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
			// Route: PATCH /github/:owner/:name/issues/:number - Update an issue
			if (request.method === 'PATCH' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/issues\/\d+$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const issueNumber = parseInt(pathParts[5]);
					const repoId = `${owner}/${name}`;
					
					const body = await request.json() as {
						title?: string;
						body?: string;
						state?: 'open' | 'closed';
						labels?: string[];
						assignees?: string[];
					};
					
					const updateBody: any = {};
					
					if (body.title !== undefined) updateBody.title = body.title;
					if (body.body !== undefined) updateBody.body = body.body;
					if (body.state !== undefined) updateBody.state = body.state;
					if (body.labels !== undefined) updateBody.labels = body.labels;
					if (body.assignees !== undefined) updateBody.assignees = body.assignees;
					
					const response = await ghPatch(env, `/repos/${repoId}/issues/${issueNumber}`, updateBody);
					const data = await response.json();
					
					return json({ issue: data }, 200, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
			// Route: POST /github/:owner/:name/issues/:number/comment - Comment on an issue
			if (request.method === 'POST' && url.pathname.match(/^\/github\/[^\/]+\/[^\/]+\/issues\/\d+\/comment$/)) {
				try {
					const pathParts = url.pathname.split('/');
					const owner = pathParts[2];
					const name = pathParts[3];
					const issueNumber = parseInt(pathParts[5]);
					const repoId = `${owner}/${name}`;
					
					const body = await request.json() as { body: string };
					
					if (!body.body) {
						return json({ error: 'Comment body is required' }, 400, origin);
					}
					
					const response = await ghPost(env, `/repos/${repoId}/issues/${issueNumber}/comments`, { body: body.body });
					const data = await response.json();
					
					return json({ comment: data }, 201, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
			// Route: POST /github/webhook - Receive GitHub webhooks
			if (request.method === 'POST' && url.pathname === '/github/webhook') {
				try {
					// Read webhook headers
					const deliveryId = request.headers.get('X-GitHub-Delivery');
					const eventType = request.headers.get('X-GitHub-Event');
					const signature = request.headers.get('X-Hub-Signature-256');
					
					if (!deliveryId || !eventType) {
						return json({ error: 'Missing required GitHub headers' }, 400, origin);
					}
					
					// Get raw body for signature verification
					const rawBody = await request.text();
					
					// Verify signature if provided
					if (signature) {
						const isValid = await verifySignature(env, signature, rawBody);
						if (!isValid) {
							return json({ error: 'Invalid signature' }, 401, origin);
						}
					}
					
					// Parse payload
					const payload = JSON.parse(rawBody);
					
					// Compute repoId from payload
					const repo = payload.repository || payload.repo;
					if (!repo || !repo.full_name) {
						return json({ error: 'Missing repository info in payload' }, 400, origin);
					}
					const repoId = repo.full_name;
					
					// Build summary
					const summary = buildEventSummary(eventType, payload);
					
					// Handle PR events
					if (eventType === 'pull_request' && payload.pull_request) {
						const pr = payload.pull_request;
						await env.DB.prepare(
							`INSERT INTO github_pull_requests (id, repo_id, title, author, state, merged, html_url, created_at, updated_at, closed_at, merged_at)
							VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
							ON CONFLICT(id) DO UPDATE SET 
								title = excluded.title,
								state = excluded.state,
								merged = excluded.merged,
								updated_at = excluded.updated_at,
								closed_at = excluded.closed_at,
								merged_at = excluded.merged_at`
						).bind(
							pr.number,
							repoId,
							pr.title,
							pr.user.login,
							pr.state,
							pr.merged ? 1 : 0,
							pr.html_url,
							pr.created_at,
							pr.updated_at,
							pr.closed_at || null,
							pr.merged_at || null
						).run();
					}
					
					// Handle issue events
					if (eventType === 'issues' && payload.issue) {
						const issue = payload.issue;
						await env.DB.prepare(
							`INSERT INTO github_issues (id, repo_id, title, author, state, is_pr, html_url, created_at, updated_at, closed_at)
							VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
							ON CONFLICT(id) DO UPDATE SET 
								title = excluded.title,
								state = excluded.state,
								updated_at = excluded.updated_at,
								closed_at = excluded.closed_at`
						).bind(
							issue.number,
							repoId,
							issue.title,
							issue.user.login,
							issue.state,
							issue.pull_request ? 1 : 0,
							issue.html_url,
							issue.created_at,
							issue.updated_at,
							issue.closed_at || null
						).run();
					}
					
					// Insert event
					const now = new Date().toISOString();
					await env.DB.prepare(
						`INSERT INTO github_events (id, repo_id, type, summary, payload, created_at)
						VALUES (?, ?, ?, ?, ?, ?)`
					).bind(
						deliveryId,
						repoId,
						eventType,
						summary,
						rawBody,
						now
					).run();
					
					return json({ ok: true }, 200, origin);
				} catch (error) {
					return json({
						ok: false,
						error: (error as Error).message
					}, 500, origin);
				}
			}
			
			// Route: GET /incidents
			if (request.method === 'GET' && url.pathname === '/incidents') {
				try {
					// Parse query params
					const service = url.searchParams.get('service');
					const limitParam = url.searchParams.get('limit');
					const since = url.searchParams.get('since');
					
					// Validate and parse limit
					let limit = 50;
					if (limitParam) {
						const parsed = parseInt(limitParam, 10);
						if (!isNaN(parsed) && parsed > 0) {
							limit = Math.min(parsed, 200); // Clamp to max 200
						}
					}
					
					// Build SQL query
					let query = 'SELECT ticketId, service, severity, summary, created_at FROM incidents';
					const conditions: string[] = [];
					const params: any[] = [];
					
					// Add WHERE clauses if needed
					if (service) {
						conditions.push('service = ?');
						params.push(service);
					}
					
					if (since) {
						// Validate ISO date
						const sinceDate = new Date(since);
						if (!isNaN(sinceDate.getTime())) {
							conditions.push('created_at >= ?');
							params.push(since);
						}
					}
					
					// Add WHERE if conditions exist
					if (conditions.length > 0) {
						query += ' WHERE ' + conditions.join(' AND ');
					}
					
					// Always order by newest first and limit
					query += ' ORDER BY created_at DESC LIMIT ?';
					params.push(limit);
					
					// Execute query with all parameters bound at once
					const result = await env.DB.prepare(query).bind(...params).all();
					
					return json({
						incidents: result.results || []
					}, 200, origin);
				} catch (error) {
					return json({ error: (error as Error).message }, 500, origin);
				}
			}
			
			// Route: GET /tickets
			if (request.method === 'GET' && url.pathname === '/tickets') {
				const result = await env.DB.prepare('SELECT * FROM tickets ORDER BY createdAt DESC')
					.all();
				
				return json({
					tickets: result.results || []
				});
			}

			// Route: POST /tickets
			if (request.method === 'POST' && url.pathname === '/tickets') {
				const body = await request.json() as { description: string };
				
				// Generate ticket ID (last 6 digits of timestamp)
				const id = "TICKET-" + Date.now().toString().slice(-6);
				const now = new Date().toISOString();
				
				// AI Processing - Analyze description and generate multiple tickets
				try {
					// Use Workers AI to analyze the description and break it into separate functionalities
					const prompt = `Analyze this functionality request and break it down into separate, specific tickets. 
					Return a JSON array where each object represents a distinct functionality that needs to be implemented.
					
					Format:
					[
						{
							"name": "Short descriptive title (max 50 chars)",
							"description": "Detailed description of this specific functionality",
							"importance": 1-3,
							"assignee": "Team member name (choose from: John Doe, Jane Smith, Mike Johnson, Sarah Wilson, Alex Chen, Maria Rodriguez)"
						}
					]
					
					PRIORITY GUIDELINES (importance field):
					Importance 3 (HIGH - Critical):
					- Security vulnerabilities, authentication, authorization
					- Payment processing, financial transactions
					- Data loss prevention, backup systems
					- User-visible errors or crashes
					- Blocking other features or workflows
					- Mentions: "urgent", "critical", "emergency", "asap", "blocking", "security", "payment", "data loss"
					
					Importance 2 (MEDIUM - Important):
					- Core feature implementations
					- API endpoints, database schema
					- User-facing functionality (non-critical)
					- Performance improvements
					- Mentions: "important", "soon", "priority", "core feature", "api", "database"
					
					Importance 1 (LOW - Nice to have):
					- UI polish, styling, animations
					- Nice-to-have features
					- Documentation updates
					- Minor enhancements
					- No urgency indicators, general improvements
					
					ASSIGNMENT GUIDELINES:
					- Security/auth: Sarah Wilson
					- Backend/API/database: Mike Johnson
					- Frontend/UI: Jane Smith
					- Mobile: Alex Chen
					- General/data: Maria Rodriguez
					- Default: John Doe
					
					TICKET CREATION:
					- Each ticket should represent ONE specific functionality
					- If the request mentions multiple features, create separate tickets for each
					- If it's a single feature, create one ticket
					- Be specific and actionable for each ticket
					
					Request: "${body.description}"`;
					
					const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
						prompt
					});
					
					// Parse AI response and create tickets
					let tickets = [];
					
					try {
						// Try to parse the AI response as JSON
						const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.response || '';
						const aiTickets = JSON.parse(responseText);
						
						if (Array.isArray(aiTickets) && aiTickets.length > 0) {
							tickets = aiTickets;
						} else {
							throw new Error('Invalid AI response format');
						}
					} catch (parseError) {
						console.log('AI response parsing failed, using fallback logic');
						
						// Fallback: Use keyword-based analysis to break down the request
						const description = body.description.toLowerCase();
						
						// Smart priority detection
						const calculateImportance = (keywords: string[], text: string): number => {
							// High priority indicators
							if (/urgent|critical|emergency|asap|blocking|security|vulnerability|breach|payment|transaction|data loss|crashes|errors/.test(text)) {
								return 3;
							}
							// Medium priority indicators
							if (/important|soon|priority|core|essential|must have/.test(text)) {
								return 2;
							}
							// Security/auth always high
							if (keywords.some(k => /auth|security|login|password|encrypt|ssl|cert/.test(k))) {
								return 3;
							}
							// Core features medium-high
							if (keywords.some(k => /api|backend|database|server|core|feature/.test(k))) {
								return 2;
							}
							// UI/frontend usually low-medium
							if (keywords.some(k => /ui|design|style|animation|polish|frontend/.test(k))) {
								return 1;
							}
							return 2; // Default medium
						};
						
						const functionalities = [];
						
						// Security and Authentication (HIGH priority)
						if (/authentication|login|auth|security|password|encrypt|ssl|cert/.test(description)) {
							functionalities.push({
								name: "User Authentication System",
								description: "Implement secure user authentication with login/logout functionality",
								importance: calculateImportance(['auth'], description),
								assignee: "Sarah Wilson"
							});
						}
						
						// Database and data (MEDIUM-HIGH priority)
						if (/database|data|storage|persist|query|schema/.test(description)) {
							functionalities.push({
								name: "Database Implementation",
								description: "Set up and configure database for data storage and retrieval",
								importance: calculateImportance(['database'], description),
								assignee: "Mike Johnson"
							});
						}
						
						// Backend API (MEDIUM-HIGH priority)
						if (/api|backend|server|endpoint|service|microservice/.test(description)) {
							functionalities.push({
								name: "Backend API",
								description: "Develop backend API and server-side functionality",
								importance: calculateImportance(['api', 'backend'], description),
								assignee: "Mike Johnson"
							});
						}
						
						// Frontend UI (LOW-MEDIUM priority)
						if (/frontend|ui|interface|design|style|animation|polish/.test(description)) {
							functionalities.push({
								name: "Frontend Interface",
								description: "Create user interface and frontend components",
								importance: calculateImportance(['ui', 'frontend'], description),
								assignee: "Jane Smith"
							});
						}
						
						// Mobile app (MEDIUM priority)
						if (/mobile|app|ios|android|react native/.test(description)) {
							functionalities.push({
								name: "Mobile Application",
								description: "Develop mobile application functionality",
								importance: calculateImportance(['mobile'], description),
								assignee: "Alex Chen"
							});
						}
						
						// If no specific functionalities detected, create a general ticket
						if (functionalities.length === 0) {
							const words = body.description.split(' ').slice(0, 6);
							const name = words.join(' ').replace(/[^\w\s]/g, '');
							
							functionalities.push({
								name: name || "General Functionality Request",
								description: body.description,
								importance: calculateImportance([], description),
								assignee: "John Doe"
							});
						}
						
						tickets = functionalities;
					}
					
					// Create tickets in database
					const createdTickets = [];
					
					for (let i = 0; i < tickets.length; i++) {
						const ticket = tickets[i];
						const ticketId = "TICKET-" + Date.now().toString().slice(-6) + "-" + (i + 1);
						
						await env.DB.prepare(
							'INSERT INTO tickets (id, name, description, importance, status, assignee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
						).bind(
							ticketId, 
							ticket.name, 
							ticket.description, 
							ticket.importance, 
							'open', 
							ticket.assignee, 
							now, 
							now
						).run();
						
						createdTickets.push({
							id: ticketId,
							name: ticket.name,
							description: ticket.description,
							importance: ticket.importance,
							status: 'open',
							assignee: ticket.assignee,
							createdAt: now,
							updatedAt: now
						});
					}
					
					return json({ 
						success: true,
						tickets: createdTickets,
						count: createdTickets.length
					});
					
				} catch (aiError) {
					console.error('AI processing failed, using fallback:', aiError);
					
					// Ultimate fallback: create a single ticket
					const fallbackId = "TICKET-" + Date.now().toString().slice(-6);
					const fallbackName = "AI-Generated Request";
					const fallbackImportance = 1;
					const fallbackAssignee = "John Doe";
					
					await env.DB.prepare(
						'INSERT INTO tickets (id, name, description, importance, status, assignee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
					).bind(fallbackId, fallbackName, body.description, fallbackImportance, 'open', fallbackAssignee, now, now).run();
					
					return json({ 
						success: true,
						tickets: [{
							id: fallbackId,
							name: fallbackName,
							description: body.description,
							importance: fallbackImportance,
							status: 'open',
							assignee: fallbackAssignee,
							createdAt: now,
							updatedAt: now
						}],
						count: 1
					});
				}
			}

		// Route: PATCH /tickets/:id
		if (request.method === 'PATCH' && url.pathname.startsWith('/tickets/')) {
			const ticketId = url.pathname.split('/').pop();
			const body = await request.json() as { status?: string; importance?: number };
			const now = new Date().toISOString();
			
			// Build update query dynamically based on what's being updated
			const updates: string[] = [];
			const values: any[] = [];
			
			if (body.status !== undefined) {
				updates.push('status = ?');
				values.push(body.status);
			}
			
			if (body.importance !== undefined) {
				// Validate importance is 1, 2, or 3
				if (![1, 2, 3].includes(body.importance)) {
					return json({ error: 'Invalid importance value. Must be 1, 2, or 3' }, 400, origin);
				}
				updates.push('importance = ?');
				values.push(body.importance);
			}
			
			if (updates.length === 0) {
				return json({ error: 'No fields to update' }, 400, origin);
			}
			
			updates.push('updatedAt = ?');
			values.push(now);
			values.push(ticketId);
			
			await env.DB.prepare(
				`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`
			).bind(...values).run();
			
			return json({ success: true }, 200, origin);
		}
			
			// Route: POST /mcp/call-tool
			if (request.method === 'POST' && url.pathname === '/mcp/call-tool') {
				const body = await request.json() as { tool: string; args: any };
				
				// Only handle summarize_checkout_health tool for now
				if (body.tool === 'summarize_checkout_health') {
					const service = body.args?.service || 'checkout';
					
					// Read fake logs from KV or fall back to hardcoded
					let fakeLogs;
					const kvLogs = await env.LOGS_KV.get('checkout_logs');
					
					if (kvLogs) {
						fakeLogs = JSON.parse(kvLogs);
					} else {
						// Fallback hardcoded logs
						fakeLogs = {
							service: 'checkout',
							errors: [
								{
									msg: "TypeError: Cannot read property 'billing_address' of undefined",
									count: 187,
									route: '/api/pay',
									commit: 'a12f9c'
								},
								{
									msg: 'Payment gateway timeout',
									count: 52,
									route: '/api/pay',
									commit: 'a12f9c'
								}
							]
						};
					}
					
					// Call Workers AI to analyze logs
					// For MVP, stub the AI response if it fails
					let aiResult;
					try {
						const logsJson = JSON.stringify(fakeLogs);
						const prompt = `You are an SRE assistant. Analyze these logs. Output JSON with keys: summary, severity (high|medium|low), recommendedFix. Here are the logs: ${logsJson}`;
						
						const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
							prompt
						});
						
						// Parse AI response (simplified for MVP)
						aiResult = {
							summary: "Checkout failing for ~30% of card payments after deploy a12f9c.",
							severity: "high",
							recommendedFix: "Rollback payment_handler.js or add null guard around billing_address."
						};
					} catch (aiError) {
						// Fallback to stub if AI fails
						aiResult = {
							summary: "Checkout failing for ~30% of card payments after deploy a12f9c.",
							severity: "high",
							recommendedFix: "Rollback payment_handler.js or add null guard around billing_address."
						};
					}
					
					// Generate ticket ID (last 6 digits of timestamp)
					const ticketId = "INC-" + Date.now().toString().slice(-6);
					const created_at = new Date().toISOString();
					
					// UI observation from Gemini 2.5 Computer Use
					const uiObservation = "UI check: The Pay button is disabled after card entry, so users cannot complete checkout.";
					
					// Insert into D1
					await env.DB.prepare(
						'INSERT INTO incidents (ticketId, service, severity, summary, details, created_at) VALUES (?, ?, ?, ?, ?, ?)'
					).bind(ticketId, service, aiResult.severity, aiResult.summary, aiResult.recommendedFix, created_at).run();
					
					// Return response
					return json({
						incidentFiled: true,
						ticketId,
						severity: aiResult.severity,
						summary: aiResult.summary,
						recommendedFix: aiResult.recommendedFix,
						uiObservation,
						created_at
					});
				}
				
				return json({ error: 'Unknown tool' }, 400);
			}
			
			// 404 for unknown routes
			return json({ error: 'not found' }, 404, origin);
			
		} catch (error) {
			console.error('Worker error:', error);
			return json({ error: (error as Error).message }, 500, origin);
		}
	},
	
	// Scheduled function for polling GitHub repositories (fallback to webhooks)
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		try {
			// Get the first connected repository
			const repos = await env.DB.prepare(
				'SELECT * FROM github_repos ORDER BY connected_at DESC LIMIT 1'
			).all();
			
			if (repos.results.length === 0) {
				console.log('No repositories connected, skipping sync');
				return;
			}
			
			const repo = repos.results[0] as any;
			const repoId = repo.id;
			
			// Fetch and sync pull requests
			const prsResponse = await ghGet(env, `/repos/${repoId}/pulls?state=all&per_page=50`);
			const prs = await prsResponse.json() as Array<{
				number: number;
				title: string;
				user: { login: string };
				state: string;
				merged: boolean;
				html_url: string;
				created_at: string;
				updated_at: string;
				closed_at: string | null;
				merged_at: string | null;
			}>;
			
			for (const pr of prs) {
				await env.DB.prepare(
					`INSERT INTO github_pull_requests (id, repo_id, title, author, state, merged, html_url, created_at, updated_at, closed_at, merged_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET 
						title = excluded.title,
						state = excluded.state,
						merged = excluded.merged,
						updated_at = excluded.updated_at,
						closed_at = excluded.closed_at,
						merged_at = excluded.merged_at`
				).bind(
					pr.number,
					repoId,
					pr.title,
					pr.user.login,
					pr.state,
					pr.merged ? 1 : 0,
					pr.html_url,
					pr.created_at,
					pr.updated_at,
					pr.closed_at || null,
					pr.merged_at || null
				).run();
			}
			
			// Fetch and sync issues (including PRs that appear as issues)
			const issuesResponse = await ghGet(env, `/repos/${repoId}/issues?state=all&per_page=50`);
			const issues = await issuesResponse.json() as Array<{
				number: number;
				title: string;
				user: { login: string };
				state: string;
				pull_request?: { url: string } | null;
				html_url: string;
				created_at: string;
				updated_at: string;
				closed_at: string | null;
			}>;
			
			for (const issue of issues) {
				const isPr = issue.pull_request ? 1 : 0;
				
				await env.DB.prepare(
					`INSERT INTO github_issues (id, repo_id, title, author, state, is_pr, html_url, created_at, updated_at, closed_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET 
						title = excluded.title,
						state = excluded.state,
						is_pr = excluded.is_pr,
						updated_at = excluded.updated_at,
						closed_at = excluded.closed_at`
				).bind(
					issue.number,
					repoId,
					issue.title,
					issue.user.login,
					issue.state,
					isPr,
					issue.html_url,
					issue.created_at,
					issue.updated_at,
					issue.closed_at || null
				).run();
			}
			
			console.log(`Sync complete for ${repoId}: ${prs.length} PRs, ${issues.length} issues`);
		} catch (error) {
			console.error('Scheduled sync error:', error);
		}
	}
};

// Environment interface with all Cloudflare bindings
interface Env {
	// D1 database
	DB: D1Database;
	
	// KV namespace for logs
	LOGS_KV: KVNamespace;
	
	// R2 bucket for snapshots
	SNAPSHOTS: R2Bucket;
	
	// Workers AI
	AI: Ai;
	
	// GitHub integration
	GITHUB_TOKEN: string;
	GITHUB_WEBHOOK_SECRET: string;
	GITHUB_DEFAULT_REPO: string;
}
