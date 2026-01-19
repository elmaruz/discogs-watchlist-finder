import { Router } from 'express';
import type { Request, Response } from 'express';
import * as v from 'valibot';
import {
  createConversation,
  processQuery,
  getSchema,
  type ConversationState,
} from '../query/service.js';
import { validate } from '../utils/validation.js';
import type { QueryEvent } from '@discogs-wantlist-finder/lib';

const router = Router();

// In-memory conversation storage (single user, localhost)
const conversations = new Map<string, ConversationState>();

const QueryRequestSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1)),
  conversationId: v.optional(v.string()),
});

router.get('/schema', (_req: Request, res: Response) => {
  res.json({ schema: getSchema() });
});

router.post('/', async (req: Request, res: Response) => {
  let question: string;
  let conversationId: string | undefined;

  try {
    const body = validate(QueryRequestSchema, req.body, 'Query request body');
    question = body.question;
    conversationId = body.conversationId;
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid request',
    });
    return;
  }

  // Get or create conversation
  const convId = conversationId || crypto.randomUUID();
  if (!conversations.has(convId)) {
    conversations.set(convId, createConversation());
  }
  const conversation = conversations.get(convId)!;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Conversation-Id', convId);
  res.flushHeaders();

  const sendEvent = (event: QueryEvent & { conversationId?: string }) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const generator = processQuery(question, conversation);

    for await (const event of generator) {
      if (event.type === 'done') {
        sendEvent({ ...event, conversationId: convId });
      } else {
        sendEvent(event);
      }
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
