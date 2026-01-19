import { db } from '../index.js';
import type { Nullable } from '../../types/database.js';

export function insertUser(
  userId: number,
  username: string,
  name: Nullable<string>,
  profile: Nullable<string>,
  registered: Nullable<string>,
  numWantlist: Nullable<number>,
  numCollection: Nullable<number>
): void {
  db.prepare(
    `
    INSERT OR REPLACE INTO users
    (user_id, username, name, profile, registered, num_wantlist, num_collection)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(userId, username, name, profile, registered, numWantlist, numCollection);
}
