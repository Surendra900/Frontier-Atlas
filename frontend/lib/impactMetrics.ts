import type { ModelItem } from "./models";
import type { Paper } from "./paperApi";

/**
 * Robustly parses a metric value that could be a number, string,
 * or formatted compact string (e.g., "500", "1.2k", "2.5K", "1M").
 */
export function parseMetricValue(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const str = String(value).trim();
  if (!str) return 0;

  // Match optional sign, digits/decimals, and optional suffix (k, m, b, etc.)
  const match = str.match(/^([+-]?[\d,]+(?:\.\d+)?)\s*([kKmMbB])?$/);
  if (!match) {
    const fallback = parseFloat(str.replace(/,/g, ""));
    return Number.isFinite(fallback) ? fallback : 0;
  }

  const numPart = parseFloat(match[1].replace(/,/g, ""));
  if (!Number.isFinite(numPart)) return 0;

  const suffix = match[2]?.toUpperCase();
  if (suffix === "K") return Math.round(numPart * 1_000);
  if (suffix === "M") return Math.round(numPart * 1_000_000);
  if (suffix === "B") return Math.round(numPart * 1_000_000_000);

  return numPart;
}

/**
 * Extracts canonical arXiv ID from a string, URL, or ID.
 * Strips version suffixes (e.g. v1, v2) and trailing .pdf.
 */
export function extractArxivId(input?: string | null): string | null {
  if (!input || typeof input !== "string") return null;
  const match = input.match(
    /(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?|[a-z\-]+(?:\.[a-z]{2})?\/[0-9]{7}(?:v[0-9]+)?)/i
  );
  if (match && match[1]) {
    return match[1].replace(/\.pdf$/i, "").replace(/v[0-9]+$/i, "").toLowerCase();
  }
  return null;
}

/**
 * Normalizes a repository URL for canonical comparison.
 */
export function normalizeRepoUrl(input?: string | null): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  const cleaned = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.git\/?$/, "")
    .replace(/\/+$/, "");

  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return `github.com/${match[1]}/${match[2]}`;
  }
  return cleaned.length > 5 ? cleaned : null;
}

/**
 * Normalizes general URLs (removing protocol, www, trailing slashes, .pdf).
 */
export function normalizeUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim().toLowerCase();
  const cleaned = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.pdf$/, "")
    .replace(/\/+$/, "");
  return cleaned || null;
}

/**
 * Normalizes titles or names for comparison.
 */
