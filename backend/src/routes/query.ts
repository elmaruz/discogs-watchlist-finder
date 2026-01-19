import { Router } from 'express';
import type { Request, Response } from 'express';
import { processQuery, getSchema } from '../services/query.js';
import { parseBody } from '../utils/validation.js';
import { QueryRequestSchema } from '@discogs-wantlist-finder/lib';
import { sendEvent, setStreamHeaders } from '../utils/middleware.js';
import { handleApiError } from '../utils/errorHandler.js';

const router = Router();

router.get('/schema', (_req: Request, res: Response) => {
  res.json({ schema: getSchema() });
});

router.post('/', async (req: Request, res: Response) => {
  const body = parseBody(QueryRequestSchema, req.body, res);
  if (!body) return;

  const { question, history } = body;

  setStreamHeaders(res);

  try {
    for await (const event of processQuery(question, history)) {
      sendEvent(res)(event);
    }
  } catch (error) {
    sendEvent(res)({
      type: 'error',
      message: handleApiError(error, 'Query endpoint failed'),
    });
  } finally {
    res.end();
  }
});

export default router;
