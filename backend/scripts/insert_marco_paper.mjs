import { neon } from "@neondatabase/serverless";

const shards = {
  SHARD_1: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_2: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_3: "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  SHARD_4: "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
};

const marcoPaper = {
  id: "marco-o1-v2-2503.01461",
  slug: "marco-o1-v2-towards-widening-the-distillation-bottleneck-for-reasoning-models-2503.01461",
  title: "Marco-o1 v2: Towards Widening The Distillation Bottleneck for Reasoning Models",
  short_title: "Marco-o1 v2",
  abstract: "Large Reasoning Models (LRMs) such as OpenAI o1 and DeepSeek-R1 have shown remarkable reasoning capabilities by scaling test-time compute and generating long Chain-of-Thought (CoT). Distillation--post-training on LRMs-generated data--is a straightforward yet effective method to enhance the reasoning abilities of smaller models, but faces a critical bottleneck: we found that distilled long CoT data poses learning difficulty for small models and leads to the inheritance of biases (i.e. over-thinking) when using Supervised Fine-tuning (SFT) and Reinforcement Learning (RL) methods. To alleviate this bottleneck, we propose constructing tree-based CoT data from scratch via Monte Carlo Tree Search (MCTS). We then exploit a set of CoT-aware approaches, including Thoughts Length Balance, Fine-grained DPO, and Joint Post-training Objective, to enhance SFT and RL on the constructed data. We conduct evaluation on various benchmarks such as math (GSM8K, MATH, AIME), instruction-following (Multi-IF) and planning (Blocksworld); results demonstrate our approaches substantially improve the reasoning performance of distilled models compared to standard distilled models via reducing the hallucinations in long-time thinking.",
  tl_dr: "Alleviates distillation bottleneck in reasoning models using MCTS tree-based CoT data and CoT-aware post-training objectives.",
  publication_date: new Date("2025-03-03T12:17:36Z"),
  submission_date: new Date("2025-03-03T12:17:36Z"),
  arxiv_id: "2503.01461",
  paper_url: "https://arxiv.org/abs/2503.01461v2",
  pdf_url: "https://arxiv.org/pdf/2503.01461v2",
  source_url: "https://arxiv.org/abs/2503.01461",
  project_url: "https://github.com/AIDC-AI/Marco-o1",
  github_url: "https://github.com/AIDC-AI/Marco-o1",
  authors: [
    "Huifeng Yin", "Yu Zhao", "Minghao Wu", "Xuanfan Ni", 
    "Bo Zeng", "Hao Wang", "Tianqi Shi", "Liangying Shao", 
    "Chenyang Lyu", "Longyue Wang", "Weihua Luo", "Kaifu Zhang"
  ],
  trending_score: 98.5,
  citation_count: 14,
  reference_count: 52
};

async function insertMarco() {
  for (const [name, url] of Object.entries(shards)) {
    console.log(`Inserting Marco-o1 v2 paper into ${name}...`);
    try {
      const sql = neon(url);
      await sql.query(`
        INSERT INTO papers (
          id, slug, title, short_title, abstract, tl_dr, 
          publication_date, submission_date, arxiv_id, 
          paper_url, pdf_url, source_url, project_url, github_url, 
          trending_score, citation_count, reference_count, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          abstract = EXCLUDED.abstract,
          arxiv_id = EXCLUDED.arxiv_id,
          paper_url = EXCLUDED.paper_url,
          pdf_url = EXCLUDED.pdf_url,
          github_url = EXCLUDED.github_url;
      `, [
        marcoPaper.id,
        marcoPaper.slug,
        marcoPaper.title,
        marcoPaper.short_title,
        marcoPaper.abstract,
        marcoPaper.tl_dr,
        marcoPaper.publication_date,
        marcoPaper.submission_date,
        marcoPaper.arxiv_id,
        marcoPaper.paper_url,
        marcoPaper.pdf_url,
        marcoPaper.source_url,
        marcoPaper.project_url,
        marcoPaper.github_url,
        marcoPaper.trending_score,
        marcoPaper.citation_count,
        marcoPaper.reference_count
      ]);

      // Check if authors column exists on papers
      const hasAuthorsCol = await sql.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'papers' AND column_name = 'authors'
      `);
      if (hasAuthorsCol.length > 0) {
        await sql.query(`UPDATE papers SET authors = $1 WHERE slug = $2`, [
          JSON.stringify(marcoPaper.authors),
          marcoPaper.slug
        ]);
      }

      // Also insert into authors & paper_authors
      for (const authorName of marcoPaper.authors) {
        const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const authorId = `author-${authorSlug}`;
        await sql.query(`
          INSERT INTO authors (id, name, slug, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT (slug) DO NOTHING;
        `, [authorId, authorName, authorSlug]).catch(() => {});

        // Fetch actual author id
        const aRow = await sql.query(`SELECT id FROM authors WHERE slug = $1`, [authorSlug]);
        if (aRow.length > 0) {
          await sql.query(`
            INSERT INTO paper_authors (paper_id, author_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `, [marcoPaper.id, aRow[0].id]).catch(() => {});
        }
      }

      console.log(`✓ Successfully inserted into ${name}`);
    } catch (e) {
      console.error(`✗ Error in ${name}:`, e.message);
    }
  }
}

insertMarco();
