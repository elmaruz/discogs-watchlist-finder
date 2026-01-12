import * as v from 'valibot'

// Leaf schemas
export const DiscogsPaginationSchema = v.object({
  page: v.number(),
  pages: v.number(),
  per_page: v.number(),
  items: v.number(),
})

export const DiscogsArtistSchema = v.object({
  name: v.string(),
})

export const DiscogsLabelSchema = v.object({
  name: v.string(),
  catno: v.string(),
})

export const DiscogsGenreSchema = v.object({
  genreId: v.number(),
  name: v.string(),
})

// Composite schemas
export const DiscogsReleaseBasicSchema = v.object({
  id: v.number(),
  title: v.string(),
  year: v.optional(v.number()),
  artists: v.optional(v.array(DiscogsArtistSchema)),
  labels: v.optional(v.array(DiscogsLabelSchema)),
})

export const DiscogsWantSchema = v.object({
  basic_information: DiscogsReleaseBasicSchema,
})

export const DiscogsWantlistResponseSchema = v.object({
  pagination: DiscogsPaginationSchema,
  wants: v.array(DiscogsWantSchema),
})

export const DiscogsListingSchema = v.object({
  itemId: v.number(),
  price: v.object({
    amount: v.number(),
    currencyCode: v.string(),
  }),
  seller: v.object({
    uid: v.number(),
    name: v.string(),
    rating: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    shipsFrom: v.optional(v.string()),
  }),
  mediaCondition: v.optional(v.string()),
  sleeveCondition: v.optional(v.string()),
  shipsFrom: v.optional(v.string()),
  listedDate: v.string(),
  release: v.object({
    genres: v.array(DiscogsGenreSchema),
  }),
})

export const DiscogsShopApiResponseSchema = v.object({
  items: v.array(DiscogsListingSchema),
})

export const DiscogsUserProfileSchema = v.object({
  id: v.number(),
  username: v.string(),
  name: v.optional(v.string()),
  profile: v.optional(v.string()),
  registered: v.optional(v.string()),
  num_wantlist: v.optional(v.number()),
  num_collection: v.optional(v.number()),
})

// Export inferred types
export type DiscogsPagination = v.InferOutput<typeof DiscogsPaginationSchema>
export type DiscogsArtist = v.InferOutput<typeof DiscogsArtistSchema>
export type DiscogsLabel = v.InferOutput<typeof DiscogsLabelSchema>
export type DiscogsGenre = v.InferOutput<typeof DiscogsGenreSchema>
export type DiscogsReleaseBasic = v.InferOutput<typeof DiscogsReleaseBasicSchema>
export type DiscogsWant = v.InferOutput<typeof DiscogsWantSchema>
export type DiscogsWantlistResponse = v.InferOutput<typeof DiscogsWantlistResponseSchema>
export type DiscogsListing = v.InferOutput<typeof DiscogsListingSchema>
export type DiscogsShopApiResponse = v.InferOutput<typeof DiscogsShopApiResponseSchema>
export type DiscogsUserProfile = v.InferOutput<typeof DiscogsUserProfileSchema>
