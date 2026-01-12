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

export interface DiscogsSellerStats {
  rating: number;
  total: number;
}

export interface DiscogsSeller {
  id: number;
  username: string;
  stats?: DiscogsSellerStats;
}

export interface DiscogsPrice {
  value: number;
  currency: string;
}

export interface DiscogsListing {
  id: number;
  seller: DiscogsSeller;
  price?: DiscogsPrice;
  condition?: string;
  sleeve_condition?: string;
  ships_from?: string;
}

export interface DiscogsMarketplaceResponse {
  pagination: DiscogsPagination;
  results: DiscogsListing[];
}