export function normalizeText(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textMatches(modelText: string, paperText: string): boolean {
  if (!modelText || !paperText) return false;
  if (modelText === paperText) return true;
  if (modelText.length >= 4) {
    if (paperText.startsWith(modelText + " ")) return true;
    if (paperText.endsWith(" " + modelText)) return true;
  }
  return false;
}

/**
 * Determines whether a model and paper represent the same underlying entity/impact.
 */
export function doesModelOverlapPaper(model: ModelItem, paper: Paper): boolean {
  // 1. Direct IDs or slugs
  if (
    paper.id &&
    (String((model as any).paperId) === String(paper.id) ||
      String((model as any).paper_id) === String(paper.id))
  ) {
    return true;
  }
  if (
    model.latestPaperSlug &&
    paper.slug &&
    model.latestPaperSlug.toLowerCase() === paper.slug.toLowerCase()
  ) {
    return true;
  }
  if (model.slug && paper.slug && model.slug.toLowerCase() === paper.slug.toLowerCase()) {
    return true;
  }

  // 2. Explicit collections
  if (Array.isArray((model as any).papers)) {
    const hasPaper = (model as any).papers.some((item: any) => {
      const pid = item?.paper_id || item?.id || item?.paper?.id;
      const pslug = item?.slug || item?.paper?.slug;
      return (
        (pid && String(pid) === String(paper.id)) ||
        (pslug && paper.slug && String(pslug).toLowerCase() === paper.slug.toLowerCase())
      );
    });
    if (hasPaper) return true;
  }

  if (Array.isArray((paper as any).models)) {
    const hasModel = (paper as any).models.some((item: any) => {
      const mid = item?.id || item?.model_id || item?.model?.id;
      const mslug = item?.slug || item?.model?.slug;
      return (
        (mid && String(mid) === String(model.id)) ||
        (mslug && model.slug && String(mslug).toLowerCase() === model.slug.toLowerCase())
      );
    });
    if (hasModel) return true;
  }

  // 3. arXiv ID match
  const modelArxiv = extractArxivId(model.paperUrl);
  const paperArxiv = extractArxivId(
    paper.arxivId || paper.paperUrl || paper.pdfUrl || paper.arxivUrl
  );
  if (modelArxiv && paperArxiv && modelArxiv === paperArxiv) {
    return true;
  }

  // 4. Paper URL match
  const modelPaperUrl = normalizeUrl(model.paperUrl);
  const paperPaperUrl = normalizeUrl(paper.paperUrl || paper.pdfUrl || paper.arxivUrl);
  if (modelPaperUrl && paperPaperUrl && modelPaperUrl === paperPaperUrl) {
    return true;
  }

  // 5. Repository URL match
  const modelRepo = normalizeRepoUrl(model.repositoryUrl);
  const paperRepo = normalizeRepoUrl(paper.githubUrl || paper.projectUrl || paper.repo);
  if (modelRepo && paperRepo && modelRepo === paperRepo) {
    return true;
  }

  // 6. Title / Name matching
  const normPaperTitle = normalizeText(paper.title);
  if (model.latestPaperTitle) {
    const normLatestTitle = normalizeText(model.latestPaperTitle);
    if (normLatestTitle && normPaperTitle && normLatestTitle === normPaperTitle) {
      return true;
    }
  }
  const normModelName = normalizeText(model.name);
  if (normModelName && normPaperTitle && textMatches(normModelName, normPaperTitle)) {
    return true;
  }

  return false;
}

/**
 * Determines whether two models represent the same underlying paper or repository.
 */
export function doModelsOverlap(m1: ModelItem, m2: ModelItem): boolean {
  if (m1.id && m2.id && String(m1.id) === String(m2.id)) return true;
  if (m1.slug && m2.slug && m1.slug.toLowerCase() === m2.slug.toLowerCase()) return true;

  // Same arXiv ID
  const arxiv1 = extractArxivId(m1.paperUrl);
  const arxiv2 = extractArxivId(m2.paperUrl);
  if (arxiv1 && arxiv2 && arxiv1 === arxiv2) return true;

  // Same Paper URL
  const url1 = normalizeUrl(m1.paperUrl);
  const url2 = normalizeUrl(m2.paperUrl);
  if (url1 && url2 && url1 === url2) return true;

  // Same Repository
  const repo1 = normalizeRepoUrl(m1.repositoryUrl);
  const repo2 = normalizeRepoUrl(m2.repositoryUrl);
  if (repo1 && repo2 && repo1 === repo2) return true;

  // Same latest paper slug
  if (
    m1.latestPaperSlug &&
    m2.latestPaperSlug &&
    m1.latestPaperSlug.toLowerCase() === m2.latestPaperSlug.toLowerCase()
  ) {
    return true;
  }

  return false;
}

export interface OrganizationImpactMetrics {
  totalCitations: number;
  totalStars: number;
  focusAreas: string[];
}

/**
 * Calculates aggregate impact metrics for an organization without double-counting
 * overlapping paper and model metrics.
 */
export function calculateOrganizationImpactMetrics(
  papers: Paper[] = [],
  models: ModelItem[] = []
): OrganizationImpactMetrics {
  let totalCitations = 0;
  let totalStars = 0;

  // Track counted papers and their recorded metrics
  const countedPapers: { paper: Paper; citations: number; stars: number }[] = [];
  const seenPaperKeys = new Set<string>();

  for (const p of papers) {
    const key = String(p.id || p.slug || p.title || Math.random());
    if (seenPaperKeys.has(key)) continue;
    seenPaperKeys.add(key);

    const citations = parseMetricValue(p.citations ?? (p as any).citationCount);
    const stars = parseMetricValue((p as any).githubStars) || parseMetricValue(p.upvotes);

    totalCitations += citations;
    totalStars += stars;

    countedPapers.push({
      paper: p,
      citations,
      stars,
    });
  }

  // Track counted models that do not overlap with papers
  const countedModels: { model: ModelItem; citations: number; stars: number }[] = [];

  for (const m of models) {
    const mCitations = parseMetricValue(m.citationCount);
    const mStars = parseMetricValue(m.githubStars);

    // Check if this model overlaps with any counted paper
    const overlappingPapers = countedPapers.filter(({ paper }) =>
      doesModelOverlapPaper(m, paper)
    );

    if (overlappingPapers.length > 0) {
      // Overlaps with existing paper: only credit any incremental difference
      const maxPaperCitations = Math.max(...overlappingPapers.map((op) => op.citations), 0);
      const maxPaperStars = Math.max(...overlappingPapers.map((op) => op.stars), 0);

      const deltaCitations = Math.max(0, mCitations - maxPaperCitations);
      const deltaStars = Math.max(0, mStars - maxPaperStars);

      totalCitations += deltaCitations;
      totalStars += deltaStars;

      // Update paper records with reconciled higher values
      overlappingPapers.forEach((op) => {
        op.citations = Math.max(op.citations, mCitations);
        op.stars = Math.max(op.stars, mStars);
      });
      continue;
    }

    // Check if this model overlaps with another already counted model
    const overlappingModels = countedModels.filter(({ model }) =>
      doModelsOverlap(m, model)
    );

    if (overlappingModels.length > 0) {
      const maxModelCitations = Math.max(...overlappingModels.map((om) => om.citations), 0);
      const maxModelStars = Math.max(...overlappingModels.map((om) => om.stars), 0);

      const deltaCitations = Math.max(0, mCitations - maxModelCitations);
      const deltaStars = Math.max(0, mStars - maxModelStars);

      totalCitations += deltaCitations;
      totalStars += deltaStars;

      overlappingModels.forEach((om) => {
        om.citations = Math.max(om.citations, mCitations);
        om.stars = Math.max(om.stars, mStars);
      });
      continue;
    }

    // Independent model not matching any paper or previous model
    totalCitations += mCitations;
    totalStars += mStars;
    countedModels.push({
      model: m,
      citations: mCitations,
      stars: mStars,
    });
  }

  // Unique research areas / topics
  const focusAreas = new Set<string>();
  models.forEach((m) => {
    if (Array.isArray(m.researchAreas)) {
      m.researchAreas.forEach((area) => focusAreas.add(area));
    }
    if (Array.isArray(m.capabilities)) {
      m.capabilities.forEach((cap) => focusAreas.add(cap));
    }
  });

  if (focusAreas.size === 0) {
    papers.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => focusAreas.add(tag));
      }
      if (Array.isArray(p.additionalTags)) {
        p.additionalTags.forEach((tag) => focusAreas.add(tag));
      }
    });
  }

  return {
    totalCitations,
    totalStars,
    focusAreas: Array.from(focusAreas).slice(0, 6),
  };
}
