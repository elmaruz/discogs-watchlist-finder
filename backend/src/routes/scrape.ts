import { Router } from 'express';
import type { Request, Response } from 'express';
import { runScrape } from '../scraper.js';
import { parseBody } from '../utils/validation.js';
import { ScrapeRequestSchema, type ScrapeEvent } from '@discogs-wantlist-finder/lib';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const body = parseBody(ScrapeRequestSchema, req.body, res);
  if (!body) return;

  const { username } = body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: ScrapeEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await runScrape(username, sendEvent);
  } catch (error) {
    sendEvent({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    res.end();
  }
});

export default router;
