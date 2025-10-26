# Edge MCP Worker

Cloudflare Worker acting as MCP server for AI-powered incident management.

## Setup

### Install Dependencies

```bash
npm install
```

### Create D1 Database

```bash
# Create the database
wrangler d1 create INCIDENTS_DB

# Apply migrations locally
wrangler d1 migrations apply INCIDENTS_DB --local

# Verify the schema
wrangler d1 execute INCIDENTS_DB --local --command "SELECT * FROM incidents;"
```

### Development

```bash
# Start local dev server
npm run dev

# Deploy to Cloudflare
npm run deploy

# Tail logs
npm run tail
```

## Database Schema

The `incidents` table stores incident records:

- `ticketId` (TEXT, PRIMARY KEY) - Unique incident ID like "INC-1425"
- `service` (TEXT) - Service name like "checkout"
- `severity` (TEXT) - "high", "medium", or "low"
- `summary` (TEXT) - Human-readable summary
- `details` (TEXT, optional) - Additional details
- `created_at` (TEXT) - ISO timestamp

## Architecture

This Worker provides:
- `POST /mcp/call-tool` - Execute MCP tool calls
- `GET /incidents` - Retrieve incident list

Bindings:
- `DB` - D1 database for incidents
- `LOGS_KV` - KV namespace for error logs
- `SNAPSHOTS` - R2 bucket for UI snapshots
- `AI` - Workers AI for log analysis

