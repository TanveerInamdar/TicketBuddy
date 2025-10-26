-- Incident tracking table (legacy, kept for compatibility)
CREATE TABLE IF NOT EXISTS incidents (
  ticketId TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  severity TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);

-- Tickets table (new structure)
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  importance INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  assignee TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

