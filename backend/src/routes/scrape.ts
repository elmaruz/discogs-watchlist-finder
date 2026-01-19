import { Router } from 'express';
import type { Request, Response } from 'express';
import * as v from 'valibot';
import { runScrape } from '../scraper.js';
import { validate } from '../utils/validation.js';
import type { ScrapeEvent } from '@discogs-wantlist-finder/lib';

const router = Router();

const ScrapeRequestSchema = v.object({
  username: v.pipe(v.string(), v.minLength(1)),
});

router.post('/', async (req: Request, res: Response) => {
  let username: string;

  try {
    const body = validate(ScrapeRequestSchema, req.body, 'Scrape request body');
    username = body.username;
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid request',
    });
    return;
  }

  // Set up SSE headers
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
