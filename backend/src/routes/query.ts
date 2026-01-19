import { Router } from 'express';
import type { Request, Response } from 'express';
import * as v from 'valibot';
import { processQuery, getSchema } from '../query/service.js';
import { parseBody } from '../utils/validation.js';
import type { QueryEvent } from '@discogs-wantlist-finder/lib';

const router = Router();

const HistoryMessageSchema = v.object({
  role: v.picklist(['user', 'assistant']),
  content: v.string(),
  sql: v.optional(v.string()),
});

const QueryRequestSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1)),
  history: v.optional(v.array(HistoryMessageSchema), []),
});

router.get('/schema', (_req: Request, res: Response) => {
  res.json({ schema: getSchema() });
});

router.post('/', async (req: Request, res: Response) => {
  const body = parseBody(QueryRequestSchema, req.body, res);
  if (!body) return;

  const { question, history } = body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: QueryEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    for await (const event of processQuery(question, history)) {
      sendEvent(event);
    }
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
