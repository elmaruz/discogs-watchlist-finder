import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import * as readline from 'readline';
import { getSchemaText, executeSQL } from './schemaBuilder.js';
import { generateSQL } from './sqlGenerator.js';
import { formatAnswer } from './answerFormatter.js';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
