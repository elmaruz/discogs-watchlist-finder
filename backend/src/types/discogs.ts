import * as v from 'valibot';

export const DiscogsPaginationSchema = v.object({
  page: v.number(),
  pages: v.number(),
  per_page: v.number(),
  items: v.number(),
});

export const DiscogsArtistSchema = v.object({
  name: v.string(),
});

export const DiscogsLabelSchema = v.object({
  name: v.string(),
  catno: v.string(),
});

export const DiscogsGenreSchema = v.object({
  genreId: v.number(),
  name: v.string(),
});

export const DiscogsReleaseBasicSchema = v.object({
  id: v.number(),
  title: v.string(),
  year: v.nullable(v.number()),
  thumb: v.optional(v.string()),
  artists: v.nullable(v.array(DiscogsArtistSchema)),
  labels: v.nullable(v.array(DiscogsLabelSchema)),
});

export const DiscogsWantSchema = v.object({
  basic_information: DiscogsReleaseBasicSchema,
});

export const DiscogsWantlistResponseSchema = v.object({
  pagination: DiscogsPaginationSchema,
  wants: v.array(DiscogsWantSchema),
});

export const DiscogsListingSchema = v.object({
  itemId: v.number(),
  price: v.object({
    amount: v.number(),
    currencyCode: v.string(),
  }),
  seller: v.object({
    uid: v.number(),
    name: v.string(),
    rating: v.nullable(v.number()),
    ratingCount: v.nullable(v.number()),
    shipsFrom: v.nullable(v.string()),
  }),
  mediaCondition: v.nullable(v.string()),
  sleeveCondition: v.nullable(v.string()),
  listedDate: v.string(),
  release: v.object({
    genres: v.array(DiscogsGenreSchema),
    formatNames: v.array(v.string()),
  }),
});

export const DiscogsShopApiResponseSchema = v.object({
  items: v.array(DiscogsListingSchema),
  totalCount: v.number(),
});

export const DiscogsUserProfileSchema = v.object({
  id: v.number(),
  username: v.string(),
  name: v.nullable(v.string()),
  profile: v.nullable(v.string()),
  registered: v.nullable(v.string()),
  num_wantlist: v.nullable(v.number()),
  num_collection: v.nullable(v.number()),
});

export type DiscogsPagination = v.InferOutput<typeof DiscogsPaginationSchema>;
export type DiscogsArtist = v.InferOutput<typeof DiscogsArtistSchema>;
export type DiscogsLabel = v.InferOutput<typeof DiscogsLabelSchema>;
export type DiscogsGenre = v.InferOutput<typeof DiscogsGenreSchema>;
export type DiscogsReleaseBasic = v.InferOutput<
  typeof DiscogsReleaseBasicSchema
>;
export type DiscogsWant = v.InferOutput<typeof DiscogsWantSchema>;
export type DiscogsWantlistResponse = v.InferOutput<
  typeof DiscogsWantlistResponseSchema
>;
export type DiscogsListing = v.InferOutput<typeof DiscogsListingSchema>;
export type DiscogsShopApiResponse = v.InferOutput<
  typeof DiscogsShopApiResponseSchema
>;
export type DiscogsUserProfile = v.InferOutput<typeof DiscogsUserProfileSchema>;
