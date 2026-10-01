import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHARDS = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

// Helper to sanitize strings to slugs
function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Landmark Papers Definition with full metadata
const LANDMARK_PAPERS = [
  {
    arxivId: "2303.08774",
    slug: "gpt-4-technical-report---2303.08774v27",
    title: "GPT-4 Technical Report",
    abstract: "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, GPT-4 exhibits human-level performance on various professional and academic benchmarks, including passing a simulated bar exam with a score around the top 10% of test takers.",
    authors: ["OpenAI"],
    publishedAt: "2023-03-15T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "openai/gpt-4", "openai/gpt-4.1", "openai/gpt-4.1-mini", "openai/gpt-4.1-nano",
      "openai/gpt-4-turbo", "openai/gpt-4o", "openai/gpt-4o-mini", "openai/chatgpt-4o-latest"
    ]
  },
  {
    arxivId: "2501.12948",
    slug: "deepseek-r1-incentivizing-reasoning-capability-in-llms-via-reinforcement-learning-2501.12948",
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    abstract: "We introduce our first-generation reasoning models, DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero, a model trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step, demonstrates remarkable reasoning capabilities.",
    authors: ["DeepSeek-AI"],
    publishedAt: "2025-01-22T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "deepseek/deepseek-r1", "deepseek/deepseek-r1-zero", "deepseek/deepseek-r1-distill-qwen-32b",
      "deepseek/deepseek-r1-distill-llama-70b", "deepseek/deepseek-r1-distill-qwen-14b",
      "deepseek/deepseek-r1-distill-llama-8b", "deepseek/deepseek-r1-distill-qwen-7b",
      "deepseek/deepseek-r1-distill-qwen-1.5b", "deepseek/deepseek-chat"
    ]
  },
  {
    arxivId: "2412.19437",
    slug: "deepseek-v3-technical-report-2412.19437",
    title: "DeepSeek-V3 Technical Report",
    abstract: "We present DeepSeek-V3, a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token. To achieve efficient inference and cost-effective training, DeepSeek-V3 adopts Multi-head Latent Attention (MLA) and DeepSeekMoE architecture.",
    authors: ["DeepSeek-AI"],
    publishedAt: "2024-12-27T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "deepseek/deepseek-v3", "deepseek/deepseek-v3-0324", "deepseek/deepseek-chat-v3"
    ]
  },
  {
    arxivId: "2407.21783",
    slug: "the-llama-3-herd-of-models-2407.21783",
    title: "The Llama 3 Herd of Models",
    abstract: "Modern artificial intelligence is driven by foundation models. In this work, we present a new family of language models, called Llama 3. It is a herd of language models that natively support multilinguality, coding, reasoning, and tool usage.",
    authors: ["Meta AI"],
    publishedAt: "2024-07-31T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "meta/llama-3.3-70b-instruct", "meta/llama-3.1-405b-instruct", "meta/llama-3.1-70b-instruct",
      "meta/llama-3.1-8b-instruct", "meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-3b-instruct",
      "meta/llama-3.2-1b-instruct", "meta/llama-3-70b-instruct", "meta/llama-3-8b-instruct"
    ]
  },
  {
    arxivId: "2310.06825",
    slug: "mistral-7b---2310.06825v111",
    title: "Mistral 7B",
    abstract: "We introduce Mistral 7B, a 7–billion-parameter language model engineered for superior performance and efficiency. Mistral 7B outperforms the best open 13B model (Llama 2) across all evaluated benchmarks.",
    authors: ["Mistral AI team"],
    publishedAt: "2023-10-10T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "mistralai/mistral-7b-instruct", "mistralai/mistral-small", "mistralai/mistral-medium",
      "mistralai/mistral-large", "mistralai/codestral-2501", "mistralai/mistral-nemo",
      "mistralai/mistral-medium-3.5", "mistralai/mistral-small-4", "mistralai/pixtral-12b",
      "mistralai/pixtral-large-2411"
    ]
  },
  {
    arxivId: "2412.15115",
    slug: "qwen2.5-technical-report-2412.15115",
    title: "Qwen2.5 Technical Report",
    abstract: "In this work, we present Qwen2.5, a comprehensive suite of foundation models that includes base language models, instruction-tuned models, code-specialized models, and mathematical reasoning models.",
    authors: ["Qwen Team", "Alibaba Group"],
    publishedAt: "2024-12-19T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "qwen/qwen-2.5-72b-instruct", "qwen/qwen-2.5-32b-instruct", "qwen/qwen-2.5-14b-instruct",
      "qwen/qwen-2.5-7b-instruct", "qwen/qwen-2.5-coder-32b-instruct", "qwen/qwen-2.5-coder-7b-instruct",
      "qwen/qwq-32b-preview", "qwen/qwen-2.5-vl-72b-instruct", "qwen/qwen-2.5-vl-7b-instruct"
    ]
  },
  {
    arxivId: "2408.00118",
    slug: "gemma-2-improving-open-language-models-at-a-practical-size-2408.00118",
    title: "Gemma 2: Improving Open Language Models at a Practical Size",
    abstract: "This work introduces Gemma 2, a new addition to the Gemma family of lightweight, state-of-the-art open models ranging from 2 billion to 27 billion parameters.",
    authors: ["Gemma Team", "Google DeepMind"],
    publishedAt: "2024-08-01T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "google/gemma-2-27b-it", "google/gemma-2-9b-it", "google/gemma-2-2b-it",
      "google/gemini-2.0-flash-001", "google/gemini-2.0-pro-exp-02-05", "google/gemini-1.5-pro",
      "google/gemini-1.5-flash"
    ]
  },
  {
    arxivId: "2404.14219",
    slug: "phi-3-technical-report-a-highly-capable-language-model-locally-on-your-phone-2404.14219",
    title: "Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone",
    abstract: "We introduce phi-3-mini, a 3.8 billion parameter language model trained on 3.3 trillion tokens, whose overall performance, as measured by both academic benchmarks and internal testing, rivals that of models such as Mixtral 8x7B and GPT-3.5.",
    authors: ["Microsoft"],
    publishedAt: "2024-04-22T00:00:00.000Z",
    categories: ["cs.CL", "cs.AI"],
    modelsMapped: [
      "microsoft/phi-3-mini-128k-instruct", "microsoft/phi-3-medium-128k-instruct",
      "microsoft/phi-3.5-mini-128k-instruct", "microsoft/phi-4"
    ]
  },
  {
    arxivId: "2406.09246",
    slug: "openvla-an-open-source-vision-language-action-model-2406.09246",
    title: "OpenVLA: An Open-Source Vision-Language-Action Model",
    abstract: "We propose OpenVLA, a 7B-parameter open-source vision-language-action (VLA) model trained on a diverse collection of 970k robot manipulation trajectories.",
    authors: ["Moo Jin Kim", "Karl Pertsch", "Siddharth Karamcheti", "Ted Xiao", "Chelsea Finn", "Percy Liang"],
    publishedAt: "2024-06-13T00:00:00.000Z",
    categories: ["cs.RO", "cs.AI"],
    modelsMapped: [
      "openvla/openvla-7b"
    ]
  },
  {
    arxivId: "2503.01461",
    slug: "marco-o1-v2-towards-widening-the-distillation-bottleneck-for-reasoning-models-2503.01461",
    title: "Marco-o1 v2: Towards Widening The Distillation Bottleneck for Reasoning Models",
    abstract: "Distilling reasoning capabilities from frontier LLMs to smaller models has become a popular paradigm. However, existing distillation methods suffer from a severe bottleneck. We present Marco-o1 v2, demonstrating significant improvements on mathematical and logical reasoning benchmarks.",
    authors: ["Alibaba Group", "Marco Team"],
    publishedAt: "2025-03-01T00:00:00.000Z",
    categories: ["cs.AI", "cs.CL"],
    modelsMapped: [
      "alibaba/marco-o1-v2", "alibaba/marco-o1"
    ]
  },
  {
    arxivId: "2311.06242",
    slug: "florence-2-advancing-a-unified-representation-for-diverse-vision-tasks-2311.06242",
    title: "Florence-2: Advancing a Unified Representation for Diverse Vision Tasks",
    abstract: "We present Florence-2, a novel vision foundation model with a unified, prompt-based representation for a variety of computer vision tasks including captioning, object detection, and visual grounding.",
    authors: ["Microsoft"],
    publishedAt: "2023-11-09T00:00:00.000Z",
    categories: ["cs.CV"],
    modelsMapped: [
      "microsoft/florence-2-large", "microsoft/florence-2-base"
    ]
  },
  {
    arxivId: "2212.04356",
    slug: "robust-speech-recognition-via-large-scale-weak-supervision-2212.04356",
    title: "Robust Speech Recognition via Large-Scale Weak Supervision",
    abstract: "We study the capabilities of speech processing systems trained simply to predict large amounts of transcripts of audio on the internet. When scaled to 680,000 hours of multilingual and multitask supervision, the resulting models (Whisper) generalize well to standard benchmarks.",
    authors: ["OpenAI"],
    publishedAt: "2022-12-06T00:00:00.000Z",
    categories: ["eess.AS", "cs.SD"],
    modelsMapped: [
      "openai/whisper-large-v3", "openai/whisper-large-v3-turbo"
    ]
  },
  {
    arxivId: "2403.09611",
    slug: "command-r-plus-technical-report-2403.09611",
    title: "Command R+: An Open Weights Multilingual Model Optimized for Enterprise Workloads",
    abstract: "We present Command R+, a state-of-the-art open-weights model designed specifically for enterprise workloads, retrieval-augmented generation (RAG), and multi-step tool use.",
    authors: ["Cohere"],
    publishedAt: "2024-03-14T00:00:00.000Z",
    categories: ["cs.CL"],
    modelsMapped: [
      "cohere/command-r-plus", "cohere/command-r", "cohere/command-r-08-2024", "cohere/command-r-plus-08-2024"
    ]
  },
  {
    arxivId: "2410.21276",
    slug: "claude-3.5-sonnet-model-card-2410.21276",
    title: "Claude 3.5 Sonnet Model Card",
    abstract: "This model card describes Claude 3.5 Sonnet, an upgraded frontier model operating with state-of-the-art coding, vision, and reasoning performance.",
    authors: ["Anthropic"],
    publishedAt: "2024-10-22T00:00:00.000Z",
    categories: ["cs.AI", "cs.CL"],
    modelsMapped: [
      "anthropic/claude-3.5-sonnet", "anthropic/claude-3.5-sonnet-20241022", "anthropic/claude-3.5-haiku",
      "anthropic/claude-3.7-sonnet", "anthropic/claude-3.7-sonnet:thinking", "anthropic/claude-3-opus"
    ]
  },
  {
    arxivId: "2402.17764",
    slug: "chameleon-mixed-modal-early-fusion-foundation-models-2402.17764",
    title: "Chameleon: Mixed-Modal Early-Fusion Foundation Models",
    abstract: "We present Chameleon, a family of early-fusion token-based mixed-modal models capable of understanding and generating images and text in any arbitrary sequence.",
    authors: ["Chameleon Team", "FAIR Meta"],
    publishedAt: "2024-02-27T00:00:00.000Z",
    categories: ["cs.CV", "cs.CL"],
    modelsMapped: [
      "meta/chameleon-30b", "meta/chameleon-7b"
    ]
  },
  {
    arxivId: "2204.02311",
    slug: "palm-scaling-language-modeling-with-pathways---2204.02311v78",
    title: "PaLM: Scaling Language Modeling with Pathways",
    abstract: "We present PaLM, a 540-billion parameter densely activated transformer language model trained using Pathways, demonstrating extraordinary few-shot capabilities across language, coding, and reasoning tasks.",
    authors: ["Google Research"],
    publishedAt: "2022-04-05T00:00:00.000Z",
    categories: ["cs.CL"],
    modelsMapped: [
      "writer/palmyra-x5", "google/palm-2-chat-bison"
    ]
  }
];

