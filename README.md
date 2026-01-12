# Discogs Wantlist Snapshot

A lightweight TypeScript tool that creates a **queryable SQLite snapshot** of Discogs marketplace listings matching your personal wantlist.

Each run produces a standalone database file that can be queried locally to answer questions like:

> _Which sellers have the most items from my wantlist?_

---

## What It Does (Today)

- Fetches a user's Discogs **wantlist** via the official API
- Stores users, sellers, listings, and releases in a **single SQLite database**
- Enables flexible, ad-hoc SQL querying
- Requires **no running database server**

Each run creates a fresh, immutable snapshot.

---

## What It Doesn’t Do (Yet)

- No UI
- No real-time updates
- No built-in analytics beyond raw SQL

---

## Running

```bash
npm install
npm run run
```

A new .sqlite file will appear in snapshots/.

---

## Future Goals

-Natural-language querying via LLMs

- Front-end for seller comparison and bundle optimization

- More advanced analytics (pricing, condition filters)

- Improved scraping robustness and metadata
