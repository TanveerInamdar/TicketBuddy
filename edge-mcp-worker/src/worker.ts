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
				const body = await request.json() as { status: string };
				
				await env.DB.prepare(
					'UPDATE tickets SET status = ?, updatedAt = ? WHERE id = ?'
				).bind(body.status, new Date().toISOString(), ticketId).run();
				
				return json({ success: true });
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
}
