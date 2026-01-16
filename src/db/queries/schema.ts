import * as v from 'valibot';
import { db } from '../index.js';
import {
  SqliteTableSchema,
  SqliteColumnInfoSchema,
  SqlRowSchema,
  type SqliteTable,
  type SqliteColumnInfo,
  type SqlRow,
} from '../../types/database.js';

export function getTables(): SqliteTable[] {
  const tablesResult = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  return v.parse(v.array(SqliteTableSchema), tablesResult);
}

export function getTableColumns(tableName: string): SqliteColumnInfo[] {
  const columnsResult = db.pragma(`table_info('${tableName}')`);
  return v.parse(v.array(SqliteColumnInfoSchema), columnsResult);
}

export function runSQL(sql: string): SqlRow[] {
  const results = db.prepare(sql).all();
  return v.parse(v.array(SqlRowSchema), results);
}
