"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock, Star } from "lucide-react";
import { PaperCard } from "../../PaperFeed";
import type { Paper as ApiPaper } from "@/lib/paperApi";
import { getArxivAbsUrl, getArxivPdfUrl } from "@/lib/paperApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  task?: { name: string; };
}

interface Paper {
  id: string;
  title: string;
  slug?: string;
  authors?: { name: string }[];
  abstract?: string;
  publicationDate?: string;
  conference?: string;
  githubStars?: number;
  githubForks?: number;
  citationCount?: number;
  thumbnailUrl?: string;
  arxivId?: string;
  githubUrl?: string;
  tasks?: Task[];
}

interface Props {
  papers: Paper[];
  methodName: string;
}

// ─── Filter chip definitions ──────────────────────────────────────────────────
// Filters search the paper's title + abstract for these keywords.
// tasks[] is not returned per-paper by the API, so we use text matching.
const FILTER_CHIPS: { label: string; key: string; keywords: string[] }[] = [
  { label: "All",          key: "all",          keywords: [] },
  { label: "Architecture", key: "architecture", keywords: ["architecture", "transformer", "encoder", "decoder", "network", "layer"] },
  { label: "Optimization", key: "optimization", keywords: ["optim", "gradient", "adam", "sgd", "learning rate", "scheduler", "loss"] },
  { label: "Training",     key: "training",     keywords: ["train", "fine-tun", "pre-train", "finetun", "lora", "rlhf", "peft"] },
  { label: "Attention",    key: "attention",    keywords: ["attention", "self-attention", "multi-head", "cross-attention"] },
  { label: "Generation",   key: "generation",   keywords: ["generat", "language model", "llm", "gpt", "autoregressive", "diffusion"] },
  { label: "Evaluation",   key: "evaluation",   keywords: ["benchmark", "evaluat", "metric", "dataset", "performance"] },
];

type SortKey = "popular" | "recent" | "citations";

