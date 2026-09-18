"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  FileText,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ModelDetail as ModelDetailType } from "@/lib/models";


function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export default function ModelDetail({
  model,
  children,
}: {
  model: ModelDetailType;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const createdDate = new Date(model.createdAt);

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
          title: model.name,
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
    <div className="min-h-screen bg-[#F8F7F2] text-[#111111]">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <Link href="/" className="hover:text-[#F55036] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/models" className="hover:text-[#F55036] transition-colors no-underline">
            Models
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium truncate max-w-[200px]">
            {model.name}
          </span>
        </nav>

        <div className="ds-card-hero p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight">
                  {model.name}
                </h1>
              </div>
              <span className="inline-block ds-chip text-[11px] mb-3">
                {model.slug}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#555555]">
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-[#8B8B8B]" />
                  <span>
                    <strong className="font-semibold text-[#111111]">
                      {model.paperCount}
                    </strong>{" "}
                    {model.paperCount === 1 ? "paper" : "papers"}
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

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#EAE6DE] bg-white px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#B0ABA0] mb-1">
                    Linked Papers
                  </div>
                  <div className="text-[18px] font-semibold text-[#111111] leading-none">
                    {formatCompact(model.paperCount)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#EAE6DE] bg-white px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#B0ABA0] mb-1">
                    Citations
                  </div>
                  <div className="text-[18px] font-semibold text-[#111111] leading-none">
                    {formatCompact(model.citationCount)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#EAE6DE] bg-white px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#B0ABA0] mb-1">
                    GitHub Stars
                  </div>
                  <div className="text-[18px] font-semibold text-[#111111] leading-none">
                    {formatCompact(model.githubStars)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label="Share this model"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label={copied ? "Link copied" : "Copy link to this model"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {children}

        <div className="flex justify-start">
          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} />
            Back to Models
          </Link>
        </div>
      </div>
    </div>
  );
}
