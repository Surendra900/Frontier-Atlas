import { neon } from "@neondatabase/serverless";
import { normalizePaperDetail, type PaperDetail } from "./papers";

const PROD_BACKEND = "https://frontieratlas-backend.morningsignal-india.workers.dev";

const SHARD_URLS = [
  process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-floral-cherry-aorpwovy-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_le9RfJEbAa7I@ep-odd-night-atgpapcg-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
  "postgresql://neondb_owner:npg_nX6E8qZiDTPB@ep-damp-bar-aofs3cnt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
];

// Helper to extract arXiv ID from slug
export function extractArxivId(slug: string): string | null {
  const match = slug.match(/(\d{4}\.\d{4,5}(?:v\d+)?)/i);
  return match ? match[1] : null;
}

export async function resolvePaperBySlug(slug: string): Promise<PaperDetail | null> {
  if (!slug) return null;

  // 1. Query Authoritative Neon database shards directly first
  const arxivId = extractArxivId(slug);
  const cleanArxiv = arxivId ? arxivId.replace(/v\d+$/i, "") : null;

  for (const dbUrl of SHARD_URLS) {
    try {
      const sql = neon(dbUrl);
      const queryConditions: string[] = [
        "slug = $1",
        "LOWER(slug) = LOWER($1)",
      ];
      const queryParams: any[] = [slug];

      if (arxivId) {
        queryParams.push(arxivId);
        queryConditions.push(`arxiv_id = $${queryParams.length}`);
        if (cleanArxiv && cleanArxiv !== arxivId) {
          queryParams.push(cleanArxiv);
          queryConditions.push(`arxiv_id = $${queryParams.length}`);
        }
      }

      const rows = await sql.query(
        `SELECT * FROM papers WHERE ${queryConditions.join(" OR ")} LIMIT 1`,
        queryParams
      );

      if (rows && rows.length > 0) {
        const raw = rows[0];

        // Fetch authors
        let authors: any[] = [];
        try {
          if (raw.authors) {
            authors = typeof raw.authors === "string" ? JSON.parse(raw.authors) : raw.authors;
          } else {
            const authorRows = await sql.query(
              `SELECT a.id, a.name, a.slug 
               FROM authors a 
               JOIN paper_authors pa ON pa.author_id = a.id 
               WHERE pa.paper_id = $1`,
              [raw.id]
            );
            authors = authorRows.map((a: any) => ({
              id: a.id,
              name: a.name,
              slug: a.slug,
            }));
          }
        } catch {}

        // Fetch mapped models
        let models: any[] = [];
        try {
          const modelRows = await sql.query(
            `SELECT m.id, m.name, m.slug, m.vendor, m.context_window, m.openness_type, pm.role 
             FROM models m 
             JOIN paper_models pm ON pm.model_id = m.id 
             WHERE pm.paper_id = $1`,
            [raw.id]
          );
          models = modelRows.map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug,
            role: m.role || "foundation",
            model: {
              id: m.id,
              name: m.name,
              slug: m.slug,
              vendor: m.vendor,
              context_length: m.context_window,
              open_weights: m.openness_type === "Open Weights",
            },
          }));
        } catch {}

        return normalizePaperDetail({
          id: raw.id,
          slug: raw.slug,
          title: raw.title,
          shortTitle: raw.short_title,
          abstract: raw.abstract || "Abstract available in the full publication.",
          tlDr: raw.tl_dr,
          publicationDate: raw.publication_date ? new Date(raw.publication_date).toISOString() : null,
          submissionDate: raw.submission_date ? new Date(raw.submission_date).toISOString() : null,
          arxivId: raw.arxiv_id,
          doi: raw.doi,
          paperUrl: raw.paper_url || (raw.arxiv_id ? `https://arxiv.org/abs/${raw.arxiv_id}` : null),
          pdfUrl: raw.pdf_url || (raw.arxiv_id ? `https://arxiv.org/pdf/${raw.arxiv_id}` : null),
          sourceUrl: raw.source_url,
          projectUrl: raw.project_url,
          githubUrl: raw.github_url,
          githubStars: raw.github_stars,
          githubForks: raw.github_forks,
          citationCount: raw.citation_count || 0,
          referenceCount: raw.reference_count || 0,
          pageCount: raw.page_count,
          paperType: raw.paper_type,
          status: raw.status,
          language: raw.language,
          license: raw.license,
          hfUpvotes: raw.hf_upvotes,
          trendingScore: raw.trending_score,
          authors: authors,
          models: models,
          tasks: raw.task ? [{ id: raw.task, name: raw.task, slug: raw.task.toLowerCase().replace(/[^a-z0-9]+/g, "-") }] : [],
          methods: [],
          datasets: [],
          conferences: [],
          rankings: [],
          sotaClaims: [],
          repositories: raw.github_url ? [{ url: raw.github_url }] : [],
        });
      }
    } catch (e) {
      console.warn(`Direct DB query failed on shard for slug "${slug}":`, e);
    }
  }

  // 2. Try upstream worker as fallback
  try {
    const upstreamUrl = `${PROD_BACKEND}/api/v1/research-papers/${encodeURIComponent(slug)}`;
    const res = await fetch(upstreamUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.status === "success" && json?.data) {
        return normalizePaperDetail(json.data);
      }
    }
  } catch (err) {
    console.warn(`Upstream fetch for "${slug}" failed:`, err);
  }



  // 3. Fallback: On-demand arXiv resolution for any arXiv paper not yet indexed
  if (arxivId) {
    try {
      const arxivRes = await fetch(
        `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`,
        { headers: { "User-Agent": "FrontierAtlas/2.0" } }
      );
      if (arxivRes.ok) {
        const xml = await arxivRes.text();
        const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
        const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/);
        
        // Extract authors from XML
        const authorMatches = [...xml.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)];
        const authors = authorMatches.map((m) => m[1].trim());

        if (titleMatch) {
          const title = titleMatch[1].replace(/\n/g, " ").trim();
          const abstract = summaryMatch ? summaryMatch[1].trim() : "Abstract available in the full publication.";
          const pubDate = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

          return normalizePaperDetail({
            id: `arxiv-${arxivId}`,
            slug: slug,
            title: title,
            shortTitle: title.length > 60 ? title.slice(0, 60) + "..." : title,
            abstract: abstract,
            tlDr: abstract.slice(0, 200) + "...",
            publicationDate: pubDate,
            submissionDate: pubDate,
            arxivId: arxivId,
            paperUrl: `https://arxiv.org/abs/${arxivId}`,
            pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
            sourceUrl: `https://arxiv.org/abs/${arxivId}`,
            projectUrl: null,
            githubUrl: null,
            citationCount: 0,
            referenceCount: 0,
            authors: authors.map((name) => ({
              id: name,
              name: name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            })),
            models: [],
            tasks: [],
            methods: [],
            datasets: [],
            conferences: [],
            rankings: [],
            sotaClaims: [],
            repositories: [],
          });
        }
      }
    } catch (e) {
      console.warn(`ArXiv fallback failed for arxivId "${arxivId}":`, e);
    }
  }

  return null;
}
