import Database, { type Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const dbPath = path.join(rootDir, 'snapshots/discogs_snapshot.sqlite');

fs.mkdirSync(path.join(rootDir, 'snapshots'), { recursive: true });

export const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema(): void {
  const schemaPath = path.join(import.meta.dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

export function clearSnapshot(): void {
  console.log('🗑️  Clearing previous snapshot...');
  db.exec(`
    DROP TABLE IF EXISTS listings;
    DROP TABLE IF EXISTS sellers;
    DROP TABLE IF EXISTS wantlist;
    DROP TABLE IF EXISTS releases;
    DROP TABLE IF EXISTS users;
  `);
  initSchema();
  console.log('✔ Previous snapshot cleared');
}

console.log(`📦 Snapshot DB created: ${dbPath}`);
