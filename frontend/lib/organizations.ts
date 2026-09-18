import { getModelFacets, getModels, type ModelFacets, type ModelItem } from "@/lib/models";
import { getPapers } from "@/lib/paperApi";

export type OrganizationDirectoryData = {
  models: ModelItem[];
  facets: ModelFacets;
  paperCounts: Record<string, number>;
};

export type OrganizationCatalogData = Pick<OrganizationDirectoryData, "models" | "facets">;

let catalogPromise: Promise<OrganizationCatalogData> | null = null;
let directoryPromise: Promise<OrganizationDirectoryData> | null = null;
let facetsPromise: Promise<ModelFacets> | null = null;

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await worker(values[index]);
    }
  }));

  return results;
}

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

/** The compact endpoint that supplies all 60 organization names immediately. */
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
 * Warms counts and paper lists after the catalog is available. The paper
 * requests also warm paperApi's cache for organization profile pages.
 */
export function getOrganizationDirectory(): Promise<OrganizationDirectoryData> {
  if (!directoryPromise) {
    directoryPromise = (async () => {
      const facets = await getOrganizationFacets();
      const modelsPromise = getModels();
      const organizationNames = facets.vendors.map((vendor) => vendor.name);
      const counts = await mapWithConcurrency(organizationNames, 20, async (organization) => {
        const result = await getPapers({ organization, limit: 50, sort: "latest" });
        return [organization, result.total] as const;
      });

      return {
        models: await modelsPromise,
        facets,
        paperCounts: Object.fromEntries(counts),
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
