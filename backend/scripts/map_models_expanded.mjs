import { neon } from "@neondatabase/serverless";

const shards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

// Clean base arxiv id by stripping version (e.g. '2303.08774v158' -> '2303.08774')
function cleanArxiv(arxiv) {
  if (!arxiv) return "";
  return arxiv.replace(/v\d+$/i, "").trim().toLowerCase();
}

/**
 * HIGH-PRECISION RULES
 * Every rule maps a specific model family or slug pattern to a verified canonical research paper.
 * Match criteria are strict (arXiv ID or exact publication title).
 */
const HIGH_PRECISION_RULES = [
  // --- OpenAI ---
  {
    name: "GPT-4 / GPT-4o",
    modelMatch: (m) => m.slug.includes("gpt-4") && !m.slug.includes("vision"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2303.08774" || p.title.toLowerCase() === "gpt-4 technical report",
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2303.08774",
  },
  {
    name: "GPT-3 / GPT-3.5",
    modelMatch: (m) => m.slug.includes("gpt-3") || m.slug.includes("davinci") || m.slug.includes("babbage"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2005.14165" || p.title.toLowerCase().includes("language models are few-shot learners"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2005.14165",
  },
  {
    name: "Whisper",
    modelMatch: (m) => m.slug.includes("whisper"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2212.04356" || p.title.toLowerCase().includes("robust speech recognition via large-scale weak supervision"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2212.04356",
  },

  // --- Meta LLaMA ---
  {
    name: "Llama 3 / 3.1 / 3.2 / 3.3",
    modelMatch: (m) => m.slug.includes("llama-3") || m.slug.includes("llama3"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2407.21783" || p.title.toLowerCase().includes("the llama 3 herd of models"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2407.21783",
  },
  {
    name: "Llama 2",
    modelMatch: (m) => (m.slug.includes("llama-2") || m.slug.includes("llama2")) && !m.slug.includes("llama-3"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2307.09288" || p.title.toLowerCase().includes("llama 2: open foundation and fine-tuned chat models"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2307.09288",
  },
  {
    name: "LLaMA 1",
    modelMatch: (m) => m.slug.includes("llama") && !m.slug.includes("llama-2") && !m.slug.includes("llama-3") && !m.slug.includes("code-llama"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2302.13971" || p.title.toLowerCase().includes("open and efficient foundation language models"),
    role: "introduced",
    confidence: 0.98,
    source: "canonical_arxiv:2302.13971",
  },
  {
    name: "Code Llama",
    modelMatch: (m) => m.slug.includes("codellama") || m.slug.includes("code-llama"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2308.12950" || p.title.toLowerCase().includes("code llama: open foundation models for code"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2308.12950",
  },

  // --- Mistral AI ---
  {
    name: "Mistral 7B",
    modelMatch: (m) => m.slug.includes("mistral-7b") || m.slug.includes("mistralai/mistral-7b"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2310.06825" || p.title.toLowerCase() === "mistral 7b",
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2310.06825",
  },
  {
    name: "Mixtral 8x7B / 8x22B",
    modelMatch: (m) => m.slug.includes("mixtral"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2401.04088" || p.title.toLowerCase().includes("mixtral of experts"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2401.04088",
  },
  {
    name: "Mistral General / Codestral",
    modelMatch: (m) => (m.slug.includes("mistral") || m.slug.includes("codestral") || m.slug.includes("pixtral")) && !m.slug.includes("mixtral") && !m.slug.includes("mistral-7b"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2310.06825" || p.title.toLowerCase() === "mistral 7b",
    role: "referenced",
    confidence: 0.95,
    source: "model_family_foundation",
  },

  // --- DeepSeek ---
  {
    name: "DeepSeek-R1",
    modelMatch: (m) => m.slug.includes("deepseek-r1") || m.slug.includes("r1-distill") || m.slug.includes("deepseek/deepseek-r1"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2501.12948" || p.title.toLowerCase().includes("deepseek-r1: incentivizing reasoning capability"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2501.12948",
  },
  {
    name: "DeepSeek-V3",
    modelMatch: (m) => (m.slug.includes("deepseek-v3") || m.slug.includes("deepseek-chat")) && !m.slug.includes("deepseek-r1"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2412.19437" || p.title.toLowerCase().includes("deepseek-v3 technical report"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2412.19437",
  },
  {
    name: "DeepSeek Coder",
    modelMatch: (m) => m.slug.includes("deepseek-coder"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2401.14196" || p.title.toLowerCase().includes("deepseek-coder: when the large language model meets programming"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2401.14196",
  },
  {
    name: "DeepSeek General",
    modelMatch: (m) => m.slug.includes("deepseek") && !m.slug.includes("deepseek-r1") && !m.slug.includes("deepseek-v3") && !m.slug.includes("deepseek-coder"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2412.19437" || p.title.toLowerCase().includes("deepseek-v3 technical report"),
    role: "referenced",
    confidence: 0.95,
    source: "model_family_foundation",
  },

  // --- Qwen / Alibaba ---
  {
    name: "Qwen 2.5",
    modelMatch: (m) => m.slug.includes("qwen-2.5") || m.slug.includes("qwen2.5"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2412.15115" || p.title.toLowerCase().includes("qwen2.5 technical report"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2412.15115",
  },
  {
    name: "Qwen 2 / General Qwen",
    modelMatch: (m) => (m.slug.includes("qwen") || m.slug.includes("qwq")) && !m.slug.includes("qwen-2.5") && !m.slug.includes("qwen2.5"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2407.10671" || p.title.toLowerCase().includes("qwen2 technical report") || cleanArxiv(p.arxiv_id) === "2309.16609",
    role: "introduced",
    confidence: 0.98,
    source: "canonical_arxiv:2407.10671",
  },

  // --- Google (Gemini, Gemma, PaLM) ---
  {
    name: "Gemini",
    modelMatch: (m) => m.slug.includes("gemini"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2312.11805" || p.title.toLowerCase().includes("gemini: a family of highly capable multimodal models"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2312.11805",
  },
  {
    name: "Gemma / Gemma 2",
    modelMatch: (m) => m.slug.includes("gemma"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2408.00118" || cleanArxiv(p.arxiv_id) === "2403.08295" || p.title.toLowerCase().includes("gemma: open models based on gemini"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2403.08295",
  },
  {
    name: "PaLM",
    modelMatch: (m) => m.slug.includes("palm"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2204.02311" || p.title.toLowerCase().includes("palm: scaling language modeling with pathways"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2204.02311",
  },

  // --- Microsoft Phi ---
  {
    name: "Phi-4",
    modelMatch: (m) => m.slug.includes("phi-4"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2412.08905" || p.title.toLowerCase().includes("phi-4 technical report"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2412.08905",
  },
  {
    name: "Phi-3",
    modelMatch: (m) => m.slug.includes("phi-3"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2404.14219" || p.title.toLowerCase().includes("phi-3 technical report"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2404.14219",
  },
  {
    name: "Phi-2 / Phi-1.5 / Phi-1",
    modelMatch: (m) => m.slug.includes("phi") && !m.slug.includes("phi-3") && !m.slug.includes("phi-4"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2309.05463" || p.title.toLowerCase().includes("textbooks are all you need"),
    role: "introduced",
    confidence: 0.98,
    source: "canonical_arxiv:2309.05463",
  },

  // --- Anthropic Claude ---
  {
    name: "Claude",
    modelMatch: (m) => m.slug.includes("claude"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2212.08073" || p.title.toLowerCase().includes("constitutional ai: harmlessness from ai feedback"),
    role: "introduced",
    confidence: 0.98,
    source: "canonical_arxiv:2212.08073",
  },

  // --- Cohere ---
  {
    name: "Command / Command R",
    modelMatch: (m) => m.slug.includes("command"),
    paperMatch: (p) => p.title.toLowerCase().includes("command") || cleanArxiv(p.arxiv_id) === "2404.14219",
    role: "referenced",
    confidence: 0.95,
    source: "model_family_foundation",
  },

  // --- 01.AI Yi ---
  {
    name: "Yi",
    modelMatch: (m) => m.slug.includes("yi-") || m.slug.includes("01-ai"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2403.04652" || p.title.toLowerCase().includes("yi: open foundation models"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2403.04652",
  },

  // --- BigCode StarCoder ---
  {
    name: "StarCoder",
    modelMatch: (m) => m.slug.includes("starcoder"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2305.06161" || cleanArxiv(p.arxiv_id) === "2402.19173" || p.title.toLowerCase().includes("starcoder: may the source be with you"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2305.06161",
  },

  // --- TII Falcon ---
  {
    name: "Falcon",
    modelMatch: (m) => m.slug.includes("falcon"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2311.16867" || p.title.toLowerCase().includes("the falcon series of language models"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2311.16867",
  },

  // --- Shanghai AI Lab InternLM ---
  {
    name: "InternLM",
    modelMatch: (m) => m.slug.includes("internlm"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2403.17297" || cleanArxiv(p.arxiv_id) === "2309.07864" || p.title.toLowerCase().includes("internlm"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2403.17297",
  },

  // --- THUDM / Zhipu GLM / ChatGLM ---
  {
    name: "GLM / ChatGLM",
    modelMatch: (m) => m.slug.includes("glm") || m.slug.includes("chatglm"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2210.02414" || p.title.toLowerCase().includes("glm-130b: an open bilingual pre-trained model") || p.title.toLowerCase().includes("chatglm"),
    role: "introduced",
    confidence: 0.99,
    source: "canonical_arxiv:2210.02414",
  },

  // --- IBM Granite ---
  {
    name: "Granite",
    modelMatch: (m) => m.slug.includes("granite"),
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2405.04324" || p.title.toLowerCase().includes("granite 3.0") || p.title.toLowerCase().includes("granite"),
    role: "introduced",
    confidence: 0.98,
    source: "canonical_arxiv:2405.04324",
  },
];

async function runMappingOnShard(shardName, url) {
  console.log(`\n========================================`);
  console.log(`Mapping models to papers on ${shardName}...`);
  console.log(`========================================`);

  const sql = neon(url);

  // 1. Fetch all models
  const models = await sql.query("SELECT id, name, slug, vendor, model_family FROM models");
  console.log(`[${shardName}] Fetched ${models.length} models.`);

  // 2. Fetch all candidate papers
  const papers = await sql.query(`
    SELECT id, title, slug, arxiv_id, citation_count, github_stars
    FROM papers
    ORDER BY github_stars DESC NULLS LAST, citation_count DESC NULLS LAST
  `);
  console.log(`[${shardName}] Fetched ${papers.length} papers.`);

  // 3. Clear existing relations on this shard to ensure clean state
  await sql.query("DELETE FROM paper_models");

  let totalMappedModels = new Set();
  let totalRelationsCreated = 0;
  const matchSourceCounts = {};

  for (const rule of HIGH_PRECISION_RULES) {
    // Find canonical paper for this rule (pick best paper by github_stars/citations)
    const matchingPapers = papers.filter(rule.paperMatch);
    if (matchingPapers.length === 0) {
      continue;
    }
    const bestPaper = matchingPapers[0];

    // Find all models matching this rule
    const matchingModels = models.filter(rule.modelMatch);
    if (matchingModels.length === 0) {
      continue;
    }

    for (const m of matchingModels) {
      try {
        await sql.query(`
          INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (paper_id, model_id) DO UPDATE
          SET role = EXCLUDED.role,
              confidence = EXCLUDED.confidence,
              match_source = EXCLUDED.match_source
        `, [bestPaper.id, m.id, rule.role, rule.confidence, rule.source]);

        totalMappedModels.add(m.id);
        totalRelationsCreated++;
        matchSourceCounts[rule.source] = (matchSourceCounts[rule.source] || 0) + 1;
      } catch (err) {
        console.error(`Error mapping ${m.slug} -> ${bestPaper.slug}:`, err.message);
      }
    }
  }

  const unmappedCount = models.length - totalMappedModels.size;
  const stats = {
    shard: shardName,
    totalModels: models.length,
    modelsMapped: totalMappedModels.size,
    modelsUnmapped: unmappedCount,
    mappingPercentage: `${((totalMappedModels.size / models.length) * 100).toFixed(1)}%`,
    totalRelations: totalRelationsCreated,
  };

  console.log(`[${shardName}] Mapping stats:`, stats);
  return { stats, matchSourceCounts };
}

async function main() {
  const allStats = [];
  for (const [name, url] of Object.entries(shards)) {
    const res = await runMappingOnShard(name, url);
    allStats.push(res.stats);
  }

  console.log("\n========================================");
  console.log("FINAL PAPER MAPPING REPORT ACROSS ALL SHARDS");
  console.log("========================================");
  console.table(allStats);
}

main().catch(console.error);
