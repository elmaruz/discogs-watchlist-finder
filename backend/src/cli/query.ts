import 'dotenv/config';
import * as readline from 'readline';
import { processQuery, getSchema } from '../query/service.js';
import type { HistoryMessage } from '@discogs-wantlist-finder/lib';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function main(): Promise<void> {
  console.log('\n🤖 Query Mode - Ask questions about your wantlist data');
  console.log(`📝 Using: OpenAI ${MODEL}`);
  console.log("Type 'exit' to quit, 'schema' to view database schema\n");

  const history: HistoryMessage[] = [];

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
        console.log(getSchema());
        console.log();
        askQuestion();
        return;
      }

      if (!question.trim()) {
        askQuestion();
        return;
      }

      try {
        const generator = processQuery(question, history);

        let currentAnswer = '';
        let currentSql = '';

        for await (const event of generator) {
          switch (event.type) {
            case 'thinking':
              console.log('\n🔍 Thinking...\n');
              break;
            case 'sql':
              currentSql = event.sql;
              break;
            case 'chunk':
              process.stdout.write(event.content);
              currentAnswer += event.content;
              break;
            case 'done':
              console.log('\n');
              // Add to history after successful response
              history.push({ role: 'user', content: question });
              history.push({
                role: 'assistant',
                content: currentAnswer,
                sql: currentSql,
              });
              break;
            case 'error':
              console.error(`\n❌ ${event.message}`);
              break;
          }
        }
      } catch (error) {
        console.error(
          `\n❌ ${error instanceof Error ? error.message : error}`
        );
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
