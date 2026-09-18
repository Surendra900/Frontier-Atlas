"use client";

import {
  FileText,
  Quote,
  ExternalLink,
  Share2,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { TaskDetail as TaskDetailType } from "@/lib/tasks";

function PaperCard({
  paper,
}: {
  paper: TaskDetailType["papers"][number];
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

const TAG_COLORS: Record<string, { dot: string }> = {
  purple: { dot: "bg-[#9333EA]" },
  blue: { dot: "bg-[#0284C7]" },
  green: { dot: "bg-[#10B981]" },
  orange: { dot: "bg-[#EA580C]" },
  red: { dot: "bg-[#EF4444]" },
  pink: { dot: "bg-[#EC4899]" },
};

function getTagColorKey(color: string | null): string {
  const map: Record<string, string> = {
    "#9333EA": "purple",
    "#0284C7": "blue",
    "#10B981": "green",
    "#EA580C": "orange",
    "#EF4444": "red",
    "#EC4899": "pink",
  };
  return (color && map[color]) || "";
}

export default function TaskDetail({
  task,
}: {
  task: TaskDetailType;
}) {
  const [copied, setCopied] = useState(false);
  const colorKey = getTagColorKey(task.color);

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
          title: task.name,
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
          <Link href="/tasks" className="hover:text-[#F55036] transition-colors no-underline">
            Tasks
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium truncate max-w-[200px]">
            {task.name}
          </span>
        </nav>

        <div className="ds-card-hero p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {colorKey && (
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${TAG_COLORS[colorKey]?.dot}`}
                  />
                )}
                <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight">
                  {task.name}
                </h1>
              </div>
              <span className="inline-block ds-chip text-[11px] mb-3">
                {task.slug}
              </span>
              <div className="flex items-center gap-2 text-[14px] text-[#555555]">
                <FileText size={16} className="text-[#8B8B8B]" />
                <span>
                  <strong className="font-semibold text-[#111111]">
                    {task.paperCount}
                  </strong>{" "}
                  {task.paperCount === 1 ? "paper" : "papers"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label="Share this task"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="ds-button-ghost text-[12px] px-3 py-2 flex items-center gap-1.5"
                aria-label={copied ? "Link copied" : "Copy link to this task"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {task.papers.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">
              Papers ({task.paperCount})
            </h2>
            <div className="flex flex-col gap-4">
              {task.papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {task.papers.length === 0 && (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold tracking-tight mb-4">Papers</h2>
            <div className="flex flex-col items-center justify-center py-16 gap-3 ds-card">
              <FileText size={28} className="text-[#8B8B8B]" />
              <p className="text-[14px] text-[#555555]">
                No papers are associated with this task yet.
              </p>
            </div>
          </section>
        )}

        <div className="flex justify-start">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 ds-button-ghost text-[12px] px-4 py-2 no-underline"
          >
            <ArrowLeft size={14} />
            Back to Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}
