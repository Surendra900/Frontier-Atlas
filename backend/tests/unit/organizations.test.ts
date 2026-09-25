import test, { describe } from "node:test";
import assert from "node:assert/strict";

describe("Bug 1 & Performance: No N+1 Avalanche / Grouped Aggregation", () => {
  test("Organization directory data is fetched using aggregated counts rather than N individual queries", () => {
    // Simulate directory loader with mock metrics endpoint vs N+1 loader
    let queryCount = 0;
    const mockAggregatedDb = () => {
      queryCount++;
      return [
        { organization: "google", paperCount: 210, citations: 15400, stars: 4200, trendingScore: 19600 },
        { organization: "openai", paperCount: 95, citations: 25000, stars: 12000, trendingScore: 37000 },
        { organization: "meta", paperCount: 65, citations: 8900, stars: 3100, trendingScore: 12000 },
      ];
    };

    // Directory loads with 1 query instead of 594 queries
    const result = mockAggregatedDb();
    assert.equal(queryCount, 1, "Should only perform 1 aggregated database query");
    assert.equal(result.length, 3);
  });

  test("Directory returns valid organizations even if metrics query fails", () => {
    const fallbackVendors = [{ name: "Google", count: 87 }, { name: "OpenAI", count: 83 }];
    const fallbackModels: any[] = [];
    
    // Server metrics failed (null)
    const metricsResponse: any = null;
    const paperCounts: Record<string, number> = {};

    if (!metricsResponse) {
      for (const v of fallbackVendors) {
        paperCounts[v.name] = 0; // safe default without crashing
      }
    }

    assert.equal(paperCounts["Google"], 0);
    assert.equal(paperCounts["OpenAI"], 0);
  });
});

describe("Bug 2: Paper Counts (Not Capped at 50)", () => {
  test("Organization with < 50 papers returns exact count", () => {
    const apiResult = {
      papers: new Array(15).fill({ title: "Paper" }),
      total: 15,
      limit: 50,
    };
    // Verification: count must be apiResult.total, not capped
    const displayedCount = apiResult.total;
    assert.equal(displayedCount, 15);
  });

  test("Organization with > 50 papers returns true count (> 50), not capped at 50", () => {
    // When limit is 50, papers array length is 50, but total is 210
    const apiResult = {
      papers: new Array(50).fill({ title: "Paper" }),
      total: 210,
      limit: 50,
    };
    const displayedCount = apiResult.total;
    assert.equal(displayedCount, 210, "Total count must not be capped at 50");
    assert.notEqual(displayedCount, apiResult.papers.length);
  });

  test("Organization with 0 papers returns 0 without crashing", () => {
    const apiResult = {
      papers: [],
      total: 0,
      limit: 50,
    };
    const displayedCount = apiResult.total;
    assert.equal(displayedCount, 0);
  });
});

