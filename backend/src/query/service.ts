import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getSchemaText, executeSQL } from './schemaBuilder.js';
import { generateSQL } from './sqlGenerator.js';
import { formatAnswerStream } from './answerFormatter.js';
import type { QueryEvent } from '@discogs-wantlist-finder/lib';

export interface ConversationState {
  sqlHistory: ChatCompletionMessageParam[];
  answerHistory: ChatCompletionMessageParam[];
}

export function createConversation(): ConversationState {
  return {
    sqlHistory: [],
    answerHistory: [],
  };
}

export function getSchema(): string {
  return getSchemaText();
}

export async function* processQuery(
  question: string,
  conversation: ConversationState
): AsyncGenerator<QueryEvent, void, unknown> {
  const schema = getSchemaText();

  yield { type: 'thinking' };

  const sql = await generateSQL(question, schema, conversation.sqlHistory);

  yield { type: 'sql', sql };

  const results = executeSQL(sql);

  const generator = formatAnswerStream(
    question,
    sql,
    results,
    conversation.answerHistory
  );

  let fullAnswer = '';
  for await (const chunk of generator) {
    fullAnswer += chunk;
    yield { type: 'chunk', content: chunk };
  }

  // Update SQL history
  conversation.sqlHistory.push({ role: 'user', content: question });
  const resultSummary =
    results.length > 0
      ? `${sql}\n-- Returned ${results.length} rows with columns: ${Object.keys(
          results[0]
        ).join(', ')}`
      : sql;
  conversation.sqlHistory.push({ role: 'assistant', content: resultSummary });
  if (conversation.sqlHistory.length > 6) {
    conversation.sqlHistory.splice(0, 2);
  }

  // Update answer history
  conversation.answerHistory.push({ role: 'user', content: question });
  conversation.answerHistory.push({ role: 'assistant', content: fullAnswer });
  if (conversation.answerHistory.length > 6) {
    conversation.answerHistory.splice(0, 2);
  }

  yield { type: 'done' };
}
