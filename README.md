# TicketBuddy

A modern functionality request management system with AI-powered ticket creation and real-time status tracking.

## 🚀 Features

- **Functionality Request Submission** - Submit detailed functionality requests
- **4-Column Kanban Board** - Track tickets through Open → In Progress → QA → Resolved
- **Real-time Status Updates** - Move tickets between columns with instant updates
- **Priority Management** - 3-level priority system (Low, Medium, High)
- **Assignee Tracking** - Assign tickets to team members
- **Modern UI** - Responsive design with dark theme
- **AI Integration** - Backend ready for AI-powered ticket analysis

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + D1 Database
- **Database**: SQLite (Cloudflare D1)
- **Deployment**: Cloudflare Workers

## 📁 Project Structure

```
TicketBuddy/
├── edge-dashboard/          # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Main pages
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── edge-mcp-worker/        # Cloudflare Worker backend
│   ├── src/worker.ts       # Main worker code
│   ├── migrations/         # Database migrations
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for production)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd edge-mcp-worker

# Install dependencies
npm install

# Set up database
npx wrangler d1 migrations apply INCIDENTS_DB --local

# Start development server
npm run dev
```

Backend will be available at `http://localhost:8787`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd edge-dashboard

# Install dependencies
npm install

# Start development server
npm run dev -- --port 5176
```

Frontend will be available at `http://localhost:5173`

## 🎯 Usage

### Submitting Functionality Requests

1. Navigate to the "Submit Request" page
2. Fill out the form:
   - **Functionality Name**: Brief title of the request
   - **Description**: Detailed description of what you want
   - **Importance Level**: 1 (Low) to 3 (High)
   - **Assignee**: Person responsible for implementation
3. Click "Submit Functionality Request"

### Managing Tickets

1. Go to the "Ticket Board" page
2. View tickets in 4 columns:
   - **Open**: New requests
   - **In Progress**: Currently being worked on
   - **QA**: Ready for testing
   - **Resolved**: Completed
3. Use "Move Next" button to progress tickets
4. Use "Reopen" button to move resolved tickets back to open

## 🔧 Development

### Backend Development

```bash
cd edge-mcp-worker

# Start dev server
npm run dev

# Apply database migrations
npx wrangler d1 migrations apply INCIDENTS_DB --local

# Execute SQL queries
npx wrangler d1 execute INCIDENTS_DB --local --command "SELECT * FROM tickets;"

# Deploy to production
npm run deploy
```

### Frontend Development

```bash
cd edge-dashboard

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Database Schema

### Tickets Table
- `id` - Unique ticket ID (TICKET-123456)
- `name` - Functionality request name
- `description` - Detailed description
- `importance` - Priority level (1-3)
- `status` - Current status (open, in-progress, qa, resolved)
- `assignee` - Assigned team member
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🔌 API Endpoints

### Ticket Management
- `GET /tickets` - Get all tickets
- `POST /tickets` - Create new ticket
- `PATCH /tickets/:id` - Update ticket status

### Health Check
- `GET /health` - Backend health status

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

### Backend Deployment
The backend is deployed to Cloudflare Workers:

```bash
cd edge-mcp-worker
npm run deploy
```

## 🛠️ Troubleshooting

### Database Issues
```bash
# Reset local database
npx wrangler d1 migrations apply INCIDENTS_DB --local --force

# Check database schema
npx wrangler d1 execute INCIDENTS_DB --local --command "PRAGMA table_info(tickets);"
```

### Development Issues
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Clear Wrangler cache
rm -rf .wrangler
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the README files in each directory
3. Open an issue on GitHub
