import { discogs } from '../clients/index.js';
import { DiscogsUserProfileSchema } from '../types/discogs.js';
import { insertUser } from '../db/queries/index.js';
import { validate } from '../utils/validation.js';

export async function fetchAndStoreUser(username: string): Promise<number> {
  const res = await discogs.get(`/users/${username}`);

  const user = validate(
    DiscogsUserProfileSchema,
    res.data,
    `User profile for "${username}"`
  );

  insertUser(
    user.id,
    user.username,
    user.name,
    user.profile,
    user.registered,
    user.num_wantlist,
    user.num_collection
  );

  console.log(`✔ User ${username} (ID: ${user.id}) stored`);
  return user.id;
}
