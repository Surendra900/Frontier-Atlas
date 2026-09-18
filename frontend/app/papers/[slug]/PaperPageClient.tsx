"use client";

import { useState, useEffect } from "react";
import { AlertCircle, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPaperBySlug, getPaperBySlugSync } from "@/lib/papers";
import type { PaperDetail as PaperDetailType } from "@/lib/papers";
import PaperDetail from "@/components/PaperDetail";
import PaperDetailSkeleton from "@/components/PaperDetailSkeleton";

interface PaperPageClientProps {
  initialPaper: PaperDetailType | null;
  slug: string;
}

export default function PaperPageClient({ initialPaper, slug }: PaperPageClientProps) {
  // Use initialPaper from server if available, otherwise synchronous storage cache
  const [paper, setPaper] = useState<PaperDetailType | null>(() => {
    if (initialPaper) return initialPaper;
    if (typeof window === "undefined") return null;
    return getPaperBySlugSync(slug);
  });

  const [loading, setLoading] = useState(() => !paper);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    if (initialPaper) {
      setPaper(initialPaper);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    getPaperBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setPaper(data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && (err.message.includes("404") || err.message.includes("Not Found"))) {
          setNotFound(true);
        } else {
          setError("Failed to load paper. Please try again later.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialPaper]);

  if (loading && !paper) {
    return <PaperDetailSkeleton />;
  }

  if (notFound) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-800 transition-colors no-underline">Home</Link>
          <span>›</span>
          <Link href="/papers" className="hover:text-gray-800 transition-colors no-underline">Papers</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{slug}</span>
        </nav>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Paper not found</h2>
          <p className="text-sm text-gray-500">
            The paper &ldquo;{slug}&rdquo; does not exist or may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F55036] hover:bg-[#e0432b] text-white rounded-full text-sm font-semibold transition-colors mt-4 shadow-xs"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-800 transition-colors no-underline">Home</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{slug}</span>
        </nav>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors mt-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  return <PaperDetail paper={paper} />;
}