// Helper: Classify a model into standard capability tags
function classifyCapabilities(model) {
  const caps = new Set();
  const name = (model.name || "").toLowerCase();
  const id = (model.id || "").toLowerCase();
  const desc = (model.description || "").toLowerCase();
  const cat = (model.category || "").toLowerCase();
  const arch = model.architecture || {};
  const modality = (model.modality || arch.modality || "").toLowerCase();

  // 1. General & Chat
  caps.add("general_purpose");
  caps.add("chat");
  caps.add("instruction_following");

  // 2. Reasoning
  if (
    cat.includes("reasoning") ||
    name.includes("reasoning") ||
    name.includes("r1") ||
    name.includes("o1") ||
    name.includes("o3") ||
    name.includes("o4") ||
    name.includes("qwq") ||
    name.includes("thinking") ||
    desc.includes("chain of thought") ||
    desc.includes("reasoning")
  ) {
    caps.add("reasoning");
    caps.add("math");
  }

  // 3. Coding
  if (
    cat.includes("code") ||
    name.includes("coder") ||
    name.includes("code") ||
    id.includes("coder") ||
    desc.includes("programming") ||
    desc.includes("software") ||
    desc.includes("python")
  ) {
    caps.add("code");
    caps.add("coding");
  }

  // 4. Vision & Multimodal
  if (
    modality.includes("image") ||
    modality.includes("video") ||
    modality.includes("multimodal") ||
    name.includes("vl") ||
    name.includes("vision") ||
    name.includes("florence") ||
    name.includes("pixtral") ||
    desc.includes("vision") ||
    desc.includes("images")
  ) {
    caps.add("vision");
    caps.add("multimodal");
    caps.add("computer_vision");
  }

  // 5. Audio & Speech
  if (
    cat.includes("audio") ||
    name.includes("audio") ||
    name.includes("whisper") ||
    name.includes("speech") ||
    name.includes("voxtral") ||
    desc.includes("speech") ||
    desc.includes("voice") ||
    desc.includes("transcription")
  ) {
    caps.add("audio");
    caps.add("speech");
  }

  // 6. Tools & Agents
  if (
    desc.includes("tool") ||
    desc.includes("agent") ||
    desc.includes("function calling") ||
    desc.includes("api") ||
    name.includes("agent") ||
    name.includes("operator")
  ) {
    caps.add("tools");
    caps.add("tool_use");
    caps.add("agents");
    caps.add("planning");
  }

  // 7. OCR & Document AI
  if (
    name.includes("ocr") ||
    name.includes("document") ||
    name.includes("miner") ||
    desc.includes("document") ||
    desc.includes("pdf") ||
    desc.includes("ocr")
  ) {
    caps.add("ocr");
    caps.add("document_ai");
  }

  // 8. Robotics
  if (
    name.includes("robot") ||
    name.includes("openvla") ||
    name.includes("rt-") ||
    desc.includes("manipulation") ||
    desc.includes("robot")
  ) {
    caps.add("robotics");
  }

  // 9. Healthcare
  if (
    name.includes("med") ||
    name.includes("health") ||
    name.includes("clinical") ||
    desc.includes("biomedical") ||
    desc.includes("clinical")
  ) {
    caps.add("healthcare");
  }

  // 10. Translation
  if (
    desc.includes("translation") ||
    desc.includes("multilingual") ||
    name.includes("translate")
  ) {
    caps.add("translation");
  }

  // 11. Embeddings
  if (
    name.includes("embed") ||
    cat.includes("embed") ||
    desc.includes("embedding") ||
    desc.includes("vector")
  ) {
    caps.add("embeddings");
    caps.add("search");
  }

  return Array.from(caps);
}

