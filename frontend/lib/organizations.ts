import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "@/lib/models";

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
      const [facets, models] = await Promise.all([
        getOrganizationFacets().catch(() => DEFAULT_FACETS),
        getModels().catch(() => []),
      ]);

      const safeModels = Array.isArray(models) ? models : [];
      const safeVendors = Array.isArray(facets?.vendors) ? facets.vendors : [];

      // Derive paper counts directly from models for instant rendering
      const initialCounts: Record<string, number> = {};

      safeModels.forEach((m) => {
        if (m && typeof m.vendor === "string" && m.vendor.trim()) {
          const key = m.vendor.trim();
          const count = typeof m.paperCount === "number" && m.paperCount > 0 ? m.paperCount : 1;
          initialCounts[key] = (initialCounts[key] || 0) + count;
        }
      });

      safeVendors.forEach((v) => {
        if (v && typeof v.name === "string" && v.name.trim()) {
          const key = v.name.trim();
          if (!initialCounts[key]) {
            initialCounts[key] = typeof v.count === "number" ? v.count : 0;
          }
        }

        // Also map under original name casing for easy lookup
        paperCounts[vendor.name] = paperCounts[key] ?? 0;
        citations[vendor.name] = citations[key] ?? 0;
        stars[vendor.name] = stars[key] ?? 0;
        trendingScores[vendor.name] = trendingScores[key] ?? 0;
      }

      return {
        models: safeModels,
        facets: facets || DEFAULT_FACETS,
        paperCounts: initialCounts,
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