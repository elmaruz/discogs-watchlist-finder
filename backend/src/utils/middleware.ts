import { ScrapeEvent } from '@discogs-wantlist-finder/lib';
import type { Response } from 'express';

export const setStreamHeaders = (res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
};

export const sendEvent =
  <A>(res: Response) =>
  (event: A) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
