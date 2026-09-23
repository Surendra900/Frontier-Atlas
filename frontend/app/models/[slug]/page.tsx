import type { Metadata } from "next";
import { getModelBySlug } from "@/lib/models";
import type { ModelDetail } from "@/lib/models";
import ModelPageClient from "./ModelPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    const model: ModelDetail | null = await getModelBySlug(slug);

    if (!model) {
      return {
        title: "Model Not Found",
        description: "The requested AI foundation model could not be found on Frontier Atlas.",
      };
    }

    const title = `${model.name} (${model.vendor}) — AI Model Specs, Benchmarks & Code`;
    const description = model.description
      ? model.description.length > 200
        ? model.description.slice(0, 197).trim() + "..."
        : model.description
      : `Explore ${model.name} architecture, verified benchmarks, VRAM hardware memory sizing, and code implementations on Frontier Atlas.`;

    const ogImage = model.vendorLogoUrl || `${siteUrl}/og-image.png`;
    const canonicalUrl = `${siteUrl}/models/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Frontier Atlas",
        type: "article",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: model.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
        creator: "@FrontierAtlas",
      },
    };
  } catch {
    return {
      title: "Foundation Model Profile",
      description: "Discover breakthrough machine learning foundation models, hardware specs, and benchmarks on Frontier Atlas.",
    };
  }
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let model: ModelDetail | null = null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    model = await getModelBySlug(slug);
  } catch {
    model = null;
  }

  // Schema.org SoftwareApplication / AIModel JSON-LD
  const jsonLd = model
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: model.name,
        applicationCategory: "MachineLearningApplication",
        operatingSystem: "Linux, Windows, macOS",
        description: model.description || undefined,
        creator: {
          "@type": "Organization",
          name: model.vendor,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        url: `${siteUrl}/models/${slug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ModelPageClient initialModel={model} slug={slug} />
    </>
  );
}
