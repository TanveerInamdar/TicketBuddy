#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// API base URL - default to local development
const API_BASE = process.env.TICKETBUDDY_API || 'http://localhost:8787';

interface Ticket {
  id: string;
  name: string | null;
  description: string;
  importance: 1 | 2 | 3 | null;
  status: 'open' | 'in-progress' | 'qa' | 'resolved';
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  github_pr_number: number | null;
  github_issue_number: number | null;
  github_repo_url: string | null;
}

interface GitHubSummary {
  connected: boolean;
  repo?: string;
  url?: string;
  prs: number;
  issues: number;
}

// Helper function to make API calls
async function apiCall(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${path}`;
  console.error(`[API Call] ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error] ${response.status}: ${errorText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Helper to parse repo full_name into owner/name
function parseRepo(repo: string): { owner: string; name: string } {
  const parts = repo.split('/');
  if (parts.length !== 2) {
    throw new Error(`Invalid repo format: ${repo}. Expected format: owner/name`);
  }
  return { owner: parts[0], name: parts[1] };
}

// Define available tools
const tools: Tool[] = [
  {
    name: 'list_tickets',
    description: 'List all tickets in the system',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_ticket',
    description: 'Create a new ticket with AI-powered analysis',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the functionality or issue',
        },
      },
      required: ['description'],
    },
  },
  {
    name: 'update_ticket_status',
    description: 'Update the status of a ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'string', description: 'Ticket ID' },
        status: {
          type: 'string',
          enum: ['open', 'in-progress', 'qa', 'resolved'],
          description: 'New status',
        },
      },
      required: ['ticket_id', 'status'],
    },
  },
  {
    name: 'update_ticket_priority',
    description: 'Update the priority/importance of a ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'string', description: 'Ticket ID' },
        priority: {
          type: 'number',
          enum: [1, 2, 3],
          description: 'Priority level (1=Low, 2=Medium, 3=High)',
        },
      },
      required: ['ticket_id', 'priority'],
    },
  },
  {
    name: 'assign_ticket',
    description: 'Assign a ticket to a team member',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'string', description: 'Ticket ID' },
        assignee: { type: 'string', description: 'Team member name' },
      },
      required: ['ticket_id', 'assignee'],
    },
  },
  {
    name: 'github_link_repo',
    description: 'Link a GitHub repository (format: owner/name)',
    inputSchema: {
      type: 'object',
      properties: {
        repo_url: {
          type: 'string',
          description: 'GitHub repository URL or full_name (owner/name)',
        },
      },
      required: ['repo_url'],
    },
  },
  {
    name: 'github_summary',
    description: 'Get GitHub integration summary',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'github_list_issues',
    description: 'List issues from the linked GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        repo: {
          type: 'string',
          description: 'Repository full_name (owner/name)',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Issue state filter',
        },
      },
      required: ['repo'],
    },
  },
  {
    name: 'github_list_prs',
    description: 'List pull requests from the linked GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        repo: {
          type: 'string',
          description: 'Repository full_name (owner/name)',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'PR state filter',
        },
      },
      required: ['repo'],
    },
  },
  {
    name: 'github_create_issue',
    description: 'Create a new GitHub issue',
    inputSchema: {
      type: 'object',
      properties: {
        repo: {
          type: 'string',
          description: 'Repository full_name (owner/name)',
        },
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue description' },
      },
      required: ['repo', 'title', 'body'],
    },
  },
  {
    name: 'github_close_issue',
    description: 'Close a GitHub issue',
    inputSchema: {
      type: 'object',
      properties: {
        repo: {
          type: 'string',
          description: 'Repository full_name (owner/name)',
        },
        issue_number: { type: 'number', description: 'Issue number' },
      },
      required: ['repo', 'issue_number'],
    },
  },
  {
    name: 'github_merge_pr',
    description: 'Merge a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        repo: {
          type: 'string',
          description: 'Repository full_name (owner/name)',
        },
        pr_number: { type: 'number', description: 'PR number' },
        merge_method: {
          type: 'string',
          enum: ['merge', 'squash', 'rebase'],
          description: 'Merge method',
        },
      },
      required: ['repo', 'pr_number'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'ticketbuddy',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'list_tickets': {
        const data = await apiCall('/tickets');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data.tickets, null, 2),
            },
          ],
        };
      }

      case 'create_ticket': {
        const data = await apiCall('/tickets', {
          method: 'POST',
          body: JSON.stringify({ description: (args as any).description }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Created ${data.count} ticket(s):\n${JSON.stringify(data.tickets, null, 2)}`,
            },
          ],
        };
      }

      case 'update_ticket_status': {
        await apiCall(`/tickets/${(args as any).ticket_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: (args as any).status }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Updated ticket ${(args as any).ticket_id} status to ${(args as any).status}`,
            },
          ],
        };
      }

      case 'update_ticket_priority': {
        await apiCall(`/tickets/${(args as any).ticket_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ importance: (args as any).priority }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Updated ticket ${(args as any).ticket_id} priority to ${(args as any).priority}`,
            },
          ],
        };
      }

      case 'assign_ticket': {
        await apiCall(`/tickets/${(args as any).ticket_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ assignee: (args as any).assignee }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Assigned ticket ${(args as any).ticket_id} to ${(args as any).assignee}`,
            },
          ],
        };
      }

      case 'github_link_repo': {
        const data = await apiCall('/github/link', {
          method: 'POST',
          body: JSON.stringify({ repo_url: (args as any).repo_url }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Linked repository: ${data.repo.id}\n${JSON.stringify(data.repo, null, 2)}`,
            },
          ],
        };
      }

      case 'github_summary': {
        const data = await apiCall('/github/summary');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'github_list_issues': {
        const { owner, name } = parseRepo((args as any).repo);
        const state = (args as any).state || 'open';
        const data = await apiCall(`/github/${owner}/${name}/issues?state=${state}`);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${data.issues.length} issues:\n${JSON.stringify(data.issues, null, 2)}`,
            },
          ],
        };
      }

      case 'github_list_prs': {
        const { owner, name } = parseRepo((args as any).repo);
        const state = (args as any).state || 'open';
        const data = await apiCall(`/github/${owner}/${name}/prs?state=${state}`);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${data.prs.length} pull requests:\n${JSON.stringify(data.prs, null, 2)}`,
            },
          ],
        };
      }

      case 'github_create_issue': {
        const { owner, name } = parseRepo((args as any).repo);
        const data = await apiCall(`/github/${owner}/${name}/issues`, {
          method: 'POST',
          body: JSON.stringify({
            title: (args as any).title,
            body: (args as any).body,
          }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Created issue #${data.issue.number}:\n${JSON.stringify(data.issue, null, 2)}`,
            },
          ],
        };
      }

      case 'github_close_issue': {
        const { owner, name } = parseRepo((args as any).repo);
        const data = await apiCall(`/github/${owner}/${name}/issues/${(args as any).issue_number}`, {
          method: 'PATCH',
          body: JSON.stringify({ state: 'closed' }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Closed issue #${(args as any).issue_number}:\n${JSON.stringify(data.issue, null, 2)}`,
            },
          ],
        };
      }

      case 'github_merge_pr': {
        const { owner, name } = parseRepo((args as any).repo);
        const data = await apiCall(`/github/${owner}/${name}/pr/${(args as any).pr_number}/merge`, {
          method: 'POST',
          body: JSON.stringify({
            merge_method: (args as any).merge_method || 'merge',
          }),
        });
        return {
          content: [
            {
              type: 'text',
              text: `Merged PR #${(args as any).pr_number}:\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TicketBuddy MCP Server running on stdio');
  console.error(`API Base: ${API_BASE}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

