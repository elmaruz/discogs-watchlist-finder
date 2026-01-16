import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateSQL(
  question: string,
  schema: string,
  history: ChatCompletionMessageParam[]
): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You generate SQLite queries for a Discogs music marketplace database. Use SQLite-specific syntax and functions only.

Domain context - Discogs music marketplace terminology:
- "records", "albums", "releases" → releases table (album/record information)
- "wantlist" → bridge table linking users to releases they want
- "listings" → listings table (available items for sale)
- "items" → could mean releases or listings depending on context
- "bundles" → multiple listings from same seller
- "labels" → record labels (labels column), NOT database labels
- "price" → use both price and currency columns

Schema:\n${schema}\n\nExamples:\nQ: "Show me all releases"\nA: SELECT r.title, r.artists, r.labels, r.year FROM releases r JOIN wantlist w ON r.release_id = w.release_id;\n\nQ: "Which sellers have most listings?"\nA: SELECT s.username, COUNT(*) as listing_count FROM sellers s JOIN listings l ON s.seller_id = l.seller_id GROUP BY s.seller_id, s.username ORDER BY listing_count DESC LIMIT 10;\n\nQ: "Show unique releases with cheapest price"\nA: SELECT r.title, MIN(l.price) as price, l.currency FROM releases r JOIN wantlist w ON r.release_id = w.release_id JOIN listings l ON r.release_id = l.release_id GROUP BY r.release_id, r.title, l.currency ORDER BY price ASC;\n\nImportant rules:
- This is a SQLite database - use SQLite syntax and functions (NOT PostgreSQL, MySQL, etc.)
- DO use IDs effectively in WHERE/JOIN/GROUP BY/DISTINCT for accuracy (e.g., COUNT(DISTINCT release_id), GROUP BY seller_id)
- NEVER include ID columns in final SELECT output - only human-readable names
- For prices, always include both price and currency columns
- For uniqueness constraints (e.g., "unique releases"), use DISTINCT or GROUP BY on the appropriate ID column
- For follow-up questions that ask to "include" or "add" information, rebuild the entire query with the additional columns
- Always recalculate aggregates like COUNT() - don't assume calculated columns exist
- When using GROUP BY with aggregates, include all non-aggregated columns in GROUP BY clause

Return ONLY executable SQL starting with SELECT, WITH, or EXPLAIN. No markdown, no explanations, no additional text.`,
    },
    ...history,
    { role: 'user', content: question },
  ];

  if (!openai) throw new Error('OPENAI_API_KEY not set');
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0,
  });

  const rawSql = (response.choices[0].message.content || '').trim();

  const cleanedSql = rawSql
    .replace(/```sql\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/^(SQL:\s*)/i, '');

  const sql = cleanedSql.endsWith(';') ? cleanedSql : `${cleanedSql};`;

  return sql;
}
