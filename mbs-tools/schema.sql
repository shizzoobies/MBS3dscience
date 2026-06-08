CREATE TABLE IF NOT EXISTS tools (
  slug       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  enabled    INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS access_links (
  id           TEXT PRIMARY KEY,
  token_hash   TEXT NOT NULL UNIQUE,   -- sha256 hex of the raw token; raw is never stored
  label        TEXT,                   -- who this link is for, free text
  tool_slug    TEXT,                   -- NULL means all tools
  expires_at   INTEGER,                -- epoch ms, NULL means no expiry
  revoked      INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  last_used_at INTEGER
);

CREATE TABLE IF NOT EXISTS tool_data (
  slug       TEXT PRIMARY KEY,
  json       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_hash ON access_links(token_hash);

INSERT OR IGNORE INTO tools (slug, name, enabled, created_at)
VALUES ('pricing', 'Pharmacy Pricing Reference', 1, unixepoch() * 1000);
