import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { normalizePaperDetail, type PaperDetail as PaperDetailType } from "@/lib/papers";
import PaperDetail from "@/components/PaperDetail";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPaper(slug: string): Promise<PaperDetailType | null> {
  if (!slug) return null;
  const PROD_BACKEND = "https://frontieratlas-backend.morningsignal-india.workers.dev";

  try {
    const upstreamUrl = `${PROD_BACKEND}/api/v1/research-papers/${encodeURIComponent(slug)}`;
    const res = await fetch(upstreamUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.status === "success" && json?.data) {
        return normalizePaperDetail(json.data);
      }
    }
  } catch (err) {
    console.warn(`Upstream fetch for slug "${slug}" failed:`, err);
  }

  // Fallback: search in active paper list
  try {
    const listUrl = `${PROD_BACKEND}/api/v1/research-papers?limit=100&period=all`;
    const listRes = await fetch(listUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (listRes.ok) {
      const listJson = await listRes.json();
      const papers: any[] = listJson?.data?.papers || [];
      const lowerSlug = slug.toLowerCase();
      const match = papers.find(
        (p) =>
          p.slug === slug ||
          p.slug?.toLowerCase() === lowerSlug ||
          (p.arxivId && lowerSlug.includes(p.arxivId.toLowerCase())) ||
          (p.id && String(p.id) === slug)
      );

      if (match) {
        return normalizePaperDetail({
          ...match,
          abstract: match.abstract || "Abstract available in the full publication.",
          authors: match.authors || [],
          tasks: match.tasks || [],
          methods: match.methods || [],
          models: match.models || [],
          datasets: match.datasets || [],
          conferences: match.conferences || [],
          rankings: match.rankings || [],
          sotaClaims: match.sotaClaims || [],
          repositories: match.repositories || [],
        });
      }
    }
  } catch (err) {
    console.warn(`Fallback search for slug "${slug}" failed:`, err);
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";
  const paper = await getPaper(slug);

  if (!paper) {
    return {
      title: "Paper Not Found | FrontierAtlas",
    };
  }

  return {
    title: `${paper.title} | FrontierAtlas`,
    description: paper.abstract ? paper.abstract.slice(0, 160) : "Discover frontier AI research on FrontierAtlas.",
  };
}

export default async function PaperPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";
  const paper = await getPaper(slug);

  if (!paper) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
        <style>{`body { overflow: hidden !important; }`}</style>
        <Navbar />
        <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-6 py-6 lg:py-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-gray-800 transition-colors no-underline">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{slug}</span>
            </nav>

            <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Paper not found</h2>
              <p className="text-sm text-gray-500">
                The paper you are looking for does not exist or may have been removed.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold transition-colors mt-4 no-underline"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <PaperDetail paper={paper} />
      </div>
    </div>
  );
}