const SORT_OPTIONS: { label: string; key: SortKey; Icon: React.ComponentType<any> }[] = [
  { label: "Popular",   key: "popular",   Icon: TrendingUp },
  { label: "Recent",    key: "recent",    Icon: Clock },
  { label: "Citations", key: "citations", Icon: Star },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function matchesFilter(paper: Paper, key: string, keywords: string[]): boolean {
  if (key === "all") return true;
  
  // Strictly check the title and official task tags, completely ignoring the abstract
  // to prevent massive false-positives from generic words like "performance" or "language model".
  const title = (paper.title ?? "").toLowerCase();
  const taskNames = paper.tasks?.map((t) => (t.task?.name ?? '').toLowerCase()).join(" ") ?? "";
  const combined = `${title} ${taskNames}`;
  
  // For 'evaluation', also strictly check if it has sotaClaims, as that implies evaluation/benchmarking
  if (key === "evaluation" && (paper as any).sotaClaims?.length > 0) return true;

  return keywords.some((kw) => combined.includes(kw.toLowerCase()));
}

function sortPapers(papers: Paper[], sort: SortKey): Paper[] {
  const copy = [...papers];
  if (sort === "recent") {
    return copy.sort(
      (a, b) =>
        new Date(b.publicationDate ?? 0).getTime() -
        new Date(a.publicationDate ?? 0).getTime()
    );
  }
  if (sort === "citations") {
    return copy.sort(
      (a, b) =>
        (b.citationCount ?? b.githubStars ?? 0) -
        (a.citationCount ?? a.githubStars ?? 0)
    );
  }
  return copy.sort((a, b) => (b.githubStars ?? 0) - (a.githubStars ?? 0));
}

// ─── Thumbnail placeholder — deterministic color from paper title ─────────────
const PLACEHOLDER_COLORS = [
  ["#fff5f2", "#ff4d20"],
  ["#eff6ff", "#2563eb"],
  ["#f0fdf4", "#16a34a"],
  ["#faf5ff", "#7c3aed"],
  ["#fff7ed", "#ea580c"],
  ["#ecfeff", "#0891b2"],
  ["#fdf4ff", "#a21caf"],
];

function PaperThumbnail({ paper }: { paper: Paper }) {
  // Try arxiv thumbnail first
  const arxivThumb = paper.arxivId
    ? `https://arxiv.org/html/${paper.arxivId}/thumbnail.png`
    : null;

  const [imgFailed, setImgFailed] = useState(false);

  // Deterministic color pick from first char of title
  const colorIdx = (paper.title?.charCodeAt(0) ?? 0) % PLACEHOLDER_COLORS.length;
  const [bg, fg] = PLACEHOLDER_COLORS[colorIdx];

  // Initials from title words
  const initials = (paper.title ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  // Determine the year
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : "";

  if ((paper.thumbnailUrl || arxivThumb) && !imgFailed) {
    return (
      <Image
        src={paper.thumbnailUrl ?? arxivThumb!}
        alt={paper.title}
        width={96}
        height={128}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  }

  // Beautiful generated placeholder
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1 select-none"
      style={{ background: bg }}
    >
      {/* Decorative lines simulating a paper */}
      <div className="w-full px-2 space-y-1 mb-1">
        <div className="h-1 rounded-full opacity-30" style={{ background: fg, width: "85%" }} />
        <div className="h-1 rounded-full opacity-20" style={{ background: fg, width: "70%" }} />
        <div className="h-1 rounded-full opacity-20" style={{ background: fg, width: "60%" }} />
      </div>
      {/* Initials badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm"
        style={{ background: fg, color: "#fff" }}
      >
        {initials || "?"}
      </div>
      {year && (
        <span className="text-[9px] font-bold mt-1" style={{ color: fg, opacity: 0.7 }}>
          {year}
        </span>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MethodFilteredPapers({ papers, methodName }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("popular");

  // Count how many papers match each filter chip
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const chip of FILTER_CHIPS) {
      counts[chip.key] = papers.filter((p) =>
        matchesFilter(p, chip.key, chip.keywords)
      ).length;
    }
    return counts;
  }, [papers]);

  // Apply active filter then sort
  const displayedPapers = useMemo(() => {
    const activeChip = FILTER_CHIPS.find((c) => c.key === activeFilter)!;
    const filtered = papers.filter((p) =>
      matchesFilter(p, activeFilter, activeChip.keywords)
    );
    return sortPapers(filtered, sortBy);
  }, [papers, activeFilter, sortBy]);

  return (
    <>
      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <section className="mb-6 lg:mb-8 bg-white border border-gray-100 lg:rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] -mx-5 px-5 lg:mx-0 lg:px-5 py-4">

        {/* Row 1: Label + Chips (wrap on mobile) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 mr-1">
            Filter
          </span>
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.key;
            const count = chipCounts[chip.key] ?? 0;

            // Hide the chip if it has 0 results (unless it's the 'all' chip)
            if (count === 0 && chip.key !== "all") return null;

            return (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150
                  ${
                    isActive
                      ? "bg-[#ff4d20] text-white border-[#ff4d20] shadow-sm"
                      : "border-gray-200 text-gray-600 bg-white hover:border-orange-300 hover:text-orange-600"
                  }`}
              >
                {chip.label}
                {chip.key !== "all" && (
                  <span
                    className={`text-[10px] font-bold min-w-[16px] text-center ${
                      isActive ? "opacity-80" : "opacity-60"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: Sort toggle buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 mr-1">
            Sort
          </span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {SORT_OPTIONS.map(({ label, key, Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150
                  ${
                    sortBy === key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500 hover:text-slate-700"
                  }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── Paper List ─────────────────────────────────────────────────── */}
      <div className="space-y-4 pb-20">
        {displayedPapers.length > 0 ? (
          displayedPapers.map((paper) => {
            const apiPaper: ApiPaper = {
              id: paper.id,
              slug: paper.slug ?? paper.id,
              title: paper.title,
              thumbnail: paper.thumbnailUrl ?? (paper.arxivId ? `https://arxiv.org/html/${paper.arxivId}/thumbnail.png` : ""),
              authors: (paper.authors || []).map(a => ({ name: a.name, slug: '' })),
              date: paper.publicationDate ? new Date(paper.publicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown Date",
              description: paper.abstract || "No abstract available.",
              sota: Array.isArray((paper as any).sotaClaims) ? (paper as any).sotaClaims.map((sc: any) => `SOTA on ${sc.benchmark?.name}`).join(" • ") : "",
              tags: (paper.tasks || []).map((t: any) => t.task?.name ?? ''),
              additionalTags: (paper as any).methods ? (paper as any).methods.map((m: any) => m.method?.name ?? '') : [methodName],
              upvotes: String(paper.githubStars || 0),
              repo: String(paper.githubForks || 0),
              citations: paper.citationCount ?? paper.githubStars ?? 0,
              conference: paper.conference ?? "",
              // Additional properties expected by PaperCard
              ...(paper.githubUrl ? { githubUrl: paper.githubUrl } : {}),
              ...((paper as any).hf_model_url ? { hf_model_url: (paper as any).hf_model_url } : {}),
            } as ApiPaper;

            // PaperCard reads these from (paper as any)
            (apiPaper as any).arxivUrl = getArxivAbsUrl(paper.arxivId, (paper as any).paperUrl) || (paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : (paper as any).paperUrl);
            (apiPaper as any).pdfUrl = getArxivPdfUrl((paper as any).pdfUrl, (paper as any).paperUrl, paper.arxivId) || (paper.arxivId ? `https://arxiv.org/pdf/${paper.arxivId}.pdf` : undefined);
            
            apiPaper.repositories = [];
            if (paper.githubUrl) {
              apiPaper.repositories.push({ url: paper.githubUrl, name: "GitHub", owner: "" });
            }
            const hfCandidate = (paper as any).paperUrl || (paper as any).pdfUrl;
            if (hfCandidate?.includes('huggingface.co') && !hfCandidate.includes('/papers/')) {
              apiPaper.repositories.push({ url: hfCandidate, name: "HuggingFace", owner: "" });
            }

            return (
              <div key={paper.id} className="mb-4">
                <PaperCard paper={apiPaper} />
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-base font-bold text-slate-700 mb-2">No papers found</h3>
            <p className="text-sm text-gray-400 mb-6">
              No papers match the{" "}
              <span className="font-semibold text-orange-600">
                {FILTER_CHIPS.find((c) => c.key === activeFilter)?.label}
              </span>{" "}
              filter.
            </p>
            <button
              onClick={() => setActiveFilter("all")}
              className="px-5 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-sm font-semibold hover:bg-orange-100 transition-colors"
            >
              Clear filter — show all papers
            </button>
          </div>
        )}
      </div>
    </>
  );
}
