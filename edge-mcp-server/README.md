# TicketBuddy MCP Server

Model Context Protocol (MCP) server for TicketBuddy - enables Claude Desktop to interact with your ticket management system and GitHub integration.

## Features

Claude Desktop can now:
- 📋 List, create, and manage tickets
- 👥 Assign tickets to team members
- 🔢 Update ticket priorities and statuses
- 🔗 Connect to GitHub repositories
- 📊 View GitHub PR and issue summaries
- ✅ Create and close GitHub issues
- 🚀 Merge pull requests
- 🎯 Link tickets to PRs automatically

## Prerequisites

- Node.js 20+ installed
- TicketBuddy backend running (default: `http://localhost:8787`)
- Claude Desktop installed

## Installation

```bash
cd edge-mcp-server
npm install
npm run build
```

## Configuration for Claude Desktop

### 1. Locate Claude Desktop Config

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Add TicketBuddy MCP Server

Edit the config file and add:

```json
{
  "mcpServers": {
    "ticketbuddy": {
      "command": "node",
      "args": [
        "C:\\RowdyHacks\\edge-mcp-server\\dist\\index.js"
      ],
      "env": {
        "TICKETBUDDY_API": "http://localhost:8787"
      }
    }
  }
}
```

**Notes:**
- Replace the path with your actual path to `dist/index.js`
- Use absolute paths (not relative)
- On Windows, use double backslashes (`\\`) in paths
- For production, change `TICKETBUDDY_API` to your deployed worker URL

### 3. Restart Claude Desktop

Close and reopen Claude Desktop completely for the changes to take effect.

## Usage

Once configured, you can ask Claude to:

```
"List all open tickets"
"Create a ticket to add dark mode to the dashboard"
"Assign ticket TICKET-123456 to Sarah Wilson"
"Update ticket TICKET-123456 priority to high"
"Link GitHub repo TanveerInamdar/TicketBuddy"
"List all open issues from TanveerInamdar/TicketBuddy"
"Create a GitHub issue: Fix login bug"
"Close issue #42"
"Merge PR #15"
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_tickets` | View all tickets |
| `create_ticket` | Create tickets from natural language |
| `update_ticket_status` | Change ticket status (open/in-progress/qa/resolved) |
| `update_ticket_priority` | Set priority (1=Low, 2=Medium, 3=High) |
| `assign_ticket` | Assign to team member |
| `github_link_repo` | Connect GitHub repository (owner/name format) |
| `github_summary` | View connection status |
| `github_list_issues` | List GitHub issues |
| `github_list_prs` | List pull requests |
| `github_create_issue` | Create new GitHub issue |
| `github_close_issue` | Close an issue |
| `github_merge_pr` | Merge a pull request |

## Troubleshooting

### MCP Server Not Showing Up

1. Check Claude Desktop logs (Help → View Logs)
2. Verify the path to `dist/index.js` is correct and absolute
3. Ensure `npm run build` completed successfully
4. Restart Claude Desktop completely

### API Connection Errors

1. Verify backend is running: `http://localhost:8787/health`
2. Check `TICKETBUDDY_API` environment variable in config
3. Review Claude Desktop logs for error messages

### Tool Call Failures

1. **"No fields to update"**: The MCP server is sending the correct field now (assignee)
2. **"404 not found"**: The repository format is now correct (owner/name)
3. **Database errors**: Restart the backend with `npm run dev`

## Development

Watch mode for auto-rebuild:
```bash
npm run dev
```

Test the MCP server manually:
```bash
node dist/index.js
```

## Environment Variables

- `TICKETBUDDY_API`: Backend API URL (default: `http://localhost:8787`)

## Repository Format

When using GitHub tools, always provide the repository in `owner/name` format:
- ✅ Correct: `TanveerInamdar/TicketBuddy`
- ❌ Wrong: `https://github.com/TanveerInamdar/TicketBuddy`

## License

MIT

