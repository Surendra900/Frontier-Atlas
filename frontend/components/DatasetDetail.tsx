"use client";

import {
  FileText,
  Quote,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import type { DatasetDetail as DatasetDetailType } from "@/lib/datasets";

function PaperCard({
  paper,
}: {
  paper: DatasetDetailType["papers"][number];
}) {
  return (
    <div className="ds-card p-5 flex flex-col gap-3">
      <Link
        href={`/papers/${paper.slug}`}
        className="text-[16px] font-semibold text-[#111111] hover:text-[#F55036] transition-colors leading-snug no-underline"
      >
        {paper.title}
      </Link>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#555555]">
        <span className="flex items-center gap-1.5">
          <Quote size={14} className="text-[#8B8B8B]" />
          {paper.citationCount} citation{paper.citationCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="pt-1">
        <Link
          href={`/papers/${paper.slug}`}
          className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-3 py-1.5 no-underline"
        >
          <ExternalLink size={13} />
          Open Paper
        </Link>
      </div>
    </div>
  );
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function DatasetDetail({
  dataset,
}: {
  dataset: DatasetDetailType;
}) {
  const [copied, setCopied] = useState(false);
  const createdDate = new Date(dataset.createdAt);
  const isNew = Date.now() - createdDate.getTime() < THIRTY_DAYS_MS;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dataset.name,
          url: window.location.href,
        });
      } catch {
        // ignore
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <Link href="/" className="hover:text-[#F55036] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/datasets" className="hover:text-[#F55036] transition-colors no-underline">
            Datasets
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium truncate max-w-[200px]">
            {dataset.name}
          </span>
        </nav>

        <div className="ds-card-hero p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight">
                  {dataset.name}
                </h1>
                {isNew && (
                  <span className="ds-chip text-[11px]">New</span>
                )}
              </div>
              <span className="inline-block ds-chip text-[11px] mb-3">
                {dataset.slug}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#555555]">
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-[#8B8B8B]" />
                  <span>
                    <strong className="font-semibold text-[#111111]">
                      {dataset.paperCount}
                    </strong>{" "}
                    {dataset.paperCount === 1 ? "paper" : "papers"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-[#8B8B8B]" />
                  {createdDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label="Share this dataset"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label={copied ? "Link copied" : "Copy link to this dataset"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {dataset.papers.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">
              Papers ({dataset.paperCount})
            </h2>
            <div className="flex flex-col gap-4">
              {dataset.papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {dataset.papers.length === 0 && (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">Papers</h2>
            <div className="flex flex-col items-center justify-center py-16 gap-3 ds-card">
              <FileText size={28} className="text-[#8B8B8B]" />
              <p className="text-[14px] text-[#555555]">
                No papers are associated with this dataset yet.
              </p>
            </div>
          </section>
        )}

        <div className="flex justify-start">
          <Link
            href="/datasets"
            className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} />
            Back to Datasets
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
