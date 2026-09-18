import { redirect } from "next/navigation";

const DOMAIN_MAP: Record<string, string> = {
  "general-ai": "General AI",
  "language": "Language",
  "reasoning": "Reasoning",
  "coding": "Coding",
  "agents": "Agents",
  "computer-vision": "Computer Vision",
  "ocr-document-ai": "OCR & Document AI",
  "multimodal": "Multimodal",
  "audio-speech": "Audio & Speech",
  "video": "Video",
  "robotics": "Robotics",
  "healthcare": "Healthcare",
  "mathematics": "Mathematics",
  "time-series": "Time Series",
  "graphs": "Graphs",
  "scientific-ai": "Scientific AI",
};

interface BenchmarkSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UnifiedBenchmarkSlugRedirect({ params }: BenchmarkSlugPageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const cleanSlug = rawSlug.toLowerCase().trim();

  // If this slug matches a domain, redirect to benchmarks filtered by domain
  if (DOMAIN_MAP[cleanSlug]) {
    redirect(`/benchmarks?domain=${encodeURIComponent(DOMAIN_MAP[cleanSlug])}`);
  }

  // Otherwise, canonically redirect to the benchmark detail leaderboard
  redirect(`/benchmarks/${rawSlug}`);
}