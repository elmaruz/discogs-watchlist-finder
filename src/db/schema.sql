CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    profile TEXT,
    registered TEXT,
    num_wantlist INTEGER,
    num_collection INTEGER
);

CREATE TABLE IF NOT EXISTS releases (
    release_id INTEGER PRIMARY KEY,
    title TEXT,
    artists TEXT[],
    labels TEXT[],
    catno TEXT[],
    year INTEGER
);

CREATE TABLE IF NOT EXISTS wantlist (
    user_id INTEGER NOT NULL,
    release_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, release_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (release_id) REFERENCES releases(release_id) ON DELETE CASCADE
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
    release_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    price REAL,
    currency TEXT,
    condition TEXT,
    sleeve_condition TEXT,
    genres TEXT[],
    format_names TEXT[],
    FOREIGN KEY (release_id) REFERENCES releases(release_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE
);

-- Helpful indexes for query performance
CREATE INDEX IF NOT EXISTS idx_wantlist_user ON wantlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wantlist_release ON wantlist(release_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_release ON listings(release_id);
