import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "@/lib/models";
import { fetchApi } from "@/lib/api";

export interface OrganizationMetric {
  organization: string;
  paperCount: number;
  citations: number;
  stars: number;
  trendingScore: number;
}

export interface OrganizationMetricsResponse {
  status: string;
  count: number;
  data: OrganizationMetric[];
  counts?: Record<string, number>;
  citations?: Record<string, number>;
  stars?: Record<string, number>;
  trendingScores?: Record<string, number>;
}

export type OrganizationDirectoryData = {
  models: ModelItem[];
  facets: ModelFacets;
  paperCounts: Record<string, number>;
  citations: Record<string, number>;
  stars: Record<string, number>;
  trendingScores: Record<string, number>;
};

export type OrganizationCatalogData = Pick<OrganizationDirectoryData, "models" | "facets">;

let catalogPromise: Promise<OrganizationCatalogData> | null = null;
let directoryPromise: Promise<OrganizationDirectoryData> | null = null;
let facetsPromise: Promise<ModelFacets> | null = null;

/** The small, fast data set needed to render every organization card. */
export function getOrganizationCatalog(): Promise<OrganizationCatalogData> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      getModels({ limit: 10000 }),
      getOrganizationFacets(),
    ])
      .then(([models, facets]) => ({ models, facets }))
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

/** The compact endpoint that supplies all organization names immediately. */
export function getOrganizationFacets(): Promise<ModelFacets> {
  if (!facetsPromise) {
    facetsPromise = getModelFacets().catch((error) => {
      facetsPromise = null;
      throw error;
    });
  }

  return facetsPromise;
}

/** Fetches aggregated organization metrics from backend in a single batched query. */
export async function getOrganizationMetrics(): Promise<OrganizationMetricsResponse | null> {
  try {
    return await fetchApi<OrganizationMetricsResponse>("/api/v1/research-papers/organization-metrics");
  } catch {
    // Non-critical: if endpoint is not available or fails, gracefully return null
    return null;
  }
}

/**
 * Loads the complete organization directory with zero N+1 requests.
 * Uses a single aggregated query for paper counts, citations, stars, and trending metrics.
 */
export function getOrganizationDirectory(): Promise<OrganizationDirectoryData> {
  if (!directoryPromise) {
    directoryPromise = (async () => {
      const [facets, models, metricsResponse] = await Promise.all([
        getOrganizationFacets().catch(() => ({
          totalModels: 0,
          vendors: [],
          modalities: [],
          accessTypes: [],
          opennessTypes: [],
          modelFamilies: [],
          capabilities: [],
          researchAreas: [],
        })),
        getModels({ limit: 10000 }).catch(() => []),
        getOrganizationMetrics().catch(() => null),
      ]);

      const paperCounts: Record<string, number> = {};
      const citations: Record<string, number> = {};
      const stars: Record<string, number> = {};
      const trendingScores: Record<string, number> = {};

      if (metricsResponse && Array.isArray(metricsResponse.data)) {
        for (const item of metricsResponse.data) {
          const key = item.organization.toLowerCase();
          paperCounts[key] = item.paperCount;
          citations[key] = item.citations;
          stars[key] = item.stars;
          trendingScores[key] = item.trendingScore;
        }
      }

      // Populate distinct metrics for each vendor, with safe client-side fallback if server metrics unavailable
      for (const vendor of facets.vendors) {
        const key = vendor.name.toLowerCase();
        if (paperCounts[key] === undefined) {
          // If server metrics weren't available for this vendor, calculate safely without duplicating papers
          const vendorModels = models.filter(
            (m) => m.vendor?.toLowerCase() === key,
          );

          let totalCitations = 0;
          let totalStars = 0;
          let totalTrending = 0;
          let paperCount = 0;

          for (const m of vendorModels) {
            totalTrending += (m.trendingScore || 0);
            if (m.citationCount) totalCitations += m.citationCount;
            if (m.githubStars) totalStars += m.githubStars;
            if (m.paperCount && m.paperCount > paperCount) {
              paperCount = m.paperCount;
            }
          }

          paperCounts[key] = paperCount;
          citations[key] = totalCitations;
          stars[key] = totalStars;
          trendingScores[key] = totalTrending;
        }

        // Also map under original name casing for easy lookup
        paperCounts[vendor.name] = paperCounts[key] ?? 0;
        citations[vendor.name] = citations[key] ?? 0;
        stars[vendor.name] = stars[key] ?? 0;
        trendingScores[vendor.name] = trendingScores[key] ?? 0;
      }

      return {
        models,
        facets,
        paperCounts,
        citations,
        stars,
        trendingScores,
      };
    })().catch((error) => {
      directoryPromise = null;
      throw error;
    });
  }

  return directoryPromise;
}

/** Start the directory request before the user navigates to Organizations. */
export function prefetchOrganizationDirectory(): void {
  void getOrganizationFacets().catch(() => {});
  void getOrganizationCatalog().catch(() => {});
  void getOrganizationDirectory().catch(() => {});
}
