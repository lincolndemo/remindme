import * as SQLite from 'expo-sqlite';
import { CREATE_META_TABLE, CREATE_REMINDERS_TABLE, DB_NAME } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(_db);
  return _db;
}

async function getVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  await db.execAsync(CREATE_META_TABLE);
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'db_version'`
  );
  return row ? parseInt(row.value, 10) : 0;
}

async function setVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO meta (key, value) VALUES ('db_version', ?)`,
    [String(version)]
  );
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const version = await getVersion(db);
  if (version < 1) {
    await db.execAsync(CREATE_REMINDERS_TABLE);
    await setVersion(db, 1);
  }
  if (version < 2) {
    await db.execAsync(
      `ALTER TABLE reminders ADD COLUMN notification_ids TEXT NOT NULL DEFAULT '[]'`
    );
    await setVersion(db, 2);
  }
}