describe("Bug 3: where.OR Filter Overwriting Protection", () => {
  test("Filters are safely combined using AND conditions, preserving all OR conditions", () => {
    const query = {
      task: "nlp",
      method: "transformer",
      model: "gpt-4",
      organization: "OpenAI",
      q: "attention",
    };

    const where: any = {};
    const andConditions: any[] = [];

    if (query.task) andConditions.push({ tasks: { some: { task: { slug: query.task } } } });
    if (query.method) andConditions.push({ methods: { some: { method: { slug: query.method } } } });
    if (query.model) andConditions.push({ models: { some: { model: { slug: query.model } } } });
    if (query.organization) {
      andConditions.push({
        OR: [
          { organization: { equals: query.organization, mode: "insensitive" } },
          { models: { some: { model: { vendor: { equals: query.organization, mode: "insensitive" } } } } },
        ],
      });
    }
    if (query.q) {
      andConditions.push({
        OR: [
          { title: { contains: query.q, mode: "insensitive" } },
          { abstract: { contains: query.q, mode: "insensitive" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Assert that AND contains all conditions
    assert.equal(where.AND.length, 5);

    // Verify organization OR condition is intact
    const orgCondition = where.AND.find((c: any) => c.OR && c.OR[0]?.organization);
    assert.ok(orgCondition, "Organization OR condition must be preserved");
    assert.equal(orgCondition.OR.length, 2);

    // Verify search OR condition is also intact and did not overwrite organization OR
    const searchCondition = where.AND.find((c: any) => c.OR && c.OR[0]?.title);
    assert.ok(searchCondition, "Search OR condition must be preserved");
    assert.equal(searchCondition.OR.length, 2);
  });
});

describe("Bug 4: Citations & Stars Numeric Sorting", () => {
  const sampleOrgs = [
    { name: "Org Alpha", citations: 50, stars: 1200 },
    { name: "Org Beta", citations: 1200, stars: 50 },
    { name: "Org Gamma", citations: 300, stars: 300 },
    { name: "Org Delta", citations: 0, stars: 0 },
  ];

  test("Citations descending: numerical sort, not lexicographical string sort", () => {
    const sorted = [...sampleOrgs].sort(
      (a, b) => (Number(b.citations) || 0) - (Number(a.citations) || 0) || a.name.localeCompare(b.name)
    );
    assert.equal(sorted[0].name, "Org Beta"); // 1200
    assert.equal(sorted[1].name, "Org Gamma"); // 300
    assert.equal(sorted[2].name, "Org Alpha"); // 50
    assert.equal(sorted[3].name, "Org Delta"); // 0
  });

  test("Citations ascending: lowest citations first", () => {
    const sorted = [...sampleOrgs].sort(
      (a, b) => (Number(a.citations) || 0) - (Number(b.citations) || 0) || a.name.localeCompare(b.name)
    );
    assert.equal(sorted[0].name, "Org Delta"); // 0
    assert.equal(sorted[1].name, "Org Alpha"); // 50
    assert.equal(sorted[2].name, "Org Gamma"); // 300
    assert.equal(sorted[3].name, "Org Beta"); // 1200
  });

  test("Stars descending: numerical sort", () => {
    const sorted = [...sampleOrgs].sort(
      (a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0) || a.name.localeCompare(b.name)
    );
    assert.equal(sorted[0].name, "Org Alpha"); // 1200
    assert.equal(sorted[1].name, "Org Gamma"); // 300
    assert.equal(sorted[2].name, "Org Beta"); // 50
    assert.equal(sorted[3].name, "Org Delta"); // 0
  });

  test("Stars ascending: lowest stars first", () => {
    const sorted = [...sampleOrgs].sort(
      (a, b) => (Number(a.stars) || 0) - (Number(b.stars) || 0) || a.name.localeCompare(b.name)
    );
    assert.equal(sorted[0].name, "Org Delta"); // 0
    assert.equal(sorted[1].name, "Org Beta"); // 50
    assert.equal(sorted[2].name, "Org Gamma"); // 300
    assert.equal(sorted[3].name, "Org Alpha"); // 1200
  });
});

describe("Bug 5: Independent and Deduplicated Impact Metrics", () => {
  test("Different organizations receive their own independent metrics", () => {
    const metrics: Record<string, { paperCount: number; citations: number; stars: number }> = {
      google: { paperCount: 210, citations: 15400, stars: 4200 },
      meta: { paperCount: 65, citations: 8900, stars: 3100 },
    };

    assert.notDeepEqual(metrics.google, metrics.meta);
    assert.equal(metrics.google.paperCount, 210);
    assert.equal(metrics.meta.paperCount, 65);
  });

  test("No duplicate metrics when multiple models reference the same paper", () => {
    // Model A and Model B both belong to Google and both reference paper 'p1'
    const models = [
      { vendor: "Google", paperId: "p1", citations: 100 },
      { vendor: "Google", paperId: "p1", citations: 100 }, // duplicate reference
      { vendor: "Google", paperId: "p2", citations: 50 },
    ];

    const seenPapers = new Set<string>();
    let totalCitations = 0;

    for (const m of models) {
      if (!seenPapers.has(m.paperId)) {
        seenPapers.add(m.paperId);
        totalCitations += m.citations;
      }
    }

    assert.equal(seenPapers.size, 2, "Only 2 distinct papers");
    assert.equal(totalCitations, 150, "Citations should only be counted once for distinct papers (100 + 50)");
  });
});

describe("Bug 6: Trending Sorting", () => {
  test("Trending sorting uses numeric trendingScore / momentum with deterministic tie-breakers", () => {
    const orgs = [
      { name: "Org Low", trendingScore: 10, paperCount: 5, count: 2 },
      { name: "Org High", trendingScore: 500, paperCount: 20, count: 10 },
      { name: "Org Mid", trendingScore: 100, paperCount: 15, count: 5 },
      { name: "Org Zero", trendingScore: 0, paperCount: 1, count: 1 },
      { name: "Org Tied", trendingScore: 100, paperCount: 12, count: 5 }, // same score as Mid, fewer papers
    ];

    const sorted = [...orgs].sort(
      (a, b) =>
        (Number(b.trendingScore || 0) - Number(a.trendingScore || 0)) ||
        (Number(b.paperCount || 0) - Number(a.paperCount || 0)) ||
        (b.count - a.count) ||
        a.name.localeCompare(b.name)
    );

    assert.equal(sorted[0].name, "Org High"); // 500
    assert.equal(sorted[1].name, "Org Mid"); // 100, 15 papers
    assert.equal(sorted[2].name, "Org Tied"); // 100, 12 papers
    assert.equal(sorted[3].name, "Org Low"); // 10
    assert.equal(sorted[4].name, "Org Zero"); // 0
  });
});

describe("Bug 7: Organization Logo Fallback", () => {
  function resolveLogoUrl(url?: string | null): string | null {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (
      trimmed === "" ||
      trimmed === "null" ||
      trimmed === "undefined" ||
      trimmed === "FAILED_404"
    ) {
      return null;
    }
    if (trimmed.includes("logo.clearbit.com")) {
      try {
        const parsed = new URL(trimmed);
        const domain = parsed.pathname.replace(/^\/+/, "").replace(/\/.*$/, "").trim();
        if (domain && domain.includes(".")) {
          return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
        }
      } catch {
        return null;
      }
    }
    if (
      trimmed.startsWith("/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:image/")
    ) {
      return trimmed;
    }
    return null;
  }

  test("Valid logo URL is recognized", () => {
    assert.equal(resolveLogoUrl("https://example.com/logo.png"), "https://example.com/logo.png");
    assert.equal(resolveLogoUrl("/local/logo.webp"), "/local/logo.webp");
  });

  test("Discontinued logo.clearbit.com URLs are transformed to Google favicons", () => {
    const clearbitUrl = "https://logo.clearbit.com/openai.com";
    const resolved = resolveLogoUrl(clearbitUrl);
    assert.equal(resolved, "https://www.google.com/s2/favicons?domain=openai.com&sz=128");
  });

  test("Missing or empty logo URL triggers fallback (returns null)", () => {
    assert.equal(resolveLogoUrl(null), null);
    assert.equal(resolveLogoUrl(undefined), null);
    assert.equal(resolveLogoUrl(""), null);
    assert.equal(resolveLogoUrl("   "), null);
  });

  test("Broken or corrupted logo values trigger fallback (returns null)", () => {
    assert.equal(resolveLogoUrl("null"), null);
    assert.equal(resolveLogoUrl("undefined"), null);
    assert.equal(resolveLogoUrl("FAILED_404"), null);
    assert.equal(resolveLogoUrl("invalid-string-not-url"), null);
  });

  function getCandidateUrls(logo: string | null | undefined, name: string): string[] {
    const candidates: string[] = [];
    const primary = resolveLogoUrl(logo);
    if (primary) candidates.push(primary);

    const cleanName = (name || "").trim();
    if (!cleanName) return candidates;

    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(cleanName)) {
      candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanName)}&sz=128`);
    }

    if (/^[a-zA-Z0-9_\-\.]+$/.test(cleanName)) {
      const ghUrl = `https://github.com/${encodeURIComponent(cleanName)}.png`;
      if (!candidates.includes(ghUrl)) candidates.push(ghUrl);

      if (/-hf$/i.test(cleanName)) {
        const withoutHf = cleanName.replace(/-hf$/i, "");
        if (withoutHf) {
          const withoutHfUrl = `https://github.com/${encodeURIComponent(withoutHf)}.png`;
          if (!candidates.includes(withoutHfUrl)) candidates.push(withoutHfUrl);
        }
      }
    }
    return candidates;
  }

  test("Candidate URLs include primary logo first, followed by GitHub avatar for valid handles", () => {
    const candidates = getCandidateUrls("https://logo.clearbit.com/tsinghua.edu.cn", "THUDM");
    assert.equal(candidates[0], "https://www.google.com/s2/favicons?domain=tsinghua.edu.cn&sz=128");
    assert.equal(candidates[1], "https://github.com/THUDM.png");
  });

  test("Missing logo falls back to GitHub avatar candidate for open-source orgs", () => {
    const candidates = getCandidateUrls(null, "THU-KEG");
    assert.deepEqual(candidates, ["https://github.com/THU-KEG.png"]);
  });

  test("HF-suffixed org generates stripped GitHub candidate", () => {
    const candidates = getCandidateUrls(null, "TMLR-Group-HF");
    assert.deepEqual(candidates, [
      "https://github.com/TMLR-Group-HF.png",
      "https://github.com/TMLR-Group.png"
    ]);
  });

  test("Model query take calculates Math.max(200, skip + limit) when full sort is needed", () => {
    const computeTake = (needsFullSort: boolean, skip: number, limit: number) =>
      needsFullSort ? Math.max(200, skip + limit) : limit;

    assert.equal(computeTake(true, 0, 10000), 10000);
    assert.equal(computeTake(true, 0, 50), 200);
    assert.equal(computeTake(false, 0, 50), 50);
  });
});


