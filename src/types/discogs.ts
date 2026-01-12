export interface DiscogsPagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
}

export interface DiscogsArtist {
  name: string;
}

export interface DiscogsLabel {
  name: string;
  catno: string;
}

export interface DiscogsGenre {
  genreId: number;
  name: string;
}

export interface DiscogsReleaseBasic {
  id: number;
  title: string;
  year?: number;
  artists?: DiscogsArtist[];
  labels?: DiscogsLabel[];
}

export interface DiscogsWant {
  basic_information: DiscogsReleaseBasic;
}

export interface DiscogsWantlistResponse {
  pagination: DiscogsPagination;
  wants: DiscogsWant[];
}

export interface DiscogsListing {
  itemId: number;
  price: {
    amount: number;
    currencyCode: string;
  };
  seller: {
    uid: number;
    name: string;
    rating?: number;
    ratingCount?: number;
    shipsFrom?: string;
  };
  mediaCondition?: string;
  sleeveCondition?: string;
  shipsFrom?: string;
  listedDate: string;
  release: {
    genres: DiscogsGenre[];
  };
}

export interface DiscogsShopApiResponse {
  items: DiscogsListing[];
}

export interface DiscogsUserProfile {
  id: number;
  username: string;
  name?: string;
  profile?: string;
  registered?: string;
  num_wantlist?: number;
  num_collection?: number;
}
