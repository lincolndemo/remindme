export const CREATE_REMINDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS reminders (
    id          TEXT PRIMARY KEY NOT NULL,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    due_date    TEXT NOT NULL,
    amount      REAL,
    currency    TEXT,
    contact     TEXT,
    lead_times  TEXT NOT NULL DEFAULT '[]',
    notes       TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    calendar_event_id TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
`;

export const CREATE_META_TABLE = `
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`;

export const DB_NAME = 'remindmejo.db';
export const CURRENT_DB_VERSION = 1;
