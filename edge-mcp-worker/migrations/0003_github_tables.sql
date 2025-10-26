-- GitHub repository tracking
CREATE TABLE IF NOT EXISTS github_repos (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  default_branch TEXT,
  connected_at TEXT NOT NULL
);

-- GitHub pull requests cache
CREATE TABLE IF NOT EXISTS github_pull_requests (
  id INTEGER PRIMARY KEY,
  repo_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  state TEXT NOT NULL,
  merged INTEGER NOT NULL DEFAULT 0,
  html_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT,
  merged_at TEXT,
  FOREIGN KEY (repo_id) REFERENCES github_repos(id)
);

-- GitHub issues cache
CREATE TABLE IF NOT EXISTS github_issues (
  id INTEGER PRIMARY KEY,
  repo_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  state TEXT NOT NULL,
  is_pr INTEGER NOT NULL DEFAULT 0,
  html_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT,
  FOREIGN KEY (repo_id) REFERENCES github_repos(id)
);

-- GitHub events/activity feed
CREATE TABLE IF NOT EXISTS github_events (
  id TEXT PRIMARY KEY,
  repo_id TEXT NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (repo_id) REFERENCES github_repos(id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_pr_repo ON github_pull_requests(repo_id);
CREATE INDEX IF NOT EXISTS idx_pr_state ON github_pull_requests(state);
CREATE INDEX IF NOT EXISTS idx_issue_repo ON github_issues(repo_id);
CREATE INDEX IF NOT EXISTS idx_issue_state ON github_issues(state);
CREATE INDEX IF NOT EXISTS idx_events_repo ON github_events(repo_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON github_events(type);