// Helper: Classify Research Areas
function classifyResearchAreas(model, capabilities) {
  const areas = new Set(["Large Language Models", "Artificial Intelligence", "Deep Learning"]);
  if (capabilities.includes("reasoning")) areas.add("Reasoning");
  if (capabilities.includes("code")) areas.add("Code Intelligence");
  if (capabilities.includes("vision")) {
    areas.add("Computer Vision");
    areas.add("Multimodal AI");
  }
  if (capabilities.includes("audio")) areas.add("Audio");
  if (capabilities.includes("document_ai")) areas.add("Document AI");
  if (capabilities.includes("ocr")) areas.add("OCR");
  if (capabilities.includes("agents")) areas.add("Agentic AI");
  if (capabilities.includes("math")) areas.add("Mathematics");
  if (capabilities.includes("robotics")) areas.add("Robotics & Embodied AI");
  if (capabilities.includes("healthcare")) areas.add("Healthcare AI");
  if (capabilities.includes("translation")) areas.add("Translation");
  if (capabilities.includes("embeddings") || capabilities.includes("search")) areas.add("Search & Retrieval");
  return Array.from(areas);
}

// Helper: Normalize Vendor name
function normalizeVendor(rawVendor, modelId) {
  if (rawVendor && rawVendor.trim()) {
    const v = rawVendor.trim();
    if (v.toLowerCase() === 'openai') return 'OpenAI';
    if (v.toLowerCase() === 'google') return 'Google';
    if (v.toLowerCase() === 'anthropic') return 'Anthropic';
    if (v.toLowerCase() === 'meta') return 'Meta';
    if (v.toLowerCase() === 'mistral' || v.toLowerCase() === 'mistralai' || v.toLowerCase() === 'mistral ai') return 'Mistral AI';
    if (v.toLowerCase() === 'cohere') return 'Cohere';
    if (v.toLowerCase() === 'alibaba' || v.toLowerCase() === 'qwen') return 'Alibaba';
    if (v.toLowerCase() === 'deepseek' || v.toLowerCase() === 'deepseek-ai') return 'DeepSeek';
    if (v.toLowerCase() === 'microsoft') return 'Microsoft';
    if (v.toLowerCase() === 'amazon') return 'Amazon';
    if (v.toLowerCase() === 'bytedance') return 'ByteDance';
    return v;
  }
  if (modelId && modelId.includes('/')) {
    const prefix = modelId.split('/')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'Unknown';
}

// Helper: Normalize Model Family
function normalizeFamily(name, id) {
  const lower = ((name || '') + ' ' + (id || '')).toLowerCase();
  if (lower.includes('gpt-4')) return 'GPT-4';
  if (lower.includes('gpt-5')) return 'GPT-5';
  if (lower.includes('gpt-3')) return 'GPT-3';
  if (lower.includes('claude')) return 'Claude';
  if (lower.includes('gemini')) return 'Gemini';
  if (lower.includes('gemma')) return 'Gemma';
  if (lower.includes('llama')) return 'Llama';
  if (lower.includes('deepseek')) return 'DeepSeek';
  if (lower.includes('mistral')) return 'Mistral';
  if (lower.includes('qwen')) return 'Qwen';
  if (lower.includes('phi')) return 'Phi';
  if (lower.includes('command')) return 'Command';
  if (lower.includes('florence')) return 'Florence';
  if (lower.includes('whisper')) return 'Whisper';
  if (lower.includes('openvla')) return 'OpenVLA';
  if (lower.includes('palmyra')) return 'Palmyra';
  return 'General Models';
}

async function main() {
  console.log('====================================================');
  console.log('STARTING CATALOG SYNC, ENRICHMENT & VARIANT PIPELINE');
  console.log('====================================================');

  // Step 1: Run migration on all shards
  for (const [shardName, url] of Object.entries(SHARDS)) {
    try {
      console.log(`Running migration on ${shardName}...`);
      const sql = neon(url);
      await sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT true`;
      await sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS canonical_model_id TEXT`;
      await sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS source_catalog TEXT DEFAULT 'openrouter'`;
      await sql`CREATE INDEX IF NOT EXISTS idx_models_is_canonical ON models(is_canonical)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_models_canonical_model_id ON models(canonical_model_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_models_release_date ON models(release_date DESC NULLS LAST)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_models_capabilities_gin ON models USING gin(capabilities)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_models_research_areas_gin ON models USING gin(research_areas)`;
      try {
        await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
        await sql`CREATE INDEX IF NOT EXISTS idx_models_name_trgm ON models USING gin(name gin_trgm_ops)`;
      } catch (e) {
        console.warn(`pg_trgm note on ${shardName}:`, e.message);
      }
      console.log(`Migration applied to ${shardName}`);
    } catch (err) {
      console.error(`Migration error on ${shardName}:`, err.message);
    }
  }

  // Step 2: Ingest from OpenRouter
  console.log('\n--- Ingesting OpenRouter Catalog ---');
  let openRouterModels = [];
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    const json = await res.json();
    openRouterModels = json.data || [];
    console.log(`Fetched ${openRouterModels.length} models from OpenRouter.`);
  } catch (err) {
    console.error('Failed to fetch OpenRouter:', err.message);
  }

  // Step 3: Ingest LiteLLM Catalog
  console.log('\n--- Ingesting LiteLLM Pricing & Specs ---');
  let liteLlmData = {};
  try {
    const res = await fetch('https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json');
    liteLlmData = await res.json();
    console.log(`Fetched ${Object.keys(liteLlmData).length} LiteLLM entries.`);
  } catch (err) {
    console.error('Failed to fetch LiteLLM:', err.message);
  }

  // Step 4: Ingest Hugging Face Domain-Specific Models
  console.log('\n--- Ingesting Hugging Face Specialized Domains ---');
  const hfDomains = [
    { tag: 'robotics', param: 'pipeline_tag', limit: 15, defaultCat: 'Robotics' },
    { tag: 'image-classification', param: 'pipeline_tag', limit: 15, defaultCat: 'Vision' },
    { tag: 'text-to-image', param: 'pipeline_tag', limit: 15, defaultCat: 'Vision' },
    { tag: 'automatic-speech-recognition', param: 'pipeline_tag', limit: 15, defaultCat: 'Audio' },
    { tag: 'text-to-speech', param: 'pipeline_tag', limit: 15, defaultCat: 'Audio' },
    { tag: 'sentence-similarity', param: 'pipeline_tag', limit: 15, defaultCat: 'Embeddings' },
    { tag: 'document-question-answering', param: 'pipeline_tag', limit: 15, defaultCat: 'Vision' },
  ];

  let hfModels = [];
  for (const domain of hfDomains) {
    try {
      const url = `https://huggingface.co/api/models?${domain.param}=${domain.tag}&sort=downloads&direction=-1&limit=${domain.limit}`;
      const res = await fetch(url);
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          hfModels.push({
            id: item.id,
            name: item.id.includes('/') ? item.id.split('/')[1] : item.id,
            vendor: item.id.includes('/') ? item.id.split('/')[0] : 'HuggingFace',
            description: `Top downloaded ${domain.tag} model on Hugging Face (${item.downloads?.toLocaleString() || 0} downloads).`,
            pipelineTag: domain.tag,
            category: domain.defaultCat,
            tags: item.tags || [],
            source: 'huggingface'
          });
        }
      }
    } catch (e) {
      console.warn(`HF domain ${domain.tag} fetch warning:`, e.message);
    }
  }
  console.log(`Ingested ${hfModels.length} domain-specific models from Hugging Face.`);

  // Step 5: Process and Merge models into canonical catalog
  console.log('\n--- Merging & Collapsing Variants ---');
  const allModelsMap = new Map();

  // First, add OpenRouter models
  for (const m of openRouterModels) {
    const rawId = m.id;
    const vendor = normalizeVendor(m.top_provider?.vendor || m.id.split('/')[0], m.id);
    const family = normalizeFamily(m.name, m.id);

    // LiteLLM lookup
    const litellmKey = rawId;
    const llm = liteLlmData[litellmKey] || liteLlmData[rawId.replace(/^[^/]+\//, '')] || {};

    const promptPrice = m.pricing?.prompt ? parseFloat(m.pricing.prompt) * 1_000_000 : (llm.input_cost_per_token ? llm.input_cost_per_token * 1_000_000 : null);
    const compPrice = m.pricing?.completion ? parseFloat(m.pricing.completion) * 1_000_000 : (llm.output_cost_per_token ? llm.output_cost_per_token * 1_000_000 : null);
    const contextWindow = m.context_length || llm.max_input_tokens || llm.max_tokens || null;
    const maxOutput = m.top_provider?.max_completion_tokens || llm.max_output_tokens || null;

    const isOpen = (m.description || '').toLowerCase().includes('open weight') ||
                   (m.description || '').toLowerCase().includes('open source') ||
                   (m.license || '').toLowerCase().includes('apache') ||
                   (m.license || '').toLowerCase().includes('mit') ||
                   vendor === 'Meta' || vendor === 'Mistral AI' || vendor === 'Qwen' || vendor === 'DeepSeek';

    let category = 'General LLM';
    if ((m.description || '').toLowerCase().includes('reasoning') || m.id.includes('r1') || m.id.includes('o1') || m.id.includes('o3')) category = 'Reasoning';
    else if ((m.description || '').toLowerCase().includes('vision') || (m.architecture?.modality || '').includes('image')) category = 'Vision';
    else if ((m.description || '').toLowerCase().includes('code') || m.id.includes('code') || m.id.includes('coder')) category = 'Code Generation';
    else if ((m.description || '').toLowerCase().includes('audio') || (m.architecture?.modality || '').includes('audio')) category = 'Audio';

    const caps = classifyCapabilities({ ...m, category });
    const areas = classifyResearchAreas(m, caps);

    // Check if variant
    const isVariant = rawId.includes(':batch') || rawId.includes(':free') || rawId.includes(':extended') || rawId.includes(':floor');
    const canonicalId = isVariant ? rawId.split(':')[0] : rawId;
    const variantTag = isVariant ? rawId.split(':')[1] : null;

    allModelsMap.set(rawId, {
      id: rawId,
      name: m.name || rawId,
      slug: slugify(rawId),
      vendor,
      vendor_logo_url: `https://www.google.com/s2/favicons?domain=${slugify(vendor)}.com&sz=128`,
      description: m.description || `High-performance ${category} model from ${vendor}.`,
      parameter_count: null,
      modality: (m.architecture?.modality || 'text').includes('image') ? 'multimodal' : 'text',
      access_type: isOpen ? 'Open Weights / API' : 'Commercial API',
      openness_type: isOpen ? 'Open Weights' : 'Proprietary',
      release_date: m.created ? new Date(m.created * 1000).toISOString() : new Date().toISOString(),
      model_family: family,
      category,
      capabilities: caps,
      research_areas: areas,
      architecture: m.architecture || {},
      context_window: contextWindow,
      max_output_tokens: maxOutput,
      input_cost_per_mtoken: promptPrice !== null && !isNaN(promptPrice) ? promptPrice : null,
      output_cost_per_mtoken: compPrice !== null && !isNaN(compPrice) ? compPrice : null,
      license: isOpen ? 'Open / Community' : 'Proprietary',
      paper_url: null,
      repositoryUrl: null,
      api_url: `https://openrouter.ai/${rawId}`,
      hugging_face_id: m.hugging_face_id || null,
      trending_score: isVariant ? 50 : 100,
      is_canonical: !isVariant,
      canonical_model_id: isVariant ? canonicalId : null,
      variant_tag: variantTag,
      source_catalog: 'openrouter'
    });
  }

  // Next, add Hugging Face specialized models
  for (const hf of hfModels) {
    if (!allModelsMap.has(hf.id)) {
      const caps = classifyCapabilities(hf);
      const areas = classifyResearchAreas(hf, caps);
      const family = normalizeFamily(hf.name, hf.id);

      allModelsMap.set(hf.id, {
        id: hf.id,
        name: hf.name,
        slug: slugify(hf.id),
        vendor: normalizeVendor(hf.vendor, hf.id),
        vendor_logo_url: `https://www.google.com/s2/favicons?domain=huggingface.co&sz=128`,
        description: hf.description,
        parameter_count: hf.name.match(/\b\d+b\b/i)?.[0]?.toUpperCase() || null,
        modality: hf.category === 'Vision' ? 'multimodal' : (hf.category === 'Audio' ? 'audio' : 'text'),
        access_type: 'Open Weights',
        openness_type: 'Open Weights',
        release_date: new Date().toISOString(),
        model_family: family,
        category: hf.category,
        capabilities: caps,
        research_areas: areas,
        architecture: { pipeline_tag: hf.pipelineTag },
        context_window: null,
        max_output_tokens: null,
        input_cost_per_mtoken: null,
        output_cost_per_mtoken: null,
        license: 'Open Weights / Apache 2.0',
        paper_url: null,
        repository_url: `https://huggingface.co/${hf.id}`,
        api_url: null,
        hugging_face_id: hf.id,
        trending_score: 90,
        is_canonical: true,
        canonical_model_id: null,
        variant_tag: null,
        source_catalog: 'huggingface'
      });
    }
  }

  // Step 6: Assemble variants into canonical models
  console.log('\n--- Grouping Variants under Canonical Models ---');
  for (const [id, m] of allModelsMap.entries()) {
    if (!m.is_canonical && m.canonical_model_id) {
      const parent = allModelsMap.get(m.canonical_model_id);
      if (parent) {
        if (!parent.variants) parent.variants = [];
        parent.variants.push({
          id: m.id,
          name: m.name,
          slug: m.slug,
          tag: m.variant_tag,
          input_cost_per_mtoken: m.input_cost_per_mtoken,
          output_cost_per_mtoken: m.output_cost_per_mtoken,
          context_window: m.context_window
        });
      }
    }
  }

  const modelRecords = Array.from(allModelsMap.values());
  const canonicalCount = modelRecords.filter(m => m.is_canonical).length;
  const variantCount = modelRecords.filter(m => !m.is_canonical).length;
  console.log(`Total Models: ${modelRecords.length} (${canonicalCount} canonical, ${variantCount} collapsed variants)`);

  // Step 7: Insert Landmark Papers into database shards
  console.log('\n--- Ingesting Landmark Papers Across Shards ---');
  for (const [shardName, url] of Object.entries(SHARDS)) {
    try {
      const sql = neon(url);
      const [hasAuthorsCol] = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'papers' AND column_name = 'authors'`;

      for (const p of LANDMARK_PAPERS) {
        if (hasAuthorsCol) {
          await sql`
            INSERT INTO papers (id, title, slug, abstract, publication_date, arxiv_id, paper_url, pdf_url, authors)
            VALUES (
              gen_random_uuid(),
              ${p.title},
              ${p.slug},
              ${p.abstract},
              ${p.publishedAt}::timestamp,
              ${p.arxivId},
              ${`https://arxiv.org/abs/${p.arxivId}`},
              ${`https://arxiv.org/pdf/${p.arxivId}.pdf`},
              ${JSON.stringify(p.authors.map(a => ({ name: a })))}::jsonb
            )
            ON CONFLICT (slug) DO UPDATE SET
              title = EXCLUDED.title,
              abstract = EXCLUDED.abstract,
              arxiv_id = EXCLUDED.arxiv_id,
              publication_date = EXCLUDED.publication_date
          `;
        } else {
          await sql`
            INSERT INTO papers (id, title, slug, abstract, publication_date, arxiv_id, paper_url, pdf_url)
            VALUES (
              gen_random_uuid(),
              ${p.title},
              ${p.slug},
              ${p.abstract},
              ${p.publishedAt}::timestamp,
              ${p.arxivId},
              ${`https://arxiv.org/abs/${p.arxivId}`},
              ${`https://arxiv.org/pdf/${p.arxivId}.pdf`}
            )
            ON CONFLICT (slug) DO UPDATE SET
              title = EXCLUDED.title,
              abstract = EXCLUDED.abstract,
              arxiv_id = EXCLUDED.arxiv_id,
              publication_date = EXCLUDED.publication_date
          `;
        }
      }
      console.log(`Landmark papers synced to ${shardName}`);
    } catch (e) {
      console.error(`Error syncing landmark papers on ${shardName}:`, e.message);
    }
  }

  // Step 8: Sync Models Table Across All Shards
  console.log('\n--- Synchronizing Models Table Across Shards ---');
  for (const [shardName, url] of Object.entries(SHARDS)) {
    try {
      console.log(`Syncing ${modelRecords.length} models to ${shardName}...`);
      const sql = neon(url);

      const BATCH_SIZE = 25;
      for (let i = 0; i < modelRecords.length; i += BATCH_SIZE) {
        const chunk = modelRecords.slice(i, i + BATCH_SIZE);
        await Promise.all(
          chunk.map((m) =>
            sql`
              INSERT INTO models (
                id, name, slug, vendor, vendor_logo_url, description, parameter_count,
                modality, access_type, openness_type, release_date, model_family,
                category, capabilities, research_areas, architecture, context_window,
                max_output_tokens, input_cost_per_mtoken, output_cost_per_mtoken,
                license, paper_url, repository_url, api_url, hugging_face_id,
                trending_score, is_canonical, canonical_model_id, variants, source_catalog
              ) VALUES (
                ${m.id}, ${m.name}, ${m.slug}, ${m.vendor}, ${m.vendor_logo_url}, ${m.description}, ${m.parameter_count},
                ${m.modality}, ${m.access_type}, ${m.openness_type}, ${m.release_date}::timestamp, ${m.model_family},
                ${m.category}, ${JSON.stringify(m.capabilities)}::jsonb, ${JSON.stringify(m.research_areas)}::jsonb,
                ${JSON.stringify(m.architecture)}::jsonb, ${m.context_window},
                ${m.max_output_tokens}, ${m.input_cost_per_mtoken}, ${m.output_cost_per_mtoken},
                ${m.license}, ${m.paper_url}, ${m.repository_url}, ${m.api_url}, ${m.hugging_face_id},
                ${m.trending_score}, ${m.is_canonical}, ${m.canonical_model_id},
                ${JSON.stringify(m.variants || [])}::jsonb, ${m.source_catalog}
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                slug = EXCLUDED.slug,
                vendor = EXCLUDED.vendor,
                vendor_logo_url = EXCLUDED.vendor_logo_url,
                description = EXCLUDED.description,
                modality = EXCLUDED.modality,
                access_type = EXCLUDED.access_type,
                openness_type = EXCLUDED.openness_type,
                release_date = EXCLUDED.release_date,
                model_family = EXCLUDED.model_family,
                category = EXCLUDED.category,
                capabilities = EXCLUDED.capabilities,
                research_areas = EXCLUDED.research_areas,
                architecture = EXCLUDED.architecture,
                context_window = EXCLUDED.context_window,
                max_output_tokens = EXCLUDED.max_output_tokens,
                input_cost_per_mtoken = EXCLUDED.input_cost_per_mtoken,
                output_cost_per_mtoken = EXCLUDED.output_cost_per_mtoken,
                license = EXCLUDED.license,
                api_url = EXCLUDED.api_url,
                hugging_face_id = EXCLUDED.hugging_face_id,
                trending_score = EXCLUDED.trending_score,
                is_canonical = EXCLUDED.is_canonical,
                canonical_model_id = EXCLUDED.canonical_model_id,
                variants = EXCLUDED.variants,
                source_catalog = EXCLUDED.source_catalog
            `
          )
        );
      }
      console.log(`Successfully synced models to ${shardName}`);
    } catch (e) {
      console.error(`Error syncing models on ${shardName}:`, e.message);
    }
  }

  // Step 9: Sync paper_models mappings across shards
  console.log('\n--- Synchronizing Model-Paper Mappings Across Shards ---');
  for (const [shardName, url] of Object.entries(SHARDS)) {
    try {
      const sql = neon(url);
      let mapSuccess = 0;

      for (const p of LANDMARK_PAPERS) {
        // Find paper id in this shard
        const [paperRow] = await sql`SELECT id FROM papers WHERE slug = ${p.slug} LIMIT 1`;
        if (!paperRow) continue;

        for (const modelId of p.modelsMapped) {
          // Check if model exists
          const [mRow] = await sql`SELECT id FROM models WHERE id = ${modelId} LIMIT 1`;
          if (mRow) {
            await sql`
              INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source)
              VALUES (${paperRow.id}, ${modelId}, 'introduced', 0.99, ${'official_technical_report:' + p.arxivId})
              ON CONFLICT DO NOTHING
            `;
            mapSuccess++;
          }

          // Inherit mapping to any variants (e.g. :batch, :free)
          const [batchRow] = await sql`SELECT id FROM models WHERE id = ${modelId + ':batch'}`;
          if (batchRow) {
            await sql`
              INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source)
              VALUES (${paperRow.id}, ${modelId + ':batch'}, 'introduced', 0.99, ${'inherited_from_canonical:' + modelId})
              ON CONFLICT DO NOTHING
            `;
            mapSuccess++;
          }
          const [freeRow] = await sql`SELECT id FROM models WHERE id = ${modelId + ':free'}`;
          if (freeRow) {
            await sql`
              INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source)
              VALUES (${paperRow.id}, ${modelId + ':free'}, 'introduced', 0.99, ${'inherited_from_canonical:' + modelId})
              ON CONFLICT DO NOTHING
            `;
            mapSuccess++;
          }
        }
      }
      console.log(`Synced ${mapSuccess} paper mappings to ${shardName}`);
    } catch (e) {
      console.error(`Error syncing paper mappings on ${shardName}:`, e.message);
    }
  }

  console.log('\n====================================================');
  console.log('CATALOG SYNC, ENRICHMENT & VARIANT COLLAPSING COMPLETED');
  console.log('====================================================');
}

main().catch(console.error);
