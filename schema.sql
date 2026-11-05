-- Cloudflare D1 SQLite Schema for OpenChat
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  senderName TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT DEFAULT 'text',
  avatarColor TEXT DEFAULT '#3b82f6'
);

CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp ASC);
