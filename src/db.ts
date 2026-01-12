import Database from 'better-sqlite3';
import fs from 'fs';

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const path = `snapshots/discogs_snapshot_${ts}.sqlite`;

fs.mkdirSync('snapshots', { recursive: true });

export const db = new Database(path);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema(): void {
  const schema = fs.readFileSync('src/schema.sql', 'utf8');
  db.exec(schema);
}

console.log(`📦 Snapshot DB created: ${path}`);
