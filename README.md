# Discogs Wantlist Finder

A TypeScript CLI tool that creates a **queryable SQLite snapshot** of Discogs marketplace listings matching your personal wantlist, with **AI-powered natural language querying**.

Ask questions like:
- _"Which sellers have the most items from my wantlist?"_
- _"Show me the 10 cheapest jazz records"_
- _"List all sellers from Germany with a rating above 98%"_

---

## Features

- Fetches your Discogs **wantlist** via the official API
- Creates a local **SQLite database** snapshot (users, sellers, listings, releases)
- **Natural language SQL querying** powered by OpenAI
- Read-only, secure queries (no data modification)
- No database server required

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
# Required: Discogs credentials
DISCOGS_USERNAME=your-username
DISCOGS_TOKEN=your-token

# Required: OpenAI API key for query mode
OPENAI_API_KEY=sk-...

# Optional: Model selection (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

**Getting API Keys:**
- Discogs token: [discogs.com/settings/developers](https://www.discogs.com/settings/developers)
- OpenAI API key: [platform.openai.com](https://platform.openai.com)

**Cost:** ~$0.0001 per query (10,000 queries ≈ $1)

---

## Usage

### Option 1: Query existing snapshot
```bash
npm run query
```

### Option 2: Scrape then query
```bash
npm start -- --query
```

### Option 3: Just scrape (default)
```bash
npm start
```

**In query mode:**
- Type natural language questions
- Type `schema` to view database structure
- Type `exit` to quit

---

## How Query Mode Works

1. Your question is sent to OpenAI's GPT model
2. AI generates a SQL query based on your database schema
3. Query is executed locally (read-only)
4. Results are formatted as a natural language answer

**Safety:**
- Only SELECT, WITH, and EXPLAIN queries allowed
- No data modification possible (INSERT/UPDATE/DELETE blocked)
- Queries run on your local snapshot only
- Only schema and query results sent to OpenAI (not raw data)

---

## Future Goals

- Front-end for seller comparison and bundle optimization
- More advanced analytics (pricing, condition filters)
- Improved scraping robustness and metadata
