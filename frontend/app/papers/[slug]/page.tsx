import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPaperBySlug } from "@/lib/papers";
import type { PaperDetail as PaperDetailType } from "@/lib/papers";
import PaperPageClient from "./PaperPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    const paper: PaperDetailType | null = await getPaperBySlug(slug);

    if (!paper) {
      return {
        title: "Paper Not Found",
        description: "The requested AI research paper could not be found.",
      };
    }

    const title = paper.title;
    const description = paper.abstract
      ? paper.abstract.length > 220
        ? paper.abstract.slice(0, 217).trim() + "..."
        : paper.abstract
      : "Read paper details, abstract, verified benchmarks, and code implementations on Frontier Atlas.";

    const authorNames = paper.authors?.map((a) => a.name) || [];
    const ogImage = paper.thumbnailUrl || `${siteUrl}/og-image.png`;
    const canonicalUrl = `${siteUrl}/papers/${slug}`;

    return {
      title,
      description,
      authors: authorNames.map((name) => ({ name })),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: paper.title,
        description,
        url: canonicalUrl,
        siteName: "Frontier Atlas",
        type: "article",
        publishedTime: paper.publicationDate || undefined,
        authors: authorNames,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: paper.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: paper.title,
        description,
        images: [ogImage],
        creator: "@FrontierAtlas",
      },
      other: {
        citation_title: paper.title,
        ...(paper.publicationDate
          ? { citation_publication_date: paper.publicationDate.split("T")[0].replace(/-/g, "/") }
          : {}),
        ...(paper.pdfUrl ? { citation_pdf_url: paper.pdfUrl } : {}),
        ...(paper.arxivId ? { citation_arxiv_id: paper.arxivId } : {}),
        citation_abstract_html_url: canonicalUrl,
        ...(authorNames.length > 0 ? { citation_authors: authorNames.join("; ") } : {}),
      },
    };
  } catch {
    return {
      title: "AI Research Paper",
      description: "Discover breakthrough machine learning papers, benchmarks, and code on Frontier Atlas.",
    };
  }
}

export default async function PaperPage({ params }: PageProps) {
  const { slug } = await params;
  let paper: PaperDetailType | null = null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontieratlas.org";

  try {
    paper = await getPaperBySlug(slug);
  } catch {
    paper = null;
  }

  // Schema.org ScholarlyArticle JSON-LD
  const jsonLd = paper
    ? {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        headline: paper.title,
        name: paper.title,
        description: paper.abstract,
        datePublished: paper.publicationDate,
        dateModified: paper.updatedAt || paper.publicationDate,
        url: `${siteUrl}/papers/${paper.slug}`,
        mainEntityOfPage: `${siteUrl}/papers/${paper.slug}`,
        author: paper.authors?.map((a) => ({
          "@type": "Person",
          name: a.name,
          url: `${siteUrl}/authors/${a.slug}`,
        })),
        ...(paper.thumbnailUrl ? { image: paper.thumbnailUrl } : {}),
        ...(paper.arxivId ? { identifier: `arxiv:${paper.arxivId}` } : {}),
        ...(paper.githubUrl ? { codeRepository: paper.githubUrl } : {}),
        sameAs: [paper.paperUrl, paper.pdfUrl, paper.githubUrl].filter(Boolean),
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F2] text-[#111111]">
      {/* Highwire Press Google Scholar Author Tags */}
      {paper?.authors?.map((author) => (
        <meta key={author.id || author.name} name="citation_author" content={author.name} />
      ))}

      {/* Schema.org ScholarlyArticle Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Navbar />
      <main className="flex-1 w-full">
        <PaperPageClient initialPaper={paper} slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
