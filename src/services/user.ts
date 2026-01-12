import { discogs } from '../clients/index.js';
import type { DiscogsUserProfile } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertUser } from '../db/queries/index.js';

export async function fetchAndStoreUser(username: string): Promise<number> {
  try {
    const res = await discogs.get<DiscogsUserProfile>(
      `/users/${username}`
    );

    const user = res.data;

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
  } catch (error: unknown) {
    handleApiError(error, `Fetching user profile for "${username}"`, {
      throwOnNon404: true,
    });
    throw error;
  }
}
