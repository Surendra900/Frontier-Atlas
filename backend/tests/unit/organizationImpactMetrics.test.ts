import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMetricValue,
  extractArxivId,
  normalizeRepoUrl,
  normalizeUrl,
  calculateOrganizationImpactMetrics,
  doesModelOverlapPaper,
  doModelsOverlap,
} from "../../../frontend/lib/impactMetrics";
import type { Paper } from "../../../frontend/lib/paperApi";
import type { ModelItem } from "../../../frontend/lib/models";

// Helper to create mock Paper
function createMockPaper(overrides: Partial<Paper> = {}): Paper {
  return {
    id: "paper-1",
    slug: "paper-1",
    title: "Test Paper",
    thumbnail: "",
    authors: [],
    date: "2026-01-01",
    description: "",
    sota: "",
    tags: ["NLP"],
    additionalTags: ["Transformer"],
    upvotes: "0",
    repo: "0",
    citations: 0,
    ...overrides,
  };
}

// Helper to create mock ModelItem
function createMockModel(overrides: Partial<ModelItem> = {}): ModelItem {
  return {
    id: "model-1",
    name: "Test Model",
    slug: "model-1",
    vendor: "Test Org",
    releaseDate: "2026-01-01",
    parameterCount: "7B",
    modality: "text",
    accessType: "open",
    opennessType: "open",
    description: "",
    benchmarkScore: null,
    modelFamily: "Test",
    category: "LLM",
    capabilities: [],
    researchAreas: [],
    architecture: "Transformer",
    contextWindow: "4k",
    license: "MIT",
    paperUrl: null,
    repositoryUrl: null,
    apiUrl: null,
    createdAt: "2026-01-01",
    paperCount: 1,
    citationCount: 0,
    githubStars: 0,
    trendingScore: 0,
    latestPaperDate: null,
    latestPaperTitle: null,
    latestPaperSlug: null,
    tasks: [],
    ...overrides,
  };
}

test("Numeric parsing: parseMetricValue handles various formats and edge cases", () => {
  // Test case 5: Formatted numeric values
  assert.strictEqual(parseMetricValue(500), 500);
  assert.strictEqual(parseMetricValue("500"), 500);
  assert.strictEqual(parseMetricValue("1.2k"), 1200);
  assert.strictEqual(parseMetricValue("2.5K"), 2500);
  assert.strictEqual(parseMetricValue("1M"), 1000000);
  assert.strictEqual(parseMetricValue("1.5M"), 1500000);
  assert.strictEqual(parseMetricValue("10k"), 10000);
  assert.strictEqual(parseMetricValue("1.2B"), 1200000000);
  assert.strictEqual(parseMetricValue("1,200"), 1200);

  // Test case 6: Empty or missing metric values
  assert.strictEqual(parseMetricValue(null), 0);
  assert.strictEqual(parseMetricValue(undefined), 0);
  assert.strictEqual(parseMetricValue(""), 0);
  assert.strictEqual(parseMetricValue("   "), 0);
  assert.strictEqual(parseMetricValue(NaN), 0);
  assert.strictEqual(parseMetricValue("N/A"), 0);
  assert.strictEqual(parseMetricValue("invalid"), 0);
  assert.strictEqual(parseMetricValue(0), 0);
  assert.strictEqual(parseMetricValue("0"), 0);
});

test("Test 1: Organization with papers only", () => {
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "paper-one",
      title: "Paper One",
      citations: 500,
      upvotes: "1.2k", // 1200 stars
    }),
    createMockPaper({
      id: "p2",
      slug: "paper-two",
      title: "Paper Two",
      citations: 300,
      upvotes: "800", // 800 stars
    }),
  ];
  const models: ModelItem[] = [];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 800);
  assert.strictEqual(metrics.totalStars, 2000);
  // Focus areas should be derived from paper tags when models are empty
  assert.deepStrictEqual(metrics.focusAreas, ["NLP", "Transformer"]);
});

test("Test 2: Organization with models only", () => {
  const papers: Paper[] = [];
  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "model-one",
      name: "Model One",
      citationCount: 400,
      githubStars: 2500, // could be parsed or number
      researchAreas: ["Computer Vision"],
    }),
    createMockModel({
      id: "m2",
      slug: "model-two",
      name: "Model Two",
      citationCount: 600,
      githubStars: 500,
      capabilities: ["Image Generation"],
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 1000);
  assert.strictEqual(metrics.totalStars, 3000);
  assert.deepStrictEqual(metrics.focusAreas, ["Computer Vision", "Image Generation"]);
});

test("Test 3: Organization with both papers and models (disjoint / no overlap)", () => {
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "quantum-paper",
      title: "Quantum Computing Advances",
      citations: 100,
      upvotes: "50",
    }),
  ];
  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "audio-synth-model",
      name: "AudioSynth",
      citationCount: 200,
      githubStars: 80,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  // Both should be counted as they are completely independent research
  assert.strictEqual(metrics.totalCitations, 300);
  assert.strictEqual(metrics.totalStars, 130);
});

