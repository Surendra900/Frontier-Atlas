import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "./models";
import { getOrganizationPaperCounts } from "./paperApi";

export type OrganizationDirectoryData = {
  models: ModelItem[];
  facets: ModelFacets;
  paperCounts: Record<string, number>;
};

export type OrganizationCatalogData = Pick<OrganizationDirectoryData, "models" | "facets">;

let catalogPromise: Promise<OrganizationCatalogData> | null = null;
let directoryPromise: Promise<OrganizationDirectoryData> | null = null;
let facetsPromise: Promise<ModelFacets> | null = null;

/** The small, fast data set needed to render every organization card. */
export function getOrganizationCatalog(): Promise<OrganizationCatalogData> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([getModels({ sort: "trending" }), getOrganizationFacets()])
      .then(([models, facets]) => ({ models, facets }))
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

export type SortMode = "trending" | "az" | "models";

/**
 * Deterministically sorts organizations based on the selected SortMode.
 */
export function sortOrganizations<T extends { name: string; count: number; momentum: number }>(
  items: T[],
  sort: SortMode
): T[] {
  return [...items].sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "models") {
      return b.count - a.count || (b.momentum - a.momentum) || a.name.localeCompare(b.name);
    }
    // "trending" sort: highest momentum first, breaking ties with model count, then name
    return (b.momentum - a.momentum) || (b.count - a.count) || a.name.localeCompare(b.name);
  });
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

/**
 * Loads organization models, facets, and aggregated paper counts efficiently
 * with error resilience.
 */
export function getOrganizationDirectory(): Promise<OrganizationDirectoryData> {
  if (!directoryPromise) {
    directoryPromise = (async () => {
      const catalog = await getOrganizationCatalog();
      const { models, facets } = catalog;

      // Baseline paper counts derived from loaded models
      const baselineCounts: Record<string, number> = {};
      models.forEach((m) => {
        if (m.vendor) {
          baselineCounts[m.vendor] = (baselineCounts[m.vendor] || 0) + (m.paperCount || 0);
        }
      });

      let paperCounts = baselineCounts;

      // Efficient single-request paper counts with graceful fallback
      try {
        const counts = await getOrganizationPaperCounts();
        if (counts && typeof counts === "object" && Object.keys(counts).length > 0) {
          paperCounts = { ...baselineCounts, ...counts };
        }
      } catch (countError) {
        console.warn("Unable to load backend organization paper counts, using model catalog counts:", countError);
      }

      return {
        models,
        facets,
        paperCounts,
      };
    })().catch((error) => {
      directoryPromise = null;
      console.error("Failed to load organization directory:", error);
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
