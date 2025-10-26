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

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

The test suite includes:
- ✅ Happy-path tests for GitHub integration
- ✅ Webhook signature verification
- ✅ PR merge functionality
- ✅ Error handling for branch protection
- ✅ Outdated SHA detection

See `src/worker.test.ts` for detailed test cases.

## GitHub Integration

### Setup Requirements

**See [GITHUB_PERMISSIONS.md](./GITHUB_PERMISSIONS.md) for complete setup guide.**

#### Quick Setup:
1. **Generate Personal Access Token (PAT):**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Add to Cloudflare Worker:
     ```bash
     wrangler secret put GITHUB_TOKEN
     ```

2. **Generate Webhook Secret:**
   ```bash
   openssl rand -hex 32
   ```
   - Add to GitHub webhook configuration
   - Add to Cloudflare Worker:
     ```bash
     wrangler secret put GITHUB_WEBHOOK_SECRET
     ```

3. **Configure Webhook:**
   - Repository → Settings → Webhooks → Add webhook
   - URL: `https://your-worker.workers.dev/github/webhook`
   - Content type: `application/json`
   - Secret: (your generated secret)
   - Events: Pull requests, Issues

### GitHub API Endpoints

#### Repository Management:
- `POST /github/link` - Link a GitHub repository
- `GET /github/summary` - Get integration summary

#### Pull Requests:
- `GET /github/:owner/:name/prs` - List PRs
- `GET /github/:owner/:name/pr/:number` - Get single PR
- `POST /github/:owner/:name/pr/:number/merge` - Merge PR (+ optional ticket link)

#### Issues:
- `GET /github/:owner/:name/issues` - List issues
- `POST /github/:owner/:name/issues` - Create issue
- `PATCH /github/:owner/:name/issues/:number` - Update issue
- `POST /github/:owner/:name/issues/:number/comment` - Add comment

#### Events:
- `GET /github/:owner/:name/events` - List repository events (paginated)

#### Webhooks:
- `POST /github/webhook` - Receive GitHub webhooks (secured with HMAC)

### Error Handling

The integration provides clear error messages for:
- Branch protection blocking merge: "Required status checks must pass"
- Missing reviews: "Required reviews must be approved"
- Outdated branch: "Head branch was modified. Review and try again."
- Merge conflicts: "Pull Request is not mergeable"

## Architecture

This Worker provides a complete backend for functionality request management:
- RESTful API for ticket CRUD operations
- CORS-enabled for frontend integration
- AI-powered analysis capabilities
- Real-time status updates
- Scalable Cloudflare infrastructure
- **GitHub integration for PR/Issue tracking**
- **Webhook support for real-time GitHub events**
- **Ticket-to-PR linking for workflow automation**

