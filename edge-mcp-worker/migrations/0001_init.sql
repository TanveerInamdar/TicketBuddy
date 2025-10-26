-- Incident tracking table
CREATE TABLE IF NOT EXISTS incidents (
  ticketId TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  severity TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);

