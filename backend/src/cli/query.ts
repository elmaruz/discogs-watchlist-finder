import 'dotenv/config';
import * as readline from 'readline';
import {
  createConversation,
  processQuery,
  getSchema,
} from '../query/service.js';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function main(): Promise<void> {
  console.log('\n🤖 Query Mode - Ask questions about your wantlist data');
  console.log(`📝 Using: OpenAI ${MODEL}`);
  console.log("Type 'exit' to quit, 'schema' to view database schema\n");

  const conversation = createConversation();

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
        const generator = processQuery(question, conversation);

        for await (const event of generator) {
          switch (event.type) {
            case 'thinking':
              console.log('\n🔍 Thinking...\n');
              break;
            case 'sql':
              // SQL generated, processing
              break;
            case 'chunk':
              process.stdout.write(event.content);
              break;
            case 'done':
              console.log('\n');
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
