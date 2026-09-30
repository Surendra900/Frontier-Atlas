import { neon } from "@neondatabase/serverless";

const sourceShard = neon("postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");

const targetShards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

async function replicate() {
  console.log("Fetching best canonical landmark papers from SHARD_2...");
  const landmarkArxivIds = [
    "2303.08774", // GPT-4
    "2005.14165", // GPT-3
    "2212.04356", // Whisper
    "2407.21783", // Llama 3
    "2307.09288", // Llama 2
    "2302.13971", // LLaMA 1
    "2308.12950", // Code Llama
    "2310.06825", // Mistral 7B
    "2401.04088", // Mixtral of Experts
    "2501.12948", // DeepSeek-R1
    "2412.19437", // DeepSeek-V3
    "2401.14196", // DeepSeek Coder
    "2412.15115", // Qwen 2.5
    "2407.10671", // Qwen 2
    "2309.16609", // Qwen 1
    "2312.11805", // Gemini
    "2403.08295", // Gemma
    "2408.00118", // Gemma 2
    "2204.02311", // PaLM
    "2412.08905", // Phi-4
    "2404.14219", // Phi-3
    "2309.05463", // Phi-1.5 / Phi-2
    "2212.08073", // Claude / Constitutional AI
    "2403.04652", // Yi
    "2305.06161", // StarCoder
    "2311.16867", // Falcon
    "2403.17297", // InternLM2
    "2210.02414", // GLM
    "2405.04324", // Granite
  ];

  // For each landmark arxiv, select the single best paper by stars & citations
  const bestPapers = [];
  for (const arxiv of landmarkArxivIds) {
    const res = await sourceShard.query(`
      SELECT * FROM papers 
      WHERE arxiv_id LIKE $1 || '%'
      ORDER BY github_stars DESC NULLS LAST, citation_count DESC NULLS LAST
      LIMIT 1
    `, [arxiv]);
    if (res.length > 0) {
      bestPapers.push(res[0]);
    }
  }

  console.log(`Selected ${bestPapers.length} distinct best landmark papers.`);

  for (const [targetName, targetUrl] of Object.entries(targetShards)) {
    console.log(`\nReplicating to ${targetName}...`);
    const targetSql = neon(targetUrl);
    let inserted = 0;

    for (const p of bestPapers) {
      try {
        await targetSql.query(`
          INSERT INTO papers (
            id, title, slug, abstract, arxiv_id, 
            citation_count, github_stars, publication_date, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            arxiv_id = EXCLUDED.arxiv_id,
            citation_count = EXCLUDED.citation_count,
            github_stars = EXCLUDED.github_stars
        `, [
          p.id,
          p.title,
          p.slug,
          p.abstract || "Canonical foundational paper for model architecture.",
          p.arxiv_id,
          p.citation_count || 0,
          p.github_stars || 0,
          p.publication_date || new Date(),
          p.created_at || new Date(),
          p.updated_at || new Date(),
        ]);
        inserted++;
      } catch (err) {
        console.error(`  [${targetName}] Insert error for paper ${p.slug}:`, err.message);
      }
    }
    console.log(`✓ [${targetName}] Replicated ${inserted} landmark papers successfully.`);
  }
}

replicate().catch(console.error);
