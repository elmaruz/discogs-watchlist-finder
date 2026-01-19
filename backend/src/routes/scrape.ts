import { Router } from 'express';
import type { Request, Response } from 'express';
import { runScrape } from '../scraper.js';
import { parseBody } from '../utils/validation.js';
import { ScrapeRequestSchema } from '@discogs-wantlist-finder/lib';
import { sendEvent, setStreamHeaders } from '../utils/middleware.js';
import { handleApiError } from '../utils/errorHandler.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const body = parseBody(ScrapeRequestSchema, req.body, res);
  if (!body) return;

  const { username } = body;

  setStreamHeaders(res);

  try {
    await runScrape(username, sendEvent(res));
  } catch (error) {
    sendEvent(res)({
      type: 'error',
      message: handleApiError(error, 'Scrape endpoint failed'),
    });
  } finally {
    res.end();
  }
});

export default router;
