import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "@/lib/models";
import { fetchApi } from "@/lib/api"; // Adjust import path if needed based on your project structure

export type OrganizationMetricsResponse = {
  status: string;
  count: number;
  data: Array<{
    organization: string;
    paperCount: number;
    citations: number;
    stars: number;
    trendingScore: number;
  }>;
};

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

const DEFAULT_FACETS: ModelFacets = {
  totalModels: 0,
  vendors: [],
  modalities: [],
  accessTypes: [],
  opennessTypes: [],
  modelFamilies: [],
  capabilities: [],
  researchAreas: [],
};

/** The small, fast data set needed to render every organization card. */
export function getOrganizationCatalog(): Promise<OrganizationCatalogData> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([getModels(), getOrganizationFacets()])
      .then(([models, facets]) => ({
        models: Array.isArray(models) ? models : [],
        facets: facets || DEFAULT_FACETS,
      }))
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

/** The compact endpoint that supplies organization facets immediately. */
export function getOrganizationFacets(): Promise<ModelFacets> {
  if (!facetsPromise) {
    facetsPromise = getModelFacets()
      .then((facets) => facets || DEFAULT_FACETS)
      .catch((error) => {
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
 * Warms counts and paper lists after the catalog is available.
 */
export function getOrganizationDirectory(): Promise<OrganizationDirectoryData> {
  if (!directoryPromise) {
    directoryPromise = (async () => {
      const [facets, models, metricsResponse] = await Promise.all([
        getOrganizationFacets().catch(() => DEFAULT_FACETS),
        getModels().catch(() => []),
        getOrganizationMetrics().catch(() => null),
      ]);

      const safeModels = Array.isArray(models) ? models : [];
      const safeVendors = Array.isArray(facets?.vendors) ? facets.vendors : [];

      const initialCounts: Record<string, number> = {};
      const initialCitations: Record<string, number> = {};
      const initialStars: Record<string, number> = {};
      const initialTrending: Record<string, number> = {};

      // Populate metrics from backend response if available
      if (metricsResponse?.data && Array.isArray(metricsResponse.data)) {
        metricsResponse.data.forEach((item) => {
          if (item && item.organization) {
            const key = item.organization.trim().toLowerCase();
            initialCounts[key] = item.paperCount || 0;
            initialCitations[key] = item.citations || 0;
            initialStars[key] = item.stars || 0;
            initialTrending[key] = item.trendingScore || 0;
          }
        });
      }

      // Derive paper counts from models as fallback/supplement
      safeModels.forEach((m) => {
        if (m && typeof m.vendor === "string" && m.vendor.trim()) {
          const key = m.vendor.trim().toLowerCase();
          const count = typeof m.paperCount === "number" && m.paperCount > 0 ? m.paperCount : 1;
          initialCounts[key] = (initialCounts[key] || 0) + count;
        }
      });

      safeVendors.forEach((v) => {
        if (v && typeof v.name === "string" && v.name.trim()) {
          const key = v.name.trim().toLowerCase();
          if (!initialCounts[key]) {
            initialCounts[key] = typeof v.count === "number" ? v.count : 0;
          }
        }
      });

      return {
        models: safeModels,
        facets: facets || DEFAULT_FACETS,
        paperCounts: initialCounts,
        citations: initialCitations,
        stars: initialStars,
        trendingScores: initialTrending,
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