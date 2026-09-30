import { neon } from '@neondatabase/serverless';

const SHARD_2 = 'postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(SHARD_2);

const LANDMARK_PAPERS = [
  {
    title: 'GPT-4 Technical Report',
    slug: 'gpt-4-technical-report',
    arxivId: '2303.08774',
    abstract: 'We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs.',
    matchKeywords: ['gpt-4', 'gpt-3', 'gpt-5', 'chatgpt', 'openai/gpt'],
  },
  {
    title: 'The Claude 3 Model Family: Opus, Sonnet, Haiku',
    slug: 'the-claude-3-model-family',
    arxivId: '2403.05530',
    abstract: 'We present Claude 3, a family of state-of-the-art vision and language models developed by Anthropic spanning Opus, Sonnet, and Haiku.',
    matchKeywords: ['claude'],
  },
  {
    title: 'Gemini: A Family of Highly Capable Multimodal Models',
    slug: 'gemini-a-family-of-highly-capable-multimodal-models',
    arxivId: '2312.11805',
    abstract: 'We present Gemini, a new family of highly capable multimodal models trained jointly across image, audio, video, and text data.',
    matchKeywords: ['gemini'],
  },
  {
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
    slug: 'deepseek-r1-incentivizing-reasoning-capability-in-llms-via-reinforcement-learning',
    arxivId: '2501.12948',
    abstract: 'We introduce DeepSeek-R1-Zero and DeepSeek-R1, which explore reasoning capabilities of LLMs without supervised fine-tuning.',
    matchKeywords: ['deepseek-r1', 'deepseek'],
  },
  {
    title: 'The Llama 3 Herd of Models',
    slug: 'the-llama-3-herd-of-models',
    arxivId: '2407.21783',
    abstract: 'We introduce Llama 3, a herd of language models supporting dense architectures natively trained on over 15T tokens.',
    matchKeywords: ['llama'],
  },
  {
    title: 'Qwen2.5 Technical Report',
    slug: 'qwen2-5-technical-report',
    arxivId: '2412.15115',
    abstract: 'Qwen2.5 is the latest generation of foundational large language and multimodal models developed by Alibaba Cloud.',
    matchKeywords: ['qwen', 'qwq'],
  },
  {
    title: 'Mistral 7B',
    slug: 'mistral-7b',
    arxivId: '2310.06825',
    abstract: 'We introduce Mistral 7B, a 7–billion-parameter language model engineered for superior performance and efficiency.',
    matchKeywords: ['mistral', 'mixtral', 'ministral', 'devstral', 'voxtral'],
  },
  {
    title: 'Gemma 2: Improving Open Language Models at a Practical Size',
    slug: 'gemma-2-improving-open-language-models-at-a-practical-size',
    arxivId: '2408.00118',
    abstract: 'We introduce Gemma 2, a new family of lightweight, state-of-the-art open models ranging from 2B to 27B parameters.',
    matchKeywords: ['gemma'],
  },
  {
    title: 'Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone',
    slug: 'phi-3-technical-report',
    arxivId: '2404.14219',
    abstract: 'We introduce Phi-3-mini, a 3.8 billion parameter language model trained on 3.3 trillion tokens.',
    matchKeywords: ['phi-3', 'phi-4', 'phi'],
  },
  {
    title: 'OpenVLA: An Open-Source Vision-Language-Action Model',
    slug: 'openvla-an-open-source-vision-language-action-model',
    arxivId: '2406.09246',
    abstract: 'We present OpenVLA, an open-source 7B parameter vision-language-action model trained on 970k robot manipulation trajectories.',
    matchKeywords: ['openvla'],
  },
  {
    title: 'Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)',
    slug: 'robust-speech-recognition-via-large-scale-weak-supervision',
    arxivId: '2212.04356',
    abstract: 'We study the speech recognition capabilities of models trained on 680,000 hours of multilingual and multitask supervised data collected from the web.',
    matchKeywords: ['whisper'],
  },
];

async function run() {
  console.log('=== Linking Comprehensive Landmark Papers to Models ===');

  for (const p of LANDMARK_PAPERS) {
    let [existing] = await sql`SELECT id FROM papers WHERE slug = ${p.slug} OR arxiv_id = ${p.arxivId} LIMIT 1`;
    let paperId = existing?.id;

    if (!paperId) {
      const [inserted] = await sql`
        INSERT INTO papers (id, title, slug, abstract, arxiv_id, paper_url, pdf_url, publication_date)
        VALUES (
          gen_random_uuid(),
          ${p.title},
          ${p.slug},
          ${p.abstract},
          ${p.arxivId},
          ${'https://arxiv.org/abs/' + p.arxivId},
          ${'https://arxiv.org/pdf/' + p.arxivId + '.pdf'},
          NOW()
        )
        RETURNING id
      `;
      paperId = inserted.id;
      console.log(`Inserted landmark paper: ${p.title} (${paperId})`);
    }

    const allModels = await sql`SELECT id, name, slug FROM models`;
    let linked = 0;
    for (const m of allModels) {
      const matches = p.matchKeywords.some(kw => 
        m.id.toLowerCase().includes(kw) || 
        m.slug.toLowerCase().includes(kw) || 
        m.name.toLowerCase().includes(kw)
      );

      if (matches) {
        await sql`
          INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source)
          VALUES (${paperId}, ${m.id}, 'introduced', 0.99, ${'curated_landmark:' + p.arxivId})
          ON CONFLICT DO NOTHING
        `;
        await sql`
          UPDATE models
          SET paper_url = ${'https://arxiv.org/abs/' + p.arxivId}
          WHERE id = ${m.id} AND (paper_url IS NULL OR paper_url = '')
        `;
        linked++;
      }
    }
    console.log(`Linked ${linked} models to "${p.title}"`);
  }

  const [totalMapped] = await sql`SELECT COUNT(DISTINCT model_id)::int as cnt FROM paper_models`;
  const [totalWithPaperUrl] = await sql`SELECT COUNT(*)::int as cnt FROM models WHERE paper_url IS NOT NULL AND paper_url != ''`;
  console.log(`\nDONE! Total models with mapped papers: ${totalMapped.cnt}`);
  console.log(`Total models with paper_url set: ${totalWithPaperUrl.cnt}`);
}

run().catch(console.error);
