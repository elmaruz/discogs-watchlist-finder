CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    profile TEXT,
    registered TEXT,
    num_wantlist INTEGER,
    num_collection INTEGER
);

CREATE TABLE IF NOT EXISTS wantlist (
    release_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    artists TEXT[],
    title TEXT,
    labels TEXT[],
    catno TEXT[],
    year INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS sellers (
    seller_id INTEGER PRIMARY KEY,
    username TEXT,
    rating REAL,
    num_ratings INTEGER,
    ships_from TEXT
);

CREATE TABLE IF NOT EXISTS listings (
    listing_id INTEGER PRIMARY KEY,
    release_id INTEGER,
    seller_id INTEGER,
    price REAL,
    currency TEXT,
    condition TEXT,
    sleeve_condition TEXT,
    genres TEXT[],
    format_names TEXT[]
);

-- Helpful indexes for query performance
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_release ON listings(release_id);
