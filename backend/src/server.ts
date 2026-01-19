import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSchema } from './db/index.js';
import scrapeRouter from './routes/scrape.js';
import queryRouter from './routes/query.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database schema
initSchema();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/scrape', scrapeRouter);
app.use('/api/query', queryRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
