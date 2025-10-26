-- Add GitHub linking columns to tickets table
ALTER TABLE tickets ADD COLUMN github_pr_number INTEGER NULL;
ALTER TABLE tickets ADD COLUMN github_issue_number INTEGER NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_github_pr ON tickets(github_pr_number);
CREATE INDEX IF NOT EXISTS idx_tickets_github_issue ON tickets(github_issue_number);

