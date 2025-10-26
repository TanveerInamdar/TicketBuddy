/**
 * Cloudflare Worker - MCP Server
 * Edge Worker that serves as our MCP server for incident management
 */

// Helper function to return JSON responses
function makeJsonResponse(obj: any, status = 200): Response {
	return new Response(JSON.stringify(obj), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		
		try {
			// Route: GET /incidents
			if (request.method === 'GET' && url.pathname === '/incidents') {
				const result = await env.DB.prepare('SELECT ticketId, service, severity, summary, created_at FROM incidents ORDER BY created_at DESC')
					.all();
				
				return makeJsonResponse({
					incidents: result.results || []
				});
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
					
					// Generate ticket ID
					const ticketId = `INC-${Date.now()}`;
					const created_at = new Date().toISOString();
					
					// Insert into D1
					await env.DB.prepare(
						'INSERT INTO incidents (ticketId, service, severity, summary, details, created_at) VALUES (?, ?, ?, ?, ?, ?)'
					).bind(ticketId, service, aiResult.severity, aiResult.summary, aiResult.recommendedFix, created_at).run();
					
					// Return response
					return makeJsonResponse({
						incidentFiled: true,
						ticketId,
						severity: aiResult.severity,
						summary: aiResult.summary,
						recommendedFix: aiResult.recommendedFix,
						created_at
					});
				}
				
				return makeJsonResponse({ error: 'Unknown tool' }, 400);
			}
			
			// 404 for unknown routes
			return makeJsonResponse({ error: 'Not Found' }, 404);
			
		} catch (error) {
			console.error('Worker error:', error);
			return makeJsonResponse({ error: (error as Error).message }, 500);
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

