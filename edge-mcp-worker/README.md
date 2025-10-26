# TicketBuddy Backend (Edge MCP Worker)

Cloudflare Worker backend for the TicketBuddy application - a functionality request management system with AI-powered ticket creation.

## Quick Start

### 1. Install Dependencies
```bash
cd edge-mcp-worker
npm install
```

### 2. Set Up Database
```bash
# Apply database migrations locally
npx wrangler d1 migrations apply INCIDENTS_DB --local

# Verify tables were created
npx wrangler d1 execute INCIDENTS_DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 3. Start Development Server
```bash
npm run dev
```

The backend will be available at `http://localhost:8787`

## Complete Setup Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for production deployment)

### Database Setup

The application uses Cloudflare D1 (SQLite) database with two main tables:

#### Tickets Table (Primary)
- `id` (TEXT, PRIMARY KEY) - Unique ticket ID like "TICKET-123456"
- `name` (TEXT) - Functionality request name
- `description` (TEXT) - Detailed description of the request
- `importance` (INTEGER) - Priority level (1=Low, 2=Medium, 3=High)
- `status` (TEXT) - Current status (open, in-progress, qa, resolved)
- `assignee` (TEXT) - Person assigned to the ticket
- `createdAt` (TEXT) - ISO timestamp when created
- `updatedAt` (TEXT) - ISO timestamp when last updated

#### Incidents Table (Legacy)
- `ticketId` (TEXT, PRIMARY KEY) - Unique incident ID like "INC-1425"
- `service` (TEXT) - Service name like "checkout"
- `severity` (TEXT) - "high", "medium", or "low"
- `summary` (TEXT) - Human-readable summary
- `details` (TEXT, optional) - Additional details
- `created_at` (TEXT) - ISO timestamp

### API Endpoints

#### Ticket Management
- `GET /tickets` - Retrieve all tickets
- `POST /tickets` - Create new functionality request
- `PATCH /tickets/:id` - Update ticket status

#### Health & Monitoring
- `GET /health` - Health check endpoint

#### Legacy Endpoints
- `GET /incidents` - Retrieve incident list (legacy)
- `POST /mcp/call-tool` - AI tool integration

### Development Commands

```bash
# Start local development server
npm run dev

# Apply database migrations
npx wrangler d1 migrations apply INCIDENTS_DB --local

# Execute SQL commands
npx wrangler d1 execute INCIDENTS_DB --local --command "SELECT * FROM tickets;"

# Deploy to Cloudflare (production)
npm run deploy

# View live logs
npm run tail
```

### Frontend Integration

The backend is designed to work with the React frontend:

1. **Frontend URL**: `http://localhost:5173` (or 5174)
2. **Backend URL**: `http://localhost:8787`
3. **API Base**: Set `VITE_API_BASE=http://localhost:8787` in frontend

### Environment Variables

The worker uses these Cloudflare bindings:
- `DB` - D1 database for tickets and incidents
- `LOGS_KV` - KV namespace for error logs
- `SNAPSHOTS` - R2 bucket for UI snapshots
- `AI` - Workers AI for log analysis

### Database Migrations

Migrations are located in `migrations/0001_init.sql` and include:
- Creation of `tickets` table for functionality requests
- Creation of `incidents` table for legacy compatibility
- Proper indexing and constraints

### Troubleshooting

**Database Issues:**
```bash
# Reset local database
npx wrangler d1 migrations apply INCIDENTS_DB --local --force

# Check database schema
npx wrangler d1 execute INCIDENTS_DB --local --command "PRAGMA table_info(tickets);"
```

**Development Issues:**
```bash
# Clear Wrangler cache
rm -rf .wrangler

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Architecture

This Worker provides a complete backend for functionality request management:
- RESTful API for ticket CRUD operations
- CORS-enabled for frontend integration
- AI-powered analysis capabilities
- Real-time status updates
- Scalable Cloudflare infrastructure

