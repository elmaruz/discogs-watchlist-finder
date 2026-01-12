import Database from 'better-sqlite3';
import fs from 'fs';

const path = `snapshots/discogs_snapshot.sqlite`;

fs.mkdirSync('snapshots', { recursive: true });

export const db = new Database(path);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema(): void {
  const schema = fs.readFileSync('src/schema.sql', 'utf8');
  db.exec(schema);
}

export function clearSnapshot(): void {
  console.log('🗑️  Clearing previous snapshot...');
  db.exec(`
    DELETE FROM listings;
    DELETE FROM sellers;
    DELETE FROM wantlist;
    DELETE FROM users;
  `);
  console.log('✔ Previous snapshot cleared');
}

console.log(`📦 Snapshot DB created: ${path}`);
