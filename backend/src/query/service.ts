import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getSchemaText, executeSQL } from './schemaBuilder.js';
import { generateSQL } from './sqlGenerator.js';
import { formatAnswerStream } from './answerFormatter.js';
import type { QueryEvent, HistoryMessage } from '@discogs-wantlist-finder/lib';

export function getSchema(): string {
  return getSchemaText();
}

function toSqlHistory(history: HistoryMessage[]): ChatCompletionMessageParam[] {
  // For SQL generation, include question and SQL (not the natural language answer)
  return history.flatMap((msg): ChatCompletionMessageParam[] => {
    if (msg.role === 'user') {
      return [{ role: 'user', content: msg.content }];
    }
    // For assistant messages, use SQL if available
    if (msg.sql) {
      return [{ role: 'assistant', content: msg.sql }];
    }
    return [];
  });
}

function toAnswerHistory(history: HistoryMessage[]): ChatCompletionMessageParam[] {
  // For answer formatting, include question and natural language answer
  return history.map((msg): ChatCompletionMessageParam => ({
    role: msg.role,
    content: msg.content,
  }));
}

export async function* processQuery(
  question: string,
  history: HistoryMessage[]
): AsyncGenerator<QueryEvent, void, unknown> {
  const schema = getSchemaText();

  // Keep only last 3 Q&A pairs (6 messages)
  const recentHistory = history.slice(-6);

  yield { type: 'thinking' };

  const sqlHistory = toSqlHistory(recentHistory);
  const sql = await generateSQL(question, schema, sqlHistory);

  yield { type: 'sql', sql };

  const results = executeSQL(sql);

  const answerHistory = toAnswerHistory(recentHistory);
  const generator = formatAnswerStream(question, sql, results, answerHistory);

  for await (const chunk of generator) {
    yield { type: 'chunk', content: chunk };
  }

  yield { type: 'done' };
}
