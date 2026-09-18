import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBenchmarkBySlug, type BenchmarkDetail } from "@/lib/benchmarks";
import { atlasUiFont } from "@/lib/fonts";
import BenchmarkDetailClient from "./BenchmarkDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    const benchmark: BenchmarkDetail | null = await getBenchmarkBySlug(slug);

    if (!benchmark) {
      return {
        title: "Benchmark Not Found",
        description: "The requested benchmark leaderboard could not be found.",
      };
    }

    const title = `${benchmark.name} AI Leaderboard & Benchmark`;
    const description = benchmark.description
      ? benchmark.description
      : `${benchmark.name} state-of-the-art AI benchmark leaderboard tracking model accuracy, citations, and reproducible metrics.`;

    const canonicalUrl = `${siteUrl}/benchmarks/${slug}`;
    const ogImage = `${siteUrl}/og-image.png`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${benchmark.name} AI Evaluation Leaderboard`,
        description,
        url: canonicalUrl,
        siteName: "Frontier Atlas",
        type: "website",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${benchmark.name} Leaderboard`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${benchmark.name} AI Leaderboard`,
        description,
        images: [ogImage],
        creator: "@FrontierAtlas",
      },
    };
  } catch {
    return {
      title: "AI Benchmarks & Leaderboards",
      description: "Discover state-of-the-art benchmarks and model rankings on Frontier Atlas.",
    };
  }
}

export default async function BenchmarkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let benchmark: BenchmarkDetail | null = null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    benchmark = await getBenchmarkBySlug(slug);
  } catch {
    benchmark = null;
  }

  // Schema.org Dataset / TechArticle Structured Data for Google Dataset Search & Scholar
  const jsonLd = benchmark
    ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${benchmark.name} Benchmark Leaderboard`,
        description:
          benchmark.description ||
          `${benchmark.name} benchmark measuring AI model performance on standardized tasks.`,
        url: `${siteUrl}/benchmarks/${benchmark.slug}`,
        keywords: [
          benchmark.name,
          benchmark.domain || "AI Evaluation",
          benchmark.task || "Machine Learning",
          "Leaderboard",
          "SOTA",
          "Benchmark",
        ],
        measurementTechnique: benchmark.metric || "Evaluation Score",
        isAccessibleForFree: true,
        creator: {
          "@type": "Organization",
          name: "Frontier Atlas Research",
          url: siteUrl,
        },
      }
    : null;

  return (
    <div className={`${atlasUiFont.className} flex flex-col min-h-screen bg-[#F8F7F2] text-slate-800`}>
      {/* Schema.org Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Navbar />
      <BenchmarkDetailClient initialBenchmark={benchmark} slug={slug} />
      <Footer />
    </div>
  );
}