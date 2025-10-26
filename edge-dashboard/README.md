# Edge Dashboard

React + Vite + TypeScript dashboard for AI-powered incident management.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This dashboard is designed to be deployed to Cloudflare Pages.

```bash
# Build the project
npm run build

# Deploy with Wrangler
wrangler pages deploy dist
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## Features

- **Incident List**: Displays all incidents from D1
- **Run Diagnostic**: Triggers the MCP server to analyze logs and create incidents
- **AI Assistant Panel**: Shows AI-generated analysis and recommendations

