import test from "node:test";
import assert from "node:assert/strict";
import { sortOrganizations, type SortMode } from "../../../frontend/lib/organizations";
import { getModels } from "../../src/services/model.service.js";
import { QueryRouter } from "../../src/routing/index.js";

// Helper mock router for getModels testing
function createMockModelQueryRouter(mockModels: any[]) {
  const mockPrisma = {
    model: {
      findMany: async (args: any) => {
        // Return cloned mock models
        return mockModels.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          vendor: m.vendor,
          vendor_logo_url: m.vendor_logo_url || null,
          releaseDate: m.releaseDate || new Date("2026-01-01"),
          parameterCount: m.parameterCount || "7B",
          modality: m.modality || "text",
          accessType: m.accessType || "open",
          opennessType: m.opennessType || "open",
          description: m.description || "",
          benchmark_score: m.benchmark_score || null,
          model_family: m.model_family || null,
          modelFamily: m.modelFamily || null,
          category: m.category || null,
          capabilities: m.capabilities || [],
          research_areas: m.research_areas || [],
          researchAreas: m.researchAreas || [],
          architecture: m.architecture || null,
          context_window: m.context_window || null,
          contextWindow: m.contextWindow || null,
          license: m.license || "MIT",
          model_versions: m.model_versions || [],
          modelVersions: m.modelVersions || [],
          release_notes: m.release_notes || null,
          releaseNotes: m.releaseNotes || null,
          paper_url: m.paper_url || null,
          paperUrl: m.paperUrl || null,
          repository_url: m.repository_url || null,
          repositoryUrl: m.repositoryUrl || null,
          api_url: m.api_url || null,
          apiUrl: m.apiUrl || null,
          trendingScore: m.trendingScore ?? 0,
          createdAt: m.createdAt || new Date("2026-01-01"),
          _count: { papers: m.papers ? m.papers.length : (m.paperCount || 0) },
          papers: m.papers || [],
        }));
      },
    },
  };

  const router = {
    routeQuery: async (intentOrFn: any, maybeFn?: any) => {
      const fn = typeof intentOrFn === "function" ? intentOrFn : maybeFn;
      return {
        results: [await fn(mockPrisma)],
      };
    },
  } as unknown as QueryRouter;

  return router;
}

test("Test 1: Organizations with different trending scores", () => {
  const organizations = [
    { name: "Small Lab", count: 2, momentum: 150 },
    { name: "Frontier AI", count: 2, momentum: 8500 },
    { name: "MidCorp", count: 2, momentum: 1200 },
  ];

  const sorted = sortOrganizations(organizations, "trending");

  assert.strictEqual(sorted[0].name, "Frontier AI");
  assert.strictEqual(sorted[1].name, "MidCorp");
  assert.strictEqual(sorted[2].name, "Small Lab");
});

test("Test 2: Organizations with zero or missing trending scores", () => {
  const organizations = [
    { name: "Inactive Lab A", count: 5, momentum: 0 },
    { name: "Active Startup", count: 1, momentum: 500 },
    { name: "Inactive Lab B", count: 10, momentum: 0 },
  ];

  const sorted = sortOrganizations(organizations, "trending");

  // Active Startup with non-zero momentum must rank before inactive ones regardless of model count
  assert.strictEqual(sorted[0].name, "Active Startup");
  // Inactive ones with 0 momentum break ties by model count
  assert.strictEqual(sorted[1].name, "Inactive Lab B");
  assert.strictEqual(sorted[2].name, "Inactive Lab A");
});

test("Test 3: Trending sorting with multiple organizations", () => {
  const organizations = [
    { name: "Org Delta", count: 4, momentum: 450 },
    { name: "Org Alpha", count: 2, momentum: 3200 },
    { name: "Org Beta", count: 8, momentum: 15000 },
    { name: "Org Gamma", count: 1, momentum: 800 },
    { name: "Org Epsilon", count: 3, momentum: 0 },
  ];

  const sorted = sortOrganizations(organizations, "trending");

  const names = sorted.map((o) => o.name);
  assert.deepStrictEqual(names, [
    "Org Beta",
    "Org Alpha",
    "Org Gamma",
    "Org Delta",
    "Org Epsilon",
  ]);
});

test("Test 4: Default organization listing uses trending sort", () => {
  const organizations = [
    { name: "Vendor Y", count: 15, momentum: 100 },
    { name: "Vendor X", count: 2, momentum: 9000 },
  ];

  // Default sort is "trending"
  const defaultSort: SortMode = "trending";
  const sorted = sortOrganizations(organizations, defaultSort);

  assert.strictEqual(sorted[0].name, "Vendor X");
  assert.strictEqual(sorted[1].name, "Vendor Y");
});

test("Test 5: Other existing sorting options (az, models) still work correctly", () => {
  const organizations = [
    { name: "Zeta AI", count: 20, momentum: 100 },
    { name: "Apex Labs", count: 2, momentum: 5000 },
    { name: "Beta Systems", count: 10, momentum: 1200 },
  ];

  // A-Z sorting: alphabetical by name ascending
  const azSorted = sortOrganizations(organizations, "az");
  assert.deepStrictEqual(
    azSorted.map((o) => o.name),
    ["Apex Labs", "Beta Systems", "Zeta AI"]
  );

  // Models sorting: by model count descending
  const modelsSorted = sortOrganizations(organizations, "models");
  assert.deepStrictEqual(
    modelsSorted.map((o) => o.name),
    ["Zeta AI", "Beta Systems", "Apex Labs"]
  );
});

test("Test 6: Verify Trending is NOT simply returning the same order as Most Models", () => {
  // Classic scenario where Trending and Most Models produce opposite orders:
  // Org HighImpact: 1 breakthrough foundation model with 50,000 citations/stars.
  // Org ModelFactory: 25 fine-tuned variants with minimal individual impact (10 each).
  const organizations = [
    { name: "ModelFactory", count: 25, momentum: 250 },
    { name: "HighImpact", count: 1, momentum: 50000 },
  ];

  const trendingOrder = sortOrganizations(organizations, "trending").map((o) => o.name);
  const modelsOrder = sortOrganizations(organizations, "models").map((o) => o.name);

  // Trending must rank HighImpact first based on momentum
  assert.deepStrictEqual(trendingOrder, ["HighImpact", "ModelFactory"]);

  // Models must rank ModelFactory first based on model count
  assert.deepStrictEqual(modelsOrder, ["ModelFactory", "HighImpact"]);

  // Verify the two sort orders are definitely not identical
  assert.notDeepStrictEqual(trendingOrder, modelsOrder);
});

test("Backend getModels: calculates trendingScore from papers even for default list", async () => {
  const mockModels = [
    {
      id: "m1",
      name: "Model One",
      slug: "model-one",
      vendor: "Meta",
      papers: [
        { paper: { id: "p1", citationCount: 1500, githubStars: 500 } },
        { paper: { id: "p2", citationCount: 300, githubStars: 200 } },
      ],
    },
    {
      id: "m2",
      name: "Model Two",
      slug: "model-two",
      vendor: "Google",
      papers: [
        { paper: { id: "p3", citationCount: 50, githubStars: 10 } },
      ],
    },
  ];

  const router = createMockModelQueryRouter(mockModels);

  // Fetch with default sort="name" (default model list)
  const defaultModels = await getModels(router, 50, 0, "name");

  const metaModel = defaultModels.find((m) => m.vendor === "Meta");
  const googleModel = defaultModels.find((m) => m.vendor === "Google");

  // Meta: (1500 + 500) + (300 + 200) = 2500
  assert.strictEqual(metaModel?.trendingScore, 2500);
  assert.strictEqual(metaModel?.citationCount, 1800);
  assert.strictEqual(metaModel?.githubStars, 700);

  // Google: 50 + 10 = 60
  assert.strictEqual(googleModel?.trendingScore, 60);
});

test("Backend getModels: sorts by trendingScore desc when sort='trending'", async () => {
  const mockModels = [
    {
      id: "m-low",
      name: "Low Impact Model",
      slug: "low-impact",
      vendor: "Org A",
      papers: [{ paper: { id: "p1", citationCount: 10, githubStars: 5 } }], // score: 15
    },
    {
      id: "m-high",
      name: "High Impact Model",
      slug: "high-impact",
      vendor: "Org B",
      papers: [{ paper: { id: "p2", citationCount: 4000, githubStars: 2000 } }], // score: 6000
    },
    {
      id: "m-mid",
      name: "Mid Impact Model",
      slug: "mid-impact",
      vendor: "Org C",
      papers: [{ paper: { id: "p3", citationCount: 500, githubStars: 300 } }], // score: 800
    },
  ];

  const router = createMockModelQueryRouter(mockModels);

  const trendingModels = await getModels(router, 50, 0, "trending");

  assert.strictEqual(trendingModels[0].slug, "high-impact");
  assert.strictEqual(trendingModels[0].trendingScore, 6000);

  assert.strictEqual(trendingModels[1].slug, "mid-impact");
  assert.strictEqual(trendingModels[1].trendingScore, 800);

  assert.strictEqual(trendingModels[2].slug, "low-impact");
  assert.strictEqual(trendingModels[2].trendingScore, 15);
});
