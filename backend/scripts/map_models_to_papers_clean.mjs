import pg from "pg";

const shards = {
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

// Clean base arxiv id by stripping version (e.g. '2303.08774v158' -> '2303.08774')
function cleanArxiv(arxiv) {
  if (!arxiv) return "";
  return arxiv.replace(/v\d+$/i, "").trim();
}

const CANONICAL_RULES = [
  {
    family: "GPT-4",
    paperMatch: (p) => cleanArxiv(p.arxiv_id) === "2303.08774" || p.title.toLowerCase() === "gpt-4 technical report",
    modelMatch: (m) => m.slug.includes("gpt-4"),
    role: "introduced",
  },
  {
    family: "Llama 3",
    paperMatch: (p) => p.title.toLowerCase().includes("llama 3") || p.title.toLowerCase().includes("the llama 3 herd of models"),
    modelMatch: (m) => m.slug.includes("llama-3"),
    role: "introduced",
  },
  {
    family: "Llama 2",
    paperMatch: (p) => p.title.toLowerCase().includes("llama 2"),
    modelMatch: (m) => m.slug.includes("llama-2"),
    role: "introduced",
  },
  {
    family: "LLaMA 1",
    paperMatch: (p) => p.title.toLowerCase().includes("open and efficient foundation language models"),
    modelMatch: (m) => m.slug.includes("llama") && !m.slug.includes("llama-2") && !m.slug.includes("llama-3"),
    role: "introduced",
  },
  {
    family: "Mistral 7B",
    paperMatch: (p) => p.title.toLowerCase().includes("mistral 7b"),
    modelMatch: (m) => m.slug.includes("mistral-7b"),
    role: "introduced",
  },
  {
    family: "Mixtral 8x7B",
    paperMatch: (p) => p.title.toLowerCase().includes("mixtral of experts"),
    modelMatch: (m) => m.slug.includes("mixtral"),
    role: "introduced",
  },
  {
    family: "DeepSeek-R1",
    paperMatch: (p) => p.title.toLowerCase().includes("deepseek-r1"),
    modelMatch: (m) => m.slug.includes("deepseek-r1"),
    role: "introduced",
  },
  {
    family: "DeepSeek-V3",
    paperMatch: (p) => p.title.toLowerCase().includes("deepseek-v3"),
    modelMatch: (m) => m.slug.includes("deepseek-v3") || m.slug.includes("deepseek-chat"),
    role: "introduced",
  },
  {
    family: "Qwen 2.5",
    paperMatch: (p) => p.title.toLowerCase().includes("qwen2.5") || p.title.toLowerCase().includes("qwen 2.5"),
    modelMatch: (m) => m.slug.includes("qwen-2.5") || m.slug.includes("qwen2.5"),
    role: "introduced",
  },
  {
    family: "Gemini",
    paperMatch: (p) => p.title.toLowerCase().includes("gemini: a family") || p.title.toLowerCase().includes("gemini 1.5"),
    modelMatch: (m) => m.slug.includes("gemini"),
    role: "introduced",
  },
  {
    family: "PaLM",
    paperMatch: (p) => p.title.toLowerCase().includes("palm: scaling language modeling with pathways"),
    modelMatch: (m) => m.slug.includes("google-palm") || m.slug.includes("palm-2"),
    role: "introduced",
  },
  {
    family: "Phi",
    paperMatch: (p) => p.title.toLowerCase().includes("phi-3") || p.title.toLowerCase().includes("phi-4"),
    modelMatch: (m) => m.slug.includes("phi-3") || m.slug.includes("phi-4"),
    role: "introduced",
  },
];

async function cleanMapShard(shardName, shardUrl) {
  console.log(`\nProcessing clean mappings on ${shardName}...`);
  const pool = new pg.Pool({ connectionString: shardUrl });
  try {
    const papersRes = await pool.query("SELECT id, title, slug, arxiv_id, citation_count, github_stars FROM papers");
    const modelsRes = await pool.query("SELECT id, name, slug, vendor, model_family FROM models");

    const papers = papersRes.rows;
    const models = modelsRes.rows;

    // Deduplicate papers by title to pick the best representation (highest citation / stars)
    const papersByCleanKey = new Map();
    for (const p of papers) {
      const key = (p.title || "").toLowerCase().trim();
      if (!papersByCleanKey.has(key)) {
        papersByCleanKey.set(key, p);
      } else {
        const existing = papersByCleanKey.get(key);
        if ((p.citation_count || 0) > (existing.citation_count || 0)) {
          papersByCleanKey.set(key, p);
        }
      }
    }
    const deduplicatedPapers = Array.from(papersByCleanKey.values());
    console.log(`Deduplicated ${papers.length} paper records to ${deduplicatedPapers.length} unique titles.`);

    const mappings = [];
    const pairSet = new Set();

    for (const rule of CANONICAL_RULES) {
      const matchedPapers = deduplicatedPapers.filter(rule.paperMatch);
      const matchedModels = models.filter(rule.modelMatch);

      for (const p of matchedPapers) {
        for (const m of matchedModels) {
          const pairKey = `${p.id}:${m.id}`;
          if (!pairSet.has(pairKey)) {
            pairSet.add(pairKey);
            mappings.push({
              paper_id: p.id,
              model_id: m.id,
              role: rule.role,
              confidence: 0.99,
              match_source: `canonical_${rule.family}`,
            });
          }
        }
      }
    }

    console.log(`Total high-precision clean mappings: ${mappings.length}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Clear old messy links
      await client.query("DELETE FROM paper_models");

      const CHUNK_SIZE = 100;
      for (let i = 0; i < mappings.length; i += CHUNK_SIZE) {
        const chunk = mappings.slice(i, i + CHUNK_SIZE);
        const valuePlaceholders = [];
        const params = [];
        let pIdx = 1;

        for (const m of chunk) {
          valuePlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, NOW())`);
          params.push(m.paper_id, m.model_id, m.role, m.confidence, m.match_source);
          pIdx += 5;
        }

        const sql = `
          INSERT INTO paper_models (paper_id, model_id, role, confidence, match_source, created_at)
          VALUES ${valuePlaceholders.join(", ")}
          ON CONFLICT (paper_id, model_id) DO UPDATE SET
            role = EXCLUDED.role,
            confidence = EXCLUDED.confidence,
            match_source = EXCLUDED.match_source;
        `;
        await client.query(sql, params);
      }

      await client.query("COMMIT");
      console.log(`✓ ${shardName}: Successfully saved ${mappings.length} clean deduplicated mappings.`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`✗ ${shardName} transaction failed:`, err.message);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log("=== STARTING CLEAN MODEL-TO-PAPER MAPPING ===");
  for (const [name, url] of Object.entries(shards)) {
    await cleanMapShard(name, url);
  }
  console.log("=== CLEAN MAPPING COMPLETE ===");
}

main().catch(console.error);
