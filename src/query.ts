import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import * as readline from 'readline';
import { getTables, getTableColumns, runSQL } from './db/queries/index.js';
import { type SqliteTable, type SqlRow } from './types/database.js';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function formatTables(tables: SqliteTable[]): string {
  const formatted = tables
    .map((table) => {
      const columns = getTableColumns(table.name);
      const cols = columns.map((c) => `  ${c.name} ${c.type}`).join('\n');
      return `${table.name}:\n${cols}`;
    })
    .join('\n\n');

  return `${formatted}`;
}

function getSchemaText(): string {
  const tables = getTables();

  return `${formatTables(tables)}

Relationships:
- listings.seller_id → sellers.seller_id
- listings.release_id → wantlist.release_id
- wantlist.user_id → users.user_id

Context:
- SQLite database with data for ONE user only
- The wantlist table contains all releases the user wants
- Do NOT filter by user_id - all data belongs to the same user`;
}

function validateSqlQuery(sql: string) {
  const lower = sql.toLowerCase().trim();
  if (
    !lower.startsWith('select') &&
    !lower.startsWith('with') &&
    !lower.startsWith('explain')
  ) {
    throw new Error(
      `Only read-only queries allowed. Generated SQL: ${sql.substring(0, 100)}`
    );
  }
}

function executeSQL(sql: string): SqlRow[] {
  validateSqlQuery(sql);
  return runSQL(sql);
}

async function generateSQL(
  question: string,
  schema: string,
  history: ChatCompletionMessageParam[]
): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You generate SQLite queries for a Discogs music marketplace database. Use SQLite-specific syntax and functions only.

Domain context - Discogs music marketplace terminology:
- "records", "albums", "releases" → wantlist table (releases user wants to buy)
- "listings" → listings table (available items for sale)
- "items" → could mean releases or listings depending on context
- "bundles" → multiple listings from same seller
- "labels" → record labels (labels column), NOT database labels
- "price" → use both price_amount and price_currency columns

Schema:\n${schema}\n\nExamples:\nQ: "Show me all releases"\nA: SELECT title, artists, labels, year FROM wantlist;\n\nQ: "Which sellers have most listings?"\nA: SELECT s.username, COUNT(*) as listing_count FROM sellers s JOIN listings l ON s.seller_id = l.seller_id GROUP BY s.seller_id, s.username ORDER BY listing_count DESC LIMIT 10;\n\nQ: "Show unique releases with cheapest price"\nA: SELECT w.title, MIN(l.price_amount) as price, l.price_currency FROM wantlist w JOIN listings l ON w.release_id = l.release_id GROUP BY w.release_id, w.title, l.price_currency ORDER BY price ASC;\n\nImportant rules:
- This is a SQLite database - use SQLite syntax and functions (NOT PostgreSQL, MySQL, etc.)
- DO use IDs effectively in WHERE/JOIN/GROUP BY/DISTINCT for accuracy (e.g., COUNT(DISTINCT release_id), GROUP BY seller_id)
- NEVER include ID columns in final SELECT output - only human-readable names
- For prices, always include both price_amount and price_currency columns
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

async function formatAnswer(
  question: string,
  sql: string,
  results: SqlRow[],
  history: ChatCompletionMessageParam[]
): Promise<string> {
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
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0,
  });

  return response.choices[0].message.content?.trim() || '';
}

export async function startQueryMode(): Promise<void> {
  console.log('\n🤖 Query Mode - Ask questions about your wantlist data');
  console.log(`📝 Using: OpenAI ${MODEL}`);
  console.log("Type 'exit' to quit, 'schema' to view database schema\n");

  const schema = getSchemaText();
  const sqlHistory: ChatCompletionMessageParam[] = [];
  const answerHistory: ChatCompletionMessageParam[] = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('❓ Your question: ', async (question) => {
      const q = question.trim().toLowerCase();

      if (q === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      if (q === 'schema') {
        console.log('\n📋 Database Schema:\n');
        console.log(schema);
        console.log();
        askQuestion();
        return;
      }

      if (!question) {
        askQuestion();
        return;
      }

      try {
        console.log('\n🔍 Thinking...');

        if (process.env.DEBUG_HISTORY === 'true') {
          console.log(`[DEBUG] SQL history: ${sqlHistory.length} messages`);
          console.log(
            `[DEBUG] Answer history: ${answerHistory.length} messages`
          );
        }

        const sql = await generateSQL(question, schema, sqlHistory);
        const results = executeSQL(sql);
        const answer = await formatAnswer(
          question,
          sql,
          results,
          answerHistory
        );
        console.log(`\n🤖 ${answer}\n`);

        // Update SQL history (questions, SQL queries, and result summaries for context)
        sqlHistory.push({ role: 'user', content: question });
        const resultSummary =
          results.length > 0
            ? `${sql}\n-- Returned ${
                results.length
              } rows with columns: ${Object.keys(results[0]).join(', ')}`
            : sql;
        sqlHistory.push({ role: 'assistant', content: resultSummary });
        if (sqlHistory.length > 6) sqlHistory.splice(0, 2); // Keep last 3 Q&A pairs

        // Update answer history (questions and natural language answers)
        answerHistory.push({ role: 'user', content: question });
        answerHistory.push({ role: 'assistant', content: answer });
        if (answerHistory.length > 6) answerHistory.splice(0, 2); // Keep last 3 Q&A pairs
      } catch (error) {
        console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
        // Don't add failed attempts to history
      }

      console.log();
      askQuestion();
    });
  };

  askQuestion();
}
