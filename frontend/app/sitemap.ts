import type { MetadataRoute } from "next";
import { getBenchmarks, type BenchmarkItem } from "@/lib/benchmarks";
import { getPapers, type Paper } from "@/lib/paperApi";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";
  const now = new Date();

  // 1. Core Platform Pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/papers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/benchmarks`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/models`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tasks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/methods`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/datasets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/discussions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/authors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // 2. Evaluation Domain Categories
  const DOMAINS = [
    "General AI",
    "Language",
    "Reasoning",
    "Coding",
    "Agents",
    "Computer Vision",
    "OCR & Document AI",
    "Multimodal",
    "Audio & Speech",
    "Video",
    "Robotics",
    "Healthcare",
    "Mathematics",
    "Time Series",
    "Graphs",
    "Scientific AI",
  ];

  const domainRoutes: MetadataRoute.Sitemap = DOMAINS.map((domain) => ({
    url: `${siteUrl}/benchmarks?domain=${encodeURIComponent(domain)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // 3. Dynamic Benchmarks
  let benchmarks: BenchmarkItem[] = [];
  try {
    benchmarks = await getBenchmarks();
  } catch {
    benchmarks = [];
  }

  const benchmarkRoutes: MetadataRoute.Sitemap = (
    benchmarks.length > 0
      ? benchmarks
      : [
          { slug: "swe-bench-verified" },
          { slug: "humaneval" },
          { slug: "mmlu" },
          { slug: "imagenet" },
          { slug: "gsm8k" },
          { slug: "math" },
          { slug: "arc-challenge" },
          { slug: "hellaswag" },
          { slug: "vqa-v2" },
          { slug: "ocrbench-v2" },
        ]
  ).map((b) => ({
    url: `${siteUrl}/benchmarks/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // 4. Dynamic Research Papers
  let papers: Paper[] = [];
  try {
    const res = await getPapers({ limit: 60 });
    papers = res?.papers || [];
  } catch {
    papers = [];
  }

  const paperRoutes: MetadataRoute.Sitemap = papers.map((p) => ({
    url: `${siteUrl}/papers/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...coreRoutes, ...domainRoutes, ...benchmarkRoutes, ...paperRoutes];
}
