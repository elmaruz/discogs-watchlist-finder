import { getTables, getTableColumns, runSQL } from '../db/queries/index.js';
import { type SqliteTable, type SqlRow } from '../types/database.js';

function formatTables(tables: SqliteTable[]): string {
  const formatted = tables
    .map((table) => {
      const columns = getTableColumns(table.name);
      const cols = columns.map((c) => `  ${c.name} ${c.type}`).join('\n');
      return `${table.name}:\n${cols}`;
    })
    .join('\n\n');

  return `${formatted}`;
}

export function getSchemaText(): string {
  const tables = getTables();

  return `${formatTables(tables)}

Relationships:
- listings.seller_id → sellers.seller_id
- listings.release_id → wantlist.release_id
- wantlist.user_id → users.user_id

Context:
- SQLite database with data for ONE user only
- The wantlist table contains all releases the user wants
- Do NOT filter by user_id - all data belongs to the same user`;
}

function validateSqlQuery(sql: string) {
  const lower = sql.toLowerCase().trim();
  if (
    !lower.startsWith('select') &&
    !lower.startsWith('with') &&
    !lower.startsWith('explain')
  ) {
    throw new Error(
      `Only read-only queries allowed. Generated SQL: ${sql.substring(0, 100)}`
    );
  }
}

export function executeSQL(sql: string): SqlRow[] {
  validateSqlQuery(sql);
  return runSQL(sql);
}
