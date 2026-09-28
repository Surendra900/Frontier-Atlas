"use client";

import {
  FileText,
  Star,
  Quote,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { MethodDetail as MethodDetailType } from "@/lib/methods";
import { slugify } from "@/lib/methods";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function PaperCard({
  paper,
}: {
  paper: MethodDetailType["papers"][number];
}) {
  const authorNames = Array.isArray(paper?.authors) ? paper.authors : [];
  const citationCount = Number(paper?.citationCount) || 0;
  const githubStars = Number(paper?.githubStars) || 0;
  const paperSlug = paper?.slug ? encodeURIComponent(paper.slug) : "";

  return (
    <div className="ds-card p-5 flex flex-col gap-3">
      {paperSlug ? (
        <Link
          href={`/papers/${paperSlug}`}
          className="text-[16px] font-semibold text-[#111111] hover:text-[#F55036] transition-colors leading-snug no-underline"
        >
          {paper.title || "Untitled Paper"}
        </Link>
      ) : (
        <h3 className="text-[16px] font-semibold text-[#111111] leading-snug">
          {paper?.title || "Untitled Paper"}
        </h3>
      )}

      {authorNames.length > 0 && (
        <div className="flex items-start gap-1.5 text-[13px] text-[#555555]">
          <Users size={14} className="mt-0.5 shrink-0 text-[#8B8B8B]" />
          <span className="line-clamp-2">
            {authorNames.map((a, i) => {
              const name = a?.name || "Unknown Author";
              const authorSlug = encodeURIComponent(slugify(name));
              return (
                <span key={`${name}-${i}`}>
                  {i > 0 && <span className="text-[#DCDCD7]">, </span>}
                  <Link
                    href={`/authors/${authorSlug}`}
                    className="hover:text-[#F55036] transition-colors no-underline"
                  >
                    {name}
                  </Link>
                </span>
              );
            })}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#555555]">
        {paper?.publicationDate && (
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#8B8B8B]" />
            {formatDate(paper.publicationDate)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Quote size={14} className="text-[#8B8B8B]" />
          {citationCount.toLocaleString()} citation{citationCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={14} className="text-[#8B8B8B]" />
          {githubStars.toLocaleString()} star{githubStars !== 1 ? "s" : ""}
        </span>
      </div>

      {paperSlug && (
        <div className="pt-1">
          <Link
            href={`/papers/${paperSlug}`}
            className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-3 py-1.5 no-underline"
          >
            <ExternalLink size={13} />
            Open Paper
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MethodDetail({
  method,
}: {
  method: MethodDetailType;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    if (navigator?.share) {
      try {
        await navigator.share({
          title: method?.name || "Method Detail",
          url: window.location.href,
        });
      } catch {
        // Ignore share errors
      }
    } else {
      handleCopyLink();
    }
  };

  const methodName = method?.name || "Unnamed Method";
  const methodSlug = method?.slug || "";
  const papers = Array.isArray(method?.papers) ? method.papers : [];
  const rawPaperCount = Number(method?.paperCount);
  const paperCount = !isNaN(rawPaperCount) ? rawPaperCount : papers.length;

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#111111]">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <Link href="/" className="hover:text-[#F55036] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/methods" className="hover:text-[#F55036] transition-colors no-underline">
            Methods
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium truncate max-w-[200px]">
            {methodName}
          </span>
        </nav>

        <div className="ds-card-hero p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-2">
                {methodName}
              </h1>
              {methodSlug && (
                <span className="inline-block ds-chip text-[11px] mb-3">
                  {methodSlug}
                </span>
              )}
              <div className="flex items-center gap-2 text-[14px] text-[#555555]">
                <FileText size={16} className="text-[#8B8B8B]" />
                <span>
                  <strong className="font-semibold text-[#111111]">
                    {paperCount.toLocaleString()}
                  </strong>{" "}
                  {paperCount === 1 ? "paper" : "papers"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label="Share this method"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label={copied ? "Link copied" : "Copy link to this method"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {papers.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">
              Papers ({paperCount.toLocaleString()})
            </h2>
            <div className="flex flex-col gap-4">
              {papers.map((paper, idx) => (
                <PaperCard key={paper?.id || `paper-${idx}`} paper={paper} />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">Papers</h2>
            <div className="flex flex-col items-center justify-center py-16 gap-3 ds-card">
              <FileText size={28} className="text-[#8B8B8B]" />
              <p className="text-[14px] text-[#555555]">
                No papers are associated with this method yet.
              </p>
            </div>
          </section>
        )}

        <div className="flex justify-start">
          <Link
            href="/methods"
            className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} />
            Back to Methods
          </Link>
        </div>
      </div>
    </div>
  );
}