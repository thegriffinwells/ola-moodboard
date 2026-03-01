import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:data/moodboard.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const initialized = db.batch([
  {
    sql: `CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      grid_cols INTEGER NOT NULL DEFAULT 3,
      grid_rows INTEGER NOT NULL DEFAULT 1,
      grid_label TEXT NOT NULL DEFAULT '3 per page',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    args: [],
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS board_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL DEFAULT '',
      category TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`,
    args: [],
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      image_id INTEGER NOT NULL REFERENCES board_images(id) ON DELETE CASCADE,
      selected INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(board_id, image_id)
    )`,
    args: [],
  },
]);

export async function getDb() {
  await initialized;
  return db;
}
