import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { SqlRow } from '../types/database.js';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function* formatAnswerStream(
  question: string,
  sql: string,
  results: SqlRow[],
  history: ChatCompletionMessageParam[]
): AsyncGenerator<string, string, unknown> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You provide friendly, precise natural language answers about a Discogs music marketplace database.

Domain context:
- This is a music record marketplace (Discogs)
- "releases" = albums/records the user wants to buy
- "listings" = available items for sale from sellers
- "labels" = record labels (e.g., Blue Note, Motown)

Formatting rules:
- Always format prices with their currency symbol or code (e.g., "$10.50 USD", "€15.00 EUR", "£8.99 GBP")
- NEVER mention or reference ID numbers (seller_id, release_id, etc.) in your answer
- Use natural language: "recordsale-de" not "seller_id 123"
- Be concise but complete`,
    },
    ...history,
    {
      role: 'user',
      content: `Question: "${question}"\n\nSQL executed:\n${sql}\n\nResults (${
        results.length
      } rows):\n${JSON.stringify(
        results,
        null,
        2
      )}\n\nProvide a friendly answer.`,
    },
  ];

  if (!openai) throw new Error('OPENAI_API_KEY not set');
  const stream = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0,
    stream: true,
  });

  let fullAnswer = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullAnswer += content;
      yield content;
    }
  }

  return fullAnswer.trim();
}

export async function formatAnswer(
  question: string,
  sql: string,
  results: SqlRow[],
  history: ChatCompletionMessageParam[]
): Promise<string> {
  let fullAnswer = '';
  const generator = formatAnswerStream(question, sql, results, history);

  for await (const chunk of generator) {
    process.stdout.write(chunk);
    fullAnswer += chunk;
  }

  return fullAnswer.trim();
}
