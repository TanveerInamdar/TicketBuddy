# 🤠 TicketBuddy - Space Cowboy Edition 🚀

A modern ticket management system with AI-powered creation, GitHub integration, and a cosmic Space Cowboy theme! Built for [RowdyHacks](https://rowdyhacks.org/).

## ✨ Features

### 🎫 Ticket Management
- **AI-Powered Ticket Creation** - Submit requests in natural language, AI parses and creates structured tickets
- **4-Column Kanban Board** - Track tickets through Open → In Progress → QA → Resolved
- **Priority Management** - AI-driven 3-level priority system (Low, Medium, High)
- **Assignee Tracking** - Assign tickets to team members (John Doe, Sarah Wilson, Mike Johnson)
- **Analytics Dashboard** - View ticket statistics, assignee performance, and distribution charts

### 🐙 GitHub Integration
- **Repository Connection** - Link one GitHub repository at a time
- **Auto-Ticket Creation** - Automatically create tickets from GitHub issues
- **PR Management** - View, merge, and link PRs to tickets
- **Issue Management** - Create and close GitHub issues directly from the dashboard
- **Real-time Sync** - Always fetch fresh data from GitHub API

### 🤖 AI Features
- **Intelligent Ticket Parsing** - Powered by Cloudflare Workers AI (Llama 3.1)
- **Smart Copilot** - Context-aware AI assistant using Google Gemini 2.5 Flash
- **Priority Detection** - AI understands urgency from natural language
- **Structured Descriptions** - AI formats tickets with Problem, Details, Expected Outcome

### 🔐 Authentication
- **Auth0 Integration** - Secure user authentication and authorization
- **Protected Routes** - Ticket Board and GitHub pages require authentication

### 🎨 Space Cowboy Theme
- **Celestial Background** - Beautiful space-themed UI with nebulas and stars
- **Custom Fonts** - "Rye" for Western feel, "Orbitron" for futuristic look
- **Smooth Animations** - Cosmic trails, hover effects, and transitions
- **4 Easter Eggs** - Hidden interactive features (see below 🎉)

## 🎉 Easter Eggs

1. **YEEHAW Lasso** 🤠 - Type "YEEHAW" anywhere to see a spinning lasso animation with caught stars
2. **HOWDY Celebration** 🎊 - Type "HOWDY" to trigger a "LET'S GET ROWDY!" celebration
3. **Hyper-Space Mode** 🌌 - Click the logo 10 times to activate hyper-space travel animation
4. **Space Sheriff Badge** ⭐ - Hover over the "TICKETBUDDY" title for 5 seconds to unlock your badge
5. **Clickable Rocket** 🚀 - A random rocket appears every 10-20 seconds - click it to launch!

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **AI Models**: 
  - Cloudflare Workers AI (Llama 3.1 8B Instruct Fast)
  - Google Gemini 2.5 Flash
- **Authentication**: Auth0
- **GitHub API**: REST API v3

## 📋 Prerequisites

Before you begin, make sure you have:

### Required
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Cloudflare Account** - [Sign up free](https://dash.cloudflare.com/sign-up)
- **GitHub Account** - [Sign up free](https://github.com/join)
- **Auth0 Account** - [Sign up free](https://auth0.com/signup)
- **Google Cloud Account** (for Gemini API) - [Sign up](https://console.cloud.google.com/)

### API Keys & Tokens You'll Need
1. **GitHub Personal Access Token (PAT)** with `repo` scope
2. **Auth0 Domain, Client ID, and Audience**
3. **Gemini API Key** for the AI copilot

---

## 🚀 Complete Setup Guide

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd RowdyHacks
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd edge-mcp-worker
npm install
```

#### 2.2 Configure Environment Variables

Create a `.dev.vars` file in the `edge-mcp-worker` directory:

```bash
# edge-mcp-worker/.dev.vars
GITHUB_TOKEN=your_github_pat_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get these values:**

##### GitHub Personal Access Token (PAT)
1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name: `TicketBuddy`
4. Select scopes:
   - ✅ **`repo`** (Full control of private repositories)
   - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
7. Paste it into `.dev.vars` as `GITHUB_TOKEN`

##### GitHub Webhook Secret (Optional for local dev)
```bash
# For local development, use any string:
GITHUB_WEBHOOK_SECRET=local_dev_secret_12345
```

##### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select a project or create a new one
4. Copy the API key
5. Paste it into `.dev.vars` as `GEMINI_API_KEY`

#### 2.3 Setup Database

Apply all database migrations:

```bash
npx wrangler d1 migrations apply INCIDENTS_DB --local
```

You should see:
```
🌀 Executing on INCIDENTS_DB (local):
├ 0001_init.sql
├ 0002_allow_null_fields.sql
├ 0003_github_tables.sql
├ 0004_ticket_github_links.sql
└ 0005_ticket_repo_url.sql
✅ Successfully applied 5 migrations!
```

#### 2.4 Start Backend Server

```bash
npm run dev
```

The backend will be running at: **http://localhost:8787**

You should see:
```
⎔ Ready on http://127.0.0.1:8787
- D1 Database: INCIDENTS_DB
- AI: Workers AI [connected]
- GITHUB_TOKEN: "(hidden)"
- GEMINI_API_KEY: "(hidden)"
```

---

### Step 3: Frontend Setup

Open a **new terminal** window/tab.

#### 3.1 Install Dependencies

```bash
cd edge-dashboard
npm install
```

#### 3.2 Configure Auth0

Create an `auth_config.json` file in `edge-dashboard/src/`:

```json
{
  "domain": "your-auth0-domain.us.auth0.com",
  "clientId": "your-auth0-client-id",
  "audience": "https://your-auth0-domain.us.auth0.com/api/v2/"
}
```

**How to get Auth0 credentials:**

1. **Create Auth0 Application**
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Click **"Applications" → "Create Application"**
   - Name: `TicketBuddy`
   - Type: **Single Page Application**
   - Click **"Create"**

2. **Configure Application Settings**
   - **Allowed Callback URLs**: `http://localhost:5176`
   - **Allowed Logout URLs**: `http://localhost:5176`
   - **Allowed Web Origins**: `http://localhost:5176`
   - Click **"Save Changes"**

3. **Get Credentials**
   - **Domain**: Copy from "Basic Information" (e.g., `dev-xxxxx.us.auth0.com`)
   - **Client ID**: Copy from "Basic Information"
   - **Audience**: Use `https://{YOUR_DOMAIN}/api/v2/`

4. **Update `auth_config.json`** with your credentials

#### 3.3 Start Frontend Server

```bash
npm run dev
```

The frontend will be running at: **http://localhost:5176**

You should see:
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:5176/
```

---

## 🎮 Using the Application

### First Time Setup

1. **Open your browser** to `http://localhost:5176`
2. **Sign in** with Auth0 (create an account if needed)
3. You'll see the **Submit Mission Request** page (Space Cowboy themed!)

### Submitting Tickets

1. On the **Submit Mission Request** page:
   - Enter a natural language description
   - Example: *"Add a dark mode toggle to the settings page. This is urgent and needs to be done by tomorrow."*
2. Click **"Submit Mission Request"**
3. AI will parse your request and create one or more structured tickets

### Managing Tickets

1. Navigate to **"Ticket Board"**
2. View tickets in columns: Open → In Progress → QA → Resolved
3. Click **"Move Next"** to progress tickets
4. Click **"Reopen"** to move resolved tickets back to open
5. Scroll down to see **Analytics Dashboard** with charts and statistics

### GitHub Integration

1. Navigate to **"GitHub"** page
2. **Connect Repository**:
   - Enter: `owner/repo` (e.g., `octocat/Hello-World`)
   - Click **"Connect Repository"**
3. View **Issues** and **Pull Requests**
4. **Close an Issue**:
   - Click the "Close" button next to any issue
   - It will be closed on GitHub and the linked ticket updated
5. **Merge a PR**:
   - Click "Merge" next to any PR
   - Select a linked ticket (optional) - it will be marked as resolved
6. **Create an Issue**:
   - Click "Create New Issue"
   - Fill in title and description
   - It will be created on GitHub and a ticket auto-generated

### AI Copilot

1. Look for the **Space Cowboy emoji (🤠)** button in the bottom-right corner
2. Click it to open the AI assistant
3. Ask questions like:
   - "How many tickets are open?"
   - "What's the status of the GitHub integration?"
   - "Who has the most resolved tickets?"
4. The AI has context about your tickets and GitHub connection

---

## 🗂️ Project Structure

```
RowdyHacks/
├── edge-dashboard/              # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   └── Copilot.tsx     # AI assistant component
│   │   ├── pages/
│   │   │   ├── TicketSubmission.tsx
│   │   │   ├── TicketBoard.tsx
│   │   │   └── GitHubIntegration.tsx
│   │   ├── types/
│   │   │   └── ticket.ts       # TypeScript interfaces
│   │   ├── App.tsx             # Main app with routing
│   │   ├── index.css           # Tailwind + custom styles
│   │   └── auth_config.json    # Auth0 config (create this)
│   ├── package.json
│   └── vite.config.ts
│
├── edge-mcp-worker/             # Backend (Cloudflare Workers)
│   ├── src/
│   │   └── worker.ts           # Main worker with all API routes
│   ├── migrations/             # Database migrations
│   │   ├── 0001_init.sql
│   │   ├── 0002_allow_null_fields.sql
│   │   ├── 0003_github_tables.sql
│   │   ├── 0004_ticket_github_links.sql
│   │   └── 0005_ticket_repo_url.sql
│   ├── .dev.vars               # Environment variables (create this)
│   ├── package.json
│   └── wrangler.toml           # Cloudflare config
│
├── README.md                    # This file!
├── SPACE_COWBOY_EASTER_EGGS.md # Easter egg documentation
└── GEMINI_SETUP.md             # Gemini API setup guide
```

---

## 🔌 API Reference

### Ticket Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tickets` | Get all tickets |
| `POST` | `/tickets` | Create ticket(s) from natural language |
| `PATCH` | `/tickets/:id` | Update ticket status |

### GitHub Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/github/link` | Connect a GitHub repository |
| `DELETE` | `/github/link` | Disconnect current repository |
| `GET` | `/github/summary` | Get connected repo summary |
| `GET` | `/github/:owner/:name/issues` | Get repository issues |
| `POST` | `/github/:owner/:name/issues` | Create a new issue |
| `PATCH` | `/github/:owner/:name/issues/:number` | Update an issue (e.g., close) |
| `GET` | `/github/:owner/:name/prs` | Get pull requests |
| `POST` | `/github/:owner/:name/pr/:number/merge` | Merge a pull request |
| `GET` | `/github/:owner/:name/events` | Get repository events |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/copilot` | Chat with AI assistant |

---

## 📊 Database Schema

### `tickets` Table
- `id` (TEXT) - Unique ID (UUID format)
- `name` (TEXT) - Ticket title
- `description` (TEXT) - Detailed description
- `importance` (INTEGER) - 1 (Low), 2 (Medium), 3 (High)
- `status` (TEXT) - 'open', 'in-progress', 'qa', 'resolved'
- `assignee` (TEXT) - Assigned team member
- `createdAt` (TEXT) - ISO 8601 timestamp
- `updatedAt` (TEXT) - ISO 8601 timestamp
- `github_pr_number` (INTEGER) - Linked GitHub PR number
- `github_issue_number` (INTEGER) - Linked GitHub issue number
- `github_repo_url` (TEXT) - GitHub repository URL

### `github_repos` Table
- `id` (TEXT) - Repository identifier (owner/name)
- `url` (TEXT) - Full GitHub URL
- `owner` (TEXT) - Repository owner
- `name` (TEXT) - Repository name
- `created_at` (TEXT) - Connection timestamp

---

## 🚀 Deployment

### Deploy Backend to Cloudflare Workers

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Create Production D1 Database**:
   ```bash
   npx wrangler d1 create INCIDENTS_DB
   ```
   Copy the `database_id` from the output.

3. **Update `wrangler.toml`** with the database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "INCIDENTS_DB"
   database_id = "your-database-id-here"
   ```

4. **Apply Migrations to Production**:
   ```bash
   npx wrangler d1 migrations apply INCIDENTS_DB
   ```

5. **Set Production Secrets**:
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   # Paste your GitHub PAT and press Enter
   
   npx wrangler secret put GITHUB_WEBHOOK_SECRET
   # Enter a random secret string
   
   npx wrangler secret put GEMINI_API_KEY
   # Paste your Gemini API key and press Enter
   ```

6. **Deploy**:
   ```bash
   npm run deploy
   ```

7. **Note your Worker URL** (e.g., `https://edge-mcp-worker.your-subdomain.workers.dev`)

### Deploy Frontend

You can deploy the frontend to various platforms:

#### Option 1: Cloudflare Pages

```bash
cd edge-dashboard
npm run build
npx wrangler pages deploy dist --project-name ticketbuddy
```

#### Option 2: Vercel

```bash
cd edge-dashboard
npm run build
npx vercel --prod
```

#### Option 3: Netlify

```bash
cd edge-dashboard
npm run build
npx netlify deploy --prod --dir=dist
```

**Important**: Update your Auth0 application settings with the production URLs!

---

## 🛠️ Troubleshooting

### Backend Issues

#### "GitHub API error: 403 - Resource not accessible"
- **Cause**: GitHub PAT doesn't have the `repo` scope
- **Fix**: Regenerate your PAT with `repo` scope enabled

#### "AI model not found"
- **Cause**: Cloudflare Workers AI binding not configured
- **Fix**: Ensure `wrangler.toml` has the AI binding:
  ```toml
  [[ai.bindings]]
  name = "AI"
  ```

#### "Database not found"
- **Cause**: Migrations not applied
- **Fix**: Run `npx wrangler d1 migrations apply INCIDENTS_DB --local`

### Frontend Issues

#### "Access denied" after Auth0 login
- **Cause**: Auth0 callback URLs not configured
- **Fix**: Add `http://localhost:5176` to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins in Auth0 dashboard

#### CSS not loading correctly
- **Cause**: Vite build cache issue
- **Fix**: 
  ```bash
  rm -rf node_modules .vite
  npm install
  npm run dev
  ```

#### "Network Error" on GitHub page
- **Cause**: Backend not running or CORS issue
- **Fix**: Ensure backend is running on `http://localhost:8787`

### General Issues

#### Clear all processes and restart
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*wrangler*"} | Stop-Process -Force

# macOS/Linux
killall node
killall wrangler
```

Then restart both servers:
```bash
# Terminal 1
cd edge-mcp-worker && npm run dev

# Terminal 2
cd edge-dashboard && npm run dev
```

---

## 🧪 Testing

### Backend Tests

```bash
cd edge-mcp-worker
npm test
```

### Manual Testing Checklist

- [ ] Submit a natural language ticket request
- [ ] Move ticket between columns
- [ ] Connect a GitHub repository
- [ ] Close a GitHub issue
- [ ] Merge a GitHub PR
- [ ] Create a GitHub issue
- [ ] Chat with the AI copilot
- [ ] Try all 5 easter eggs!

---

## 🎨 Customization

### Change Team Members

Edit the AI system prompt in `edge-mcp-worker/src/worker.ts`:

```typescript
"assignee": "John Doe" | "Sarah Wilson" | "Mike Johnson"
```

Replace with your team member names.

### Change AI Models

**Ticket Creation AI**:
```typescript
// In worker.ts, line ~1289
const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast' as any, {
```

**Copilot AI**:
```typescript
// In worker.ts, line ~1542
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`,
```

### Customize Theme Colors

Edit `edge-dashboard/tailwind.config.js` and `edge-dashboard/src/index.css` to change the Space Cowboy color scheme.

---

## 📚 Additional Documentation

- [GitHub Permissions Guide](edge-mcp-worker/GITHUB_PERMISSIONS.md)
- [Gemini API Setup](GEMINI_SETUP.md)
- [Space Cowboy Easter Eggs](SPACE_COWBOY_EASTER_EGGS.md)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **RowdyHacks** - For the awesome hackathon theme!
- **Cloudflare** - For Workers AI and D1 Database
- **Google** - For Gemini API
- **Auth0** - For authentication services
- **GitHub** - For the amazing API

---

## 🌟 Show Your Support

If you found this project helpful, give it a ⭐️!

---

**Built with 💜 for RowdyHacks 🤠🚀**

*Remember to type "YEEHAW" and "HOWDY" for some Space Cowboy fun!*
