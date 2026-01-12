import * as v from 'valibot';
import { discogs } from '../clients/index.js';
import { DiscogsUserProfileSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertUser } from '../db/queries/index.js';

export async function fetchAndStoreUser(username: string): Promise<number> {
  try {
    const res = await discogs.get(`/users/${username}`);

    const result = v.safeParse(DiscogsUserProfileSchema, res.data);

    if (!result.success) {
      console.error(`❌ Validation Error: User profile for "${username}"`);
      console.error('Parse errors:', v.flatten(result.issues));
      throw new Error(`Failed to parse user profile`);
    }

    const user = result.output;

    insertUser.run(
      user.id,
      user.username,
      user.name ?? null,
      user.profile ?? null,
      user.registered ?? null,
      user.num_wantlist ?? null,
      user.num_collection ?? null
    );

    console.log(`✔ User ${username} (ID: ${user.id}) stored`);
    return user.id;
  } catch (error) {
    handleApiError(error, `Fetching user profile for "${username}"`, {
      throwOnNon404: true,
    });
    throw error;
  }
}
