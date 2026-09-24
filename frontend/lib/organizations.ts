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

/**
 * Normalizes and validates an organization logo URL.
 * Converts Clearbit logo service URLs to Google favicon service URLs,
 * and validates that the URL is a safe http(s) URL, relative path, or data URI.
 * Returns undefined for missing, empty, or invalid URLs to prevent broken network requests.
 */
export function organizationLogoUrl(logo?: string | null): string | undefined {
  if (!logo) return undefined;
  const trimmed = logo.trim();
  if (!trimmed) return undefined;

  // Relative path or data URL
  if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    // Clearbit logo proxy fallback to Google Favicons
    if (url.hostname === "logo.clearbit.com") {
      const domain = url.pathname.replace(/^\//, "");
      if (!domain) return undefined;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    }
    return trimmed;
  } catch {
    return undefined;
  }
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
