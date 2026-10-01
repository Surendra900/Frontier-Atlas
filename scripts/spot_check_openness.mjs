import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DB_URL);

async function spotCheck() {
  const modelIds = [
    // 10 Proprietary API models
    'openai/gpt-4o',
    'openai/gpt-4-turbo',
    'openai/o1',
    'openai/o3-mini',
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-opus-4.5',
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'qwen/qwen-plus',
    'qwen/qwen3-max',
    'moonshotai/kimi-k3',
    'thinkingmachines/inkling',
    'mistralai/mistral-large-2512:batch',

    // 10 Open Weights models
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-chat-v3.1',
    'qwen/qwen-2.5-72b-instruct',
    'qwen/qwen-2.5-coder-32b-instruct',
    'google/gemma-2-27b-it',
    'mistralai/mistral-small-3.2-24b-instruct',
    'speakleash/bielik-7b-v0.1',
    'internlm/internlm2_5-7b-chat'
  ];

  const checks = [];
  for (const id of modelIds) {
    const [row] = await sql`
      SELECT id, name, vendor, openness_type, license, access_type
      FROM models
      WHERE id = ${id} OR slug = ${id}
      LIMIT 1
    `;
    if (row) {
      checks.push(row);
    } else {
      checks.push({ id, status: 'NOT_FOUND' });
    }
  }

  console.log('20 Spot Checks for Open vs Proprietary Accuracy:');
  console.table(checks);
}

spotCheck().catch(console.error);
