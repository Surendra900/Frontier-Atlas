import test from "node:test";
import assert from "node:assert/strict";
import { getPapers } from "../../src/services/paper.service.js";
import { QueryRouter } from "../../src/routing/index.js";

function createMockQueryRouter() {
  let capturedFindManyWhere: any = null;
  let capturedFindManyOrderBy: any = null;
  let capturedFindManyArgs: any = null;
  let findManyCallCount = 0;
  let mockPapersToReturn: any[] = [];

  const mockPrisma = {
    paper: {
      findFirst: async () => ({
        publicationDate: new Date("2026-03-20T00:00:00.000Z"),
      }),
      findMany: async (args: any) => {
        capturedFindManyWhere = args.where;
        capturedFindManyOrderBy = args.orderBy;
        capturedFindManyArgs = args;
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
    getCapturedOrderBy: () => capturedFindManyOrderBy,
    getCapturedArgs: () => capturedFindManyArgs,
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

test("Case 13: Bug 4 - sort citations orders by citationCount desc, githubStars desc, publicationDate desc, slug asc", async () => {
  const { router, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { sort: "citations" });
  const orderBy = getCapturedOrderBy();

  assert.deepStrictEqual(orderBy, [
    { citationCount: "desc" },
    { githubStars: "desc" },
    { publicationDate: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 14: Bug 4 - sort stars orders by githubStars desc, citationCount desc, publicationDate desc, slug asc", async () => {
  const { router, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { sort: "stars" });
  const orderBy = getCapturedOrderBy();

  assert.deepStrictEqual(orderBy, [
    { githubStars: "desc" },
    { citationCount: "desc" },
    { publicationDate: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 15: Bug 4 - sort latest orders by publicationDate desc, githubStars desc, slug asc", async () => {
  const { router, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { sort: "latest" });
  const orderBy = getCapturedOrderBy();

  assert.deepStrictEqual(orderBy, [
    { publicationDate: "desc" },
    { githubStars: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 16: Bug 4 - organization filter with citation sort preserves org WHERE and applies citation orderBy", async () => {
  const { router, getCapturedWhere, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "Google", sort: "citations" });
  const where = getCapturedWhere();
  const orderBy = getCapturedOrderBy();

  // Verify WHERE contains organization condition
  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 1);
  assert.strictEqual(where.AND[0].OR[0].organization.equals, "Google");

  // Verify orderBy is citationCount descending
  assert.deepStrictEqual(orderBy, [
    { citationCount: "desc" },
    { githubStars: "desc" },
    { publicationDate: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 17: Bug 4 - organization filter with stars sort preserves org WHERE and applies stars orderBy", async () => {
  const { router, getCapturedWhere, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, { organization: "DeepMind", sort: "stars" });
  const where = getCapturedWhere();
  const orderBy = getCapturedOrderBy();

  // Verify WHERE contains organization condition
  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 1);
  assert.strictEqual(where.AND[0].OR[0].organization.equals, "DeepMind");

  // Verify orderBy is githubStars descending
  assert.deepStrictEqual(orderBy, [
    { githubStars: "desc" },
    { citationCount: "desc" },
    { publicationDate: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 18: Bug 4 - pagination is preserved with sorting", async () => {
  const { router, getCapturedArgs, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  const result = await getPapers(router, {
    organization: "Google",
    sort: "citations",
    page: 2,
    limit: 10,
  });
  const args = getCapturedArgs();

  // skip = (page - 1) * limit = 10
  assert.strictEqual(args.skip, 10);
  // take = limit + 1 = 11 (to compute hasMore)
  assert.strictEqual(args.take, 11);
  assert.strictEqual(result.page, 2);
  assert.strictEqual(result.hasMore, false);
});

test("Case 19: Bug 4 - combined filters (organization + task + method) preserved with sorting", async () => {
  const { router, getCapturedWhere, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  setMockPapers([samplePaper]);

  await getPapers(router, {
    organization: "Google",
    task: "reasoning",
    method: "lora",
    sort: "citations",
  });
  const where = getCapturedWhere();
  const orderBy = getCapturedOrderBy();

  // Bug 3 requirement: all 3 filters combined in AND
  assert.ok(Array.isArray(where.AND));
  assert.strictEqual(where.AND.length, 3);

  // Bug 4 requirement: citation orderBy applied
  assert.deepStrictEqual(orderBy, [
    { citationCount: "desc" },
    { githubStars: "desc" },
    { publicationDate: "desc" },
    { slug: "asc" },
  ]);
});

test("Case 20: Bug 4 - sorting works across complete matching dataset without frontend truncation", async () => {
  const { router, getCapturedWhere, getCapturedOrderBy, setMockPapers } = createMockQueryRouter();
  // Simulate returning 25 papers from database matching the sort
  const papers = Array.from({ length: 25 }, (_, i) => ({
    ...samplePaper,
    id: `paper-${i}`,
    slug: `paper-${i}`,
    citationCount: 1000 - i * 10,
  }));
  setMockPapers(papers);

  const result = await getPapers(router, {
    organization: "Meta",
    sort: "citations",
    limit: 25,
  });
  const orderBy = getCapturedOrderBy();

  assert.deepStrictEqual(orderBy[0], { citationCount: "desc" });
  assert.strictEqual(result.papers.length, 25);
  // Verify top paper has the highest citations as determined by backend
  assert.strictEqual(result.papers[0].citationCount, 1000);
  assert.strictEqual(result.papers[24].citationCount, 760);
});
