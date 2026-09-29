"use client";

export const runtime = "edge";

import { AlertCircle, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useLayoutEffect, Component, type ErrorInfo, type ReactNode } from "react";
import { getPaperBySlug, getPaperBySlugSync } from "@/lib/papers";
import type { PaperDetail as PaperDetailType } from "@/lib/papers";
import PaperDetail from "@/components/PaperDetail";
import PaperDetailSkeleton from "@/components/PaperDetailSkeleton";
import Navbar from "@/components/Navbar";

// Use useLayoutEffect on client, useEffect on server (SSR safety)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

class PaperDetailErrorBoundary extends Component<
  { children: ReactNode; paper: PaperDetailType },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PaperDetail render error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { paper } = this.props;
      return (
        <div className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:px-6 md:px-12 lg:px-16">
          <div className="bg-white rounded-2xl border border-[#EDE8DF] p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-2">Research Paper</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717] leading-tight">
                {paper.title}
              </h1>
              {paper.authors && paper.authors.length > 0 && (
                <p className="text-sm font-semibold text-[#666666] mt-2">
                  {paper.authors.map((a) => a.name).join(", ")}
                </p>
              )}
            </div>
            {paper.abstract && (
              <div className="border-t border-[#E5E5E0] pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8B8B] mb-2">Abstract</h3>
                <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
                  {paper.abstract}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {paper.pdfUrl && (
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#E0462D] text-white rounded-full text-sm font-semibold transition-colors no-underline"
                >
                  Read Paper PDF
                </a>
              )}
              {paper.arxivId && (
                <a
                  href={`https://arxiv.org/abs/${paper.arxivId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 border border-[#E0DDD6] hover:bg-gray-50 text-[#171717] rounded-full text-sm font-semibold transition-colors no-underline"
                >
                  arXiv: {paper.arxivId}
                </a>
              )}
              {paper.githubUrl && (
                <a
                  href={paper.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 border border-[#E0DDD6] hover:bg-gray-50 text-[#171717] rounded-full text-sm font-semibold transition-colors no-underline"
                >
                  GitHub Repository
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PaperPage() {
  const params = useParams();
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string | undefined);
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";

  // ── Cache-first: read synchronously before first paint ──
  const [paper, setPaper] = useState<PaperDetailType | null>(() => {
    if (typeof window === "undefined" || !slug) return null;
    return getPaperBySlugSync(slug);
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined" || !slug) return true;
    return getPaperBySlugSync(slug) === null;
  });
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!slug) return;

    // If we already have cached data, skip the loading spinner entirely.
    // Still re-fetch in background for stale-while-revalidate.
    const cached = getPaperBySlugSync(slug);
    if (cached) {
      setPaper(cached);
      setLoading(false);
      // Silently refresh in background — no spinner shown
      getPaperBySlug(slug, true).then(setPaper).catch(() => {});
      return;
    }

    // No cache → fetch with loading state
    setLoading(true);
    setError(null);
    setNotFound(false);

    getPaperBySlug(slug)
      .then((data) => {
        if (data) {
          setPaper(data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && (err.message.includes("404") || err.message.includes("Not Found"))) {
          setNotFound(true);
        } else {
          setError("Failed to load paper. Please try again later.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  let content = null;

  if (loading && !paper) {
    content = <PaperDetailSkeleton />;
  } else if (notFound) {
    content = (
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold transition-colors mt-4"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  } else if (error) {
    content = (
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-6 py-6 lg:py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-800 transition-colors no-underline">Home</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{slug}</span>
        </nav>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  } else if (paper) {
    content = (
      <PaperDetailErrorBoundary paper={paper}>
        <PaperDetail paper={paper} />
      </PaperDetailErrorBoundary>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {content}
      </div>
    </div>
  );
}

