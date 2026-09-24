import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "@/lib/models";
import { getOrganizationPaperCounts } from "@/lib/paperApi";

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
    catalogPromise = Promise.all([getModels(), getOrganizationFacets()])
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
