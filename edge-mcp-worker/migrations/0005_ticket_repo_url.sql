-- Add GitHub repository URL to tickets table
ALTER TABLE tickets ADD COLUMN github_repo_url TEXT NULL;

-- Create index for faster lookups by repo + issue
CREATE INDEX IF NOT EXISTS idx_tickets_repo_issue ON tickets(github_repo_url, github_issue_number);

