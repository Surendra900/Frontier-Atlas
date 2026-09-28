"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Clock, Star } from "lucide-react";
import { PaperCard } from "../../PaperFeed";
import type { Paper as ApiPaper } from "@/lib/paperApi";
import { getArxivAbsUrl, getArxivPdfUrl } from "@/lib/paperApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  task?: { name: string };
}

interface SotaClaim {
  benchmark?: { name: string };
}

interface MethodRelation {
  method?: { name: string };
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
  paperUrl?: string;
  pdfUrl?: string;
  sotaClaims?: SotaClaim[];
  methods?: MethodRelation[];
  tasks?: Task[];
}

interface Props {
  papers: Paper[];
  methodName: string;
}

// ─── Filter chip definitions ──────────────────────────────────────────────────
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

const SORT_OPTIONS: { label: string; key: SortKey; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Popular",   key: "popular",   Icon: TrendingUp },
  { label: "Recent",    key: "recent",    Icon: Clock },
  { label: "Citations", key: "citations", Icon: Star },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function matchesFilter(paper: Paper, key: string, keywords: string[]): boolean {
  if (key === "all") return true;

  const title = (paper.title ?? "").toLowerCase();
  const tasks = Array.isArray(paper.tasks) ? paper.tasks : [];
  const taskNames = tasks.map((t) => (t.task?.name ?? "").toLowerCase()).join(" ");
  const combined = `${title} ${taskNames}`;

  if (key === "evaluation" && Array.isArray(paper.sotaClaims) && paper.sotaClaims.length > 0) {
    return true;
  }

  return keywords.some((kw) => combined.includes(kw.toLowerCase()));
}

function parsePublicationTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

function sortPapers(papers: Paper[], sort: SortKey): Paper[] {
  const copy = [...papers];
  if (sort === "recent") {
    return copy.sort(
      (a, b) => parsePublicationTime(b.publicationDate) - parsePublicationTime(a.publicationDate)
    );
  }
  if (sort === "citations") {
    return copy.sort(
      (a, b) =>
        ((b.citationCount ?? b.githubStars) || 0) -
        ((a.citationCount ?? a.githubStars) || 0)
    );
  }
  return copy.sort((a, b) => (b.githubStars || 0) - (a.githubStars || 0));
}

function formatPublicationDate(dateStr?: string): string {
  if (!dateStr) return "Unknown Date";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MethodFilteredPapers({ papers = [], methodName }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("popular");

  const safePapers = Array.isArray(papers) ? papers : [];

  // Count how many papers match each filter chip
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const chip of FILTER_CHIPS) {
      counts[chip.key] = safePapers.filter((p) =>
        matchesFilter(p, chip.key, chip.keywords)
      ).length;
    }
    return counts;
  }, [safePapers]);

  // Apply active filter then sort
  const displayedPapers = useMemo(() => {
    const activeChip = FILTER_CHIPS.find((c) => c.key === activeFilter) || FILTER_CHIPS[0];
    const filtered = safePapers.filter((p) =>
      matchesFilter(p, activeFilter, activeChip.keywords)
    );
    return sortPapers(filtered, sortBy);
  }, [safePapers, activeFilter, sortBy]);

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

            if (count === 0 && chip.key !== "all") return null;

            return (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
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
            const authorsList = Array.isArray(paper.authors) ? paper.authors : [];
            const tasksList = Array.isArray(paper.tasks) ? paper.tasks : [];
            const methodsList = Array.isArray(paper.methods) ? paper.methods : [];
            const sotaList = Array.isArray(paper.sotaClaims) ? paper.sotaClaims : [];

            const apiPaper: ApiPaper = {
              id: paper.id,
              slug: paper.slug ?? paper.id,
              title: paper.title || "Untitled Paper",
              thumbnail: paper.thumbnailUrl ?? (paper.arxivId ? `https://arxiv.org/html/${paper.arxivId}/thumbnail.png` : ""),
              authors: authorsList.map((a) => ({ name: a.name || "Unknown", slug: "" })),
              date: formatPublicationDate(paper.publicationDate),
              description: paper.abstract || "No abstract available.",
              sota: sotaList.map((sc) => `SOTA on ${sc.benchmark?.name || "Benchmark"}`).join(" • "),
              tags: tasksList.map((t) => t.task?.name ?? "").filter(Boolean),
              additionalTags: methodsList.length > 0 ? methodsList.map((m) => m.method?.name ?? "").filter(Boolean) : [methodName],
              upvotes: String(paper.githubStars || 0),
              repo: String(paper.githubForks || 0),
              citations: paper.citationCount ?? paper.githubStars ?? 0,
              conference: paper.conference ?? "",
              ...(paper.githubUrl ? { githubUrl: paper.githubUrl } : {}),
            } as ApiPaper;

            const arxivAbs = getArxivAbsUrl(paper.arxivId, paper.paperUrl) || (paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : paper.paperUrl);
            const arxivPdf = getArxivPdfUrl(paper.pdfUrl, paper.paperUrl, paper.arxivId) || (paper.arxivId ? `https://arxiv.org/pdf/${paper.arxivId}.pdf` : undefined);

            Object.assign(apiPaper, {
              arxivUrl: arxivAbs,
              pdfUrl: arxivPdf,
            });

            apiPaper.repositories = [];
            if (paper.githubUrl) {
              apiPaper.repositories.push({ url: paper.githubUrl, name: "GitHub", owner: "" });
            }
            if (paper.paperUrl?.includes("huggingface.co") || paper.pdfUrl?.includes("huggingface.co")) {
              apiPaper.repositories.push({ url: paper.paperUrl || paper.pdfUrl || "", name: "HuggingFace", owner: "" });
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
                {FILTER_CHIPS.find((c) => c.key === activeFilter)?.label || "selected"}
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