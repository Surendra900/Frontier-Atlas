import test from "node:test";
import assert from "node:assert/strict";
import { getPapers } from "../../src/services/paper.service.js";
import { QueryRouter } from "../../src/routing/index.js";

function createMockQueryRouter() {
  let capturedFindManyWhere: any = null;
  let findManyCallCount = 0;
  let mockPapersToReturn: any[] = [];

  const mockPrisma = {
    paper: {
      findFirst: async () => ({
        publicationDate: new Date("2026-03-20T00:00:00.000Z"),
      }),
      findMany: async (args: any) => {
        capturedFindManyWhere = args.where;
        findManyCallCount++;
        return mockPapersToReturn;
      },
    },
  };

  const router = {
    routeQuery: async (fn: any) => fn(mockPrisma),
  } as unknown as QueryRouter;

  return {
    router,
    getCapturedWhere: () => capturedFindManyWhere,
    getFindManyCallCount: () => findManyCallCount,
    setMockPapers: (papers: any[]) => {
      mockPapersToReturn = papers;
    },
  };
}

const samplePaper = {
  id: "paper-1",
  slug: "test-paper",
  title: "Test Paper",
  abstract: "Test Abstract",
  thumbnailUrl: "https://example.com/thumb.png",
  publicationDate: new Date("2026-03-20"),
  createdAt: new Date(),
  updatedAt: new Date(),
  arxivId: "2401.12345",
  paperUrl: "https://example.com/paper",
  pdfUrl: "https://example.com/paper.pdf",
  githubUrl: null,
  githubStars: 100,
  github_hourly_increase: 1,
  githubForks: 10,
  hfUrl: null,
  huggingface_url: null,
  hf_model_url: null,
  trendingScore: 50,
  hfUpvotes: 5,
  projectUrl: null,
  citationCount: 20,
  language: "en",
  authors: "Alice, Bob",
  tasks: [],
  methods: [],
  sotaClaims: [],
  rankings: [],
  repositories: [],
};

test("Case 1: No filters - where.AND should be undefined and publicationDate set", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  const result = await getPapers(router, {});
  const where = getCapturedWhere();

  assert.strictEqual(where.AND, undefined);
  assert.deepStrictEqual(where.publicationDate, { not: null });
  assert.strictEqual(result.papers.length, 1);
  assert.strictEqual(result.total, 1);
});

test("Case 2: Organization only - preserves case-insensitive matching for Paper.organization and model vendor", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "Google" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 1);

  const orgCondition = where.AND[0];
  assert.ok(Array.isArray(orgCondition.OR));
  assert.strictEqual(orgCondition.OR.length, 2);

  // Paper.organization = Google (case-insensitive)
  assert.deepStrictEqual(orgCondition.OR[0], {
    organization: { equals: "Google", mode: "insensitive" },
  });

  // linked model vendor = Google (case-insensitive)
  assert.deepStrictEqual(orgCondition.OR[1], {
    models: { some: { model: { vendor: { equals: "Google", mode: "insensitive" } } } },
  });
});

test("Case 3: Task only - preserves existing task OR conditions", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { task: "reasoning" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 1);

  const taskCondition = where.AND[0];
  assert.ok(Array.isArray(taskCondition.OR));
  assert.strictEqual(taskCondition.OR.length, 3);
  assert.ok(taskCondition.OR[0].tasks);
  assert.ok(taskCondition.OR[1].task);
  assert.ok(taskCondition.OR[2].title);
});

test("Case 4: Method only - preserves existing method OR conditions", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { method: "lora" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 1);

  const methodCondition = where.AND[0];
  assert.ok(Array.isArray(methodCondition.OR));
  assert.strictEqual(methodCondition.OR.length, 3);
  assert.ok(methodCondition.OR[0].methods);
  assert.ok(methodCondition.OR[1].title);
  assert.ok(methodCondition.OR[2].abstract);
});

test("Case 5: Organization + Task - both combined with AND semantics, not overwriting", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "Google", task: "reasoning" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 2);

  // Both task and organization must exist as separate elements in AND
  const hasTask = where.AND.some((c: any) => c.OR?.some((o: any) => o.task !== undefined));
  const hasOrg = where.AND.some((c: any) => c.OR?.some((o: any) => o.organization !== undefined));

  assert.ok(hasTask, "Task filter must be present in AND");
  assert.ok(hasOrg, "Organization filter must be present in AND");
});

test("Case 6: Organization + Method - both combined with AND semantics", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "Google", method: "lora" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 2);

  const hasMethod = where.AND.some((c: any) => c.OR?.some((o: any) => o.methods !== undefined));
  const hasOrg = where.AND.some((c: any) => c.OR?.some((o: any) => o.organization !== undefined));

  assert.ok(hasMethod, "Method filter must be present in AND");
  assert.ok(hasOrg, "Organization filter must be present in AND");
});

test("Case 7: Task + Method - both combined with AND semantics", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { task: "reasoning", method: "lora" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 2);

  const hasTask = where.AND.some((c: any) => c.OR?.some((o: any) => o.task !== undefined));
  const hasMethod = where.AND.some((c: any) => c.OR?.some((o: any) => o.methods !== undefined));

  assert.ok(hasTask, "Task filter must be present in AND");
  assert.ok(hasMethod, "Method filter must be present in AND");
});

test("Case 8: Organization + Task + Method - all three combined with AND semantics", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, {
    organization: "Google",
    task: "reasoning",
    method: "lora",
  });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 3);

  const hasTask = where.AND.some((c: any) => c.OR?.some((o: any) => o.task !== undefined));
  const hasMethod = where.AND.some((c: any) => c.OR?.some((o: any) => o.methods !== undefined));
  const hasOrg = where.AND.some((c: any) => c.OR?.some((o: any) => o.organization !== undefined));

  assert.ok(hasTask, "Task filter must be present in AND");
  assert.ok(hasMethod, "Method filter must be present in AND");
  assert.ok(hasOrg, "Organization filter must be present in AND");

  // Verify internal OR logic inside each filter is intact (not flattened into one global OR)
  where.AND.forEach((cond: any) => {
    assert.ok(Array.isArray(cond.OR), "Each filter must retain its own OR alternatives");
  });
});

test("Case 9: Organization case-insensitivity verification", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "gOoGlE" });
  const where = getCapturedWhere();

  const orgCondition = where.AND[0];
  assert.strictEqual(orgCondition.OR[0].organization.equals, "gOoGlE");
  assert.strictEqual(orgCondition.OR[0].organization.mode, "insensitive");
  assert.strictEqual(orgCondition.OR[1].models.some.model.vendor.equals, "gOoGlE");
  assert.strictEqual(orgCondition.OR[1].models.some.model.vendor.mode, "insensitive");
});

test("Case 10: Model filter combination with organization", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "OpenAI", model: "gpt-4" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 2);

  const hasModel = where.AND.some((c: any) => c.models?.some?.model?.slug === "gpt-4");
  const hasOrg = where.AND.some((c: any) => c.OR?.some((o: any) => o.organization?.equals === "OpenAI"));

  assert.ok(hasModel, "Model condition must be present in AND");
  assert.ok(hasOrg, "Organization condition must be present in AND");
});

test("Case 11: Cascading fallback query preserves AND conditions", async () => {
  const { router, getCapturedWhere, setMockPapers } = createMockQueryRouter();
  // Return empty array on first query to trigger fallback
  setMockPapers([]);

  await getPapers(router, { organization: "Google", task: "reasoning", period: "week" });
  const where = getCapturedWhere();

  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 2);
  assert.ok(where.publicationDate.gte !== undefined);
});

test("Case 12: Bug 2 behavior preserved - total equals pagePapers.length", async () => {
  const { router, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper, { ...samplePaper, id: "paper-2", slug: "test-paper-2" }]);

  const result = await getPapers(router, { limit: 10 });
  assert.strictEqual(result.total, 2);
  assert.strictEqual(result.papers.length, 2);
  assert.strictEqual(result.hasMore, false);
});