test("Test 4: Organization where model and paper metrics overlap", () => {
  // Scenario: Meta publishes "The Llama 3 Herd of Models" and releases Llama 3 8B and Llama 3 70B
  const papers: Paper[] = [
    createMockPaper({
      id: "p-llama3",
      slug: "llama-3-herd-of-models",
      title: "The Llama 3 Herd of Models",
      paperUrl: "https://arxiv.org/abs/2407.21783",
      arxivId: "2407.21783",
      citations: 1200,
      upvotes: "10k", // 10,000 stars
    }),
    createMockPaper({
      id: "p-unrelated",
      slug: "unrelated-research",
      title: "Unrelated Explorations in Robotics",
      citations: 50,
      upvotes: "20",
    }),
  ];

  const models: ModelItem[] = [
    createMockModel({
      id: "m-llama3-8b",
      slug: "llama-3-8b",
      name: "Llama 3 8B",
      paperUrl: "https://arxiv.org/abs/2407.21783",
      latestPaperSlug: "llama-3-herd-of-models",
      citationCount: 1200,
      githubStars: 10000,
    }),
    createMockModel({
      id: "m-llama3-70b",
      slug: "llama-3-70b",
      name: "Llama 3 70B",
      paperUrl: "https://arxiv.org/pdf/2407.21783.pdf", // alternate pdf link
      citationCount: 1200,
      githubStars: 10000,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  // Total citations: 1200 (Llama 3 paper) + 50 (Unrelated) = 1250
  // NOT 1200 + 50 + 1200 + 1200 = 3650!
  assert.strictEqual(metrics.totalCitations, 1250);

  // Total stars: 10,000 (Llama 3 paper) + 20 (Unrelated) = 10020
  // NOT 10,000 + 20 + 10,000 + 10,000 = 30020!
  assert.strictEqual(metrics.totalStars, 10020);
});

test("Test 4b: Overlap detection by GitHub repository URL", () => {
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "whisper-paper",
      title: "Robust Speech Recognition via Large-Scale Weak Supervision",
      githubUrl: "https://github.com/openai/whisper.git",
      citations: 3000,
      upvotes: "2.5K", // 2500
    }),
  ];

  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "whisper-large-v3",
      name: "Whisper Large v3",
      repositoryUrl: "https://github.com/openai/whisper",
      citationCount: 3000,
      githubStars: 2500,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 3000);
  assert.strictEqual(metrics.totalStars, 2500);
});

test("Test 4c: Overlap detection by paper title and model name prefix", () => {
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "gpt-4-report",
      title: "GPT-4 Technical Report",
      citations: 8000,
      upvotes: "500",
    }),
  ];

  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "gpt-4",
      name: "GPT-4",
      citationCount: 8000,
      githubStars: 500,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 8000);
  assert.strictEqual(metrics.totalStars, 500);
});

test("Edge case: Model with higher metrics than recorded on paper reconciles without double counting", () => {
  // If paper was ingested before citation counts updated (e.g. 0 citations),
  // but model has the refreshed 1200 citations, reconcile the difference.
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "my-model-paper",
      title: "My Model Paper",
      paperUrl: "https://arxiv.org/abs/2301.00001",
      citations: 0,
      upvotes: "0",
    }),
  ];

  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "my-model",
      name: "My Model",
      paperUrl: "https://arxiv.org/abs/2301.00001",
      citationCount: 1200,
      githubStars: 2500,
    }),
    // Second variant of same model shouldn't add it again
    createMockModel({
      id: "m2",
      slug: "my-model-small",
      name: "My Model Small",
      paperUrl: "https://arxiv.org/abs/2301.00001",
      citationCount: 1200,
      githubStars: 2500,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 1200);
  assert.strictEqual(metrics.totalStars, 2500);
});

test("Edge case: Multiple models sharing the same paper when papers array is empty", () => {
  // If organization has no papers returned, but has multiple model variants of the same paper
  const papers: Paper[] = [];
  const models: ModelItem[] = [
    createMockModel({
      id: "m1",
      slug: "mistral-7b-v0.1",
      name: "Mistral 7B v0.1",
      paperUrl: "https://arxiv.org/abs/2310.06825",
      citationCount: 1500,
      githubStars: 3000,
    }),
    createMockModel({
      id: "m2",
      slug: "mistral-7b-instruct",
      name: "Mistral 7B Instruct",
      paperUrl: "https://arxiv.org/abs/2310.06825",
      citationCount: 1500,
      githubStars: 3000,
    }),
  ];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 1500);
  assert.strictEqual(metrics.totalStars, 3000);
});

test("Edge case: Duplicate papers in papers array do not double-count", () => {
  const papers: Paper[] = [
    createMockPaper({
      id: "p1",
      slug: "paper-dup",
      title: "Duplicated Paper",
      citations: 500,
      upvotes: "200",
    }),
    createMockPaper({
      id: "p1",
      slug: "paper-dup",
      title: "Duplicated Paper",
      citations: 500,
      upvotes: "200",
    }),
  ];
  const models: ModelItem[] = [];

  const metrics = calculateOrganizationImpactMetrics(papers, models);

  assert.strictEqual(metrics.totalCitations, 500);
  assert.strictEqual(metrics.totalStars, 200);
});
