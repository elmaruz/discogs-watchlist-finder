# Discogs Wantlist Finder

A full-stack web application that creates a **queryable SQLite snapshot** of Discogs marketplace listings matching your personal wantlist, with **AI-powered natural language querying**.

Ask questions like:
- _"Which sellers have the most items from my wantlist?"_
- _"Show me the 10 cheapest jazz records"_
- _"List all sellers from Germany with a rating above 98%"_

---

## Features

- **Web UI** for scraping and querying (React + Tailwind)
- **Real-time streaming** progress and AI responses (SSE)
- Fetches your Discogs **wantlist** via the official API
- Creates a local **SQLite database** snapshot
- **Natural language SQL querying** powered by OpenAI
- Read-only, secure queries (no data modification)

---

## Project Structure

```
discogs-wantlist-finder/
├── frontend/          # React + Vite + Tailwind + Redux
├── backend/           # Express API + business logic
├── lib/               # Shared types and schemas
├── snapshots/         # SQLite database (gitignored)
└── package.json       # Workspace root
```

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

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

---

## Usage

### Web Application

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:backend   # Express API on port 3001
npm run dev:frontend  # Vite dev server on port 5173
```

Open http://localhost:5173 in your browser.

### CLI (Alternative)

```bash
# Scrape wantlist
npm run scrape -w backend

# Query existing snapshot
npm run query -w backend
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Start scraping (SSE stream) |
| POST | `/api/query` | Natural language query (SSE stream) |
| GET | `/api/query/schema` | Get database schema |
| GET | `/api/health` | Health check |

---

## How It Works

1. **Scrape**: Fetches your Discogs wantlist and marketplace listings
2. **Store**: Saves data to local SQLite (users, sellers, listings, releases)
3. **Query**: Your question → OpenAI generates SQL → executes locally → streams answer

**Safety:**
- Only SELECT, WITH, and EXPLAIN queries allowed
- No data modification possible
- Queries run on your local snapshot only
