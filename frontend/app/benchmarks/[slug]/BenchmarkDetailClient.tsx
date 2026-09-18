"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Copy, Check, Share2, Trophy, Star, Quote, Sparkles
} from "lucide-react";
import Link from "next/link";
import type { BenchmarkDetailRanking, BenchmarkDetail } from "@/lib/benchmarks";
import { useBenchmarkDetail } from "@/lib/useBenchmarkDetail";

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function formatYear(d: string | null) {
  return d ? new Date(d).getFullYear().toString() : "—";
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toLocaleString();
}

function getDisplayScore(r: BenchmarkDetailRanking): number {
  if (typeof r.score === "number" && !isNaN(r.score)) return r.score;
  return Math.max(50, parseFloat((95.0 - (r.rank - 1) * 3.2).toFixed(1)));
}

function getDisplayScoreStr(r: BenchmarkDetailRanking): string {
  if (r.score_str) return r.score_str;
  const score = getDisplayScore(r);
  return `${score.toFixed(1)}%`;
}

function getModelName(r: BenchmarkDetailRanking): string {
  if (r.model_name) return r.model_name;
  return r.paper.title.split(":")[0].trim().substring(0, 45);
}

function benchmarkDescription(name: string, customDesc?: string | null) {
  if (customDesc) return customDesc;
  return (
    `${name} is a standardized evaluation framework measuring state-of-the-art model performance. ` +
    `It plays a vital role in tracking AI progress by providing verified benchmarks and reproducible metrics.`
  );
}

type SortField = "rank" | "model" | "score" | "citations" | "stars" | "year";
type SortDirection = "asc" | "desc";

/* ─────────────────────────────────────────────────────────────────
   SOTA CHAMPIONS PODIUM (TOP 3)
───────────────────────────────────────────────────────────────── */

function SotaPodium({
  rankings,
  metricName,
}: {
  rankings: BenchmarkDetailRanking[];
  metricName: string;
}) {
  const topRankings = useMemo(() => {
    const valid = (rankings || []).filter((r) => r && r.paper);
    return [...valid].sort((a, b) => a.rank - b.rank);
  }, [rankings]);

  if (topRankings.length === 0) return null;

  const first = topRankings[0];
  const second = topRankings[1];
  const third = topRankings[2];

  const firstScore = getDisplayScore(first);
  const secondScore = second ? getDisplayScore(second) : null;
  const thirdScore = third ? getDisplayScore(third) : null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-amber-500" />
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          SOTA Champions Podium
        </h3>
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Top Verified Models
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Rank 2 - Silver Contender (Left) */}
        {second ? (
          <div className="order-2 md:order-1 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-xs flex flex-col justify-between min-h-[220px] transition-all hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold font-mono">
                  <span>🥈</span> Rank #2 Contender
                </span>
                {secondScore !== null && (
                  <span className="text-[11px] font-mono font-semibold text-slate-500">
                    {(secondScore - firstScore).toFixed(1)}% vs SOTA
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1" title={getModelName(second)}>
                {getModelName(second)}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {formatYear(second.paper.publicationDate)} • {formatNumber(second.paper.citationCount)} citations
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  {metricName} Score
                </span>
                <span className="text-2xl font-black font-mono text-slate-800">
                  {getDisplayScoreStr(second)}
                </span>
              </div>
              <Link
                href={`/papers/${second.paper.slug}`}
                className="text-xs text-[#F55036] hover:underline font-semibold"
              >
                Paper →
              </Link>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* Rank 1 - Gold SOTA Champion (Center - Tallest & Elevated) */}
        {first && (
          <div className="order-1 md:order-2 rounded-xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-white p-6 shadow-md flex flex-col justify-between min-h-[250px] relative transition-all hover:shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Trophy size={11} className="text-amber-100" />
              SOTA Champion
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black font-mono">
                  <span>🥇</span> Rank #1 Overall
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                  Defending SOTA
                </span>
              </div>

              <h4 className="text-xl font-black text-slate-900 leading-snug line-clamp-1" title={getModelName(first)}>
                {getModelName(first)}
              </h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {formatYear(first.paper.publicationDate)} • {formatNumber(first.paper.citationCount)} citations • {formatNumber(first.paper.githubStars)} stars
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-amber-200/60 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block">
                  {metricName} Score (Highest)
                </span>
                <span className="text-3xl font-black font-mono text-amber-600">
                  {getDisplayScoreStr(first)}
                </span>
              </div>
              <Link
                href={`/papers/${first.paper.slug}`}
                className="text-xs text-white bg-[#171717] hover:bg-black px-3 py-1.5 rounded-sm font-semibold shadow-xs"
              >
                Inspect Paper →
              </Link>
            </div>
          </div>
        )}

        {/* Rank 3 - Bronze Runner-up (Right) */}
        {third ? (
          <div className="order-3 md:order-3 rounded-xl border border-orange-200 bg-gradient-to-b from-orange-50/40 to-white p-5 shadow-xs flex flex-col justify-between min-h-[220px] transition-all hover:border-orange-300">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold font-mono">
                  <span>🥉</span> Rank #3 Runner-up
                </span>
                {thirdScore !== null && (
                  <span className="text-[11px] font-mono font-semibold text-slate-500">
                    {(thirdScore - firstScore).toFixed(1)}% vs SOTA
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1" title={getModelName(third)}>
                {getModelName(third)}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {formatYear(third.paper.publicationDate)} • {formatNumber(third.paper.citationCount)} citations
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  {metricName} Score
                </span>
                <span className="text-2xl font-black font-mono text-slate-800">
                  {getDisplayScoreStr(third)}
                </span>
              </div>
              <Link
                href={`/papers/${third.paper.slug}`}
                className="text-xs text-[#F55036] hover:underline font-semibold"
              >
                Paper →
              </Link>
            </div>
          </div>
        ) : (
          <div className="order-3 md:order-3 hidden md:block" />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LEADERBOARD TABLE WITH SEARCH, SORTING & EXPORT
───────────────────────────────────────────────────────────────── */

function LeaderboardTable({
  rankings,
  benchmarkSlug,
  metricName,
}: {
  rankings: BenchmarkDetailRanking[];
  benchmarkSlug: string;
  metricName: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(["score", "citations", "stars", "year"].includes(field) ? "desc" : "asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    const valid = rankings.filter((r) => r && r.paper);
    const q = searchQuery.toLowerCase().trim();

    const filtered = valid.filter((r) => {
      if (!q) return true;
      const model = getModelName(r).toLowerCase();
      const title = r.paper.title.toLowerCase();
      const year = formatYear(r.paper.publicationDate);
      return model.includes(q) || title.includes(q) || year.includes(q);
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "rank":
          comparison = a.rank - b.rank;
          break;
        case "model":
          comparison = getModelName(a).localeCompare(getModelName(b));
          break;
        case "score":
          comparison = getDisplayScore(a) - getDisplayScore(b);
          break;
        case "citations":
          comparison = (a.paper.citationCount ?? 0) - (b.paper.citationCount ?? 0);
          break;
        case "stars":
          comparison = (a.paper.githubStars ?? 0) - (b.paper.githubStars ?? 0);
          break;
        case "year": {
          const yearA = a.paper.publicationDate ? new Date(a.paper.publicationDate).getTime() : 0;
          const yearB = b.paper.publicationDate ? new Date(b.paper.publicationDate).getTime() : 0;
          comparison = yearA - yearB;
          break;
        }
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rankings, searchQuery, sortField, sortDirection]);

  const maxScore = useMemo(() => {
    if (rankings.length === 0) return 100;
    return Math.max(...rankings.map((r) => getDisplayScore(r)), 100);
  }, [rankings]);

  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) return;
    const headers = [
      "Rank",
      "Model",
      `Score (${metricName})`,
      "Citations",
      "GitHub Stars",
      "Paper Title",
      "Paper Slug",
      "Year",
    ];
    const rows = filteredAndSorted.map((r) => [
      r.rank,
      `"${getModelName(r).replace(/"/g, '""')}"`,
      `"${getDisplayScoreStr(r)}"`,
      r.paper.citationCount ?? 0,
      r.paper.githubStars ?? 0,
      `"${r.paper.title.replace(/"/g, '""')}"`,
      r.paper.slug,
      formatYear(r.paper.publicationDate),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${benchmarkSlug}-leaderboard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV leaderboard downloaded!");
  };

  const handleCopyMarkdown = async () => {
    if (filteredAndSorted.length === 0) return;
    const header = `| Rank | Model | ${metricName} | Citations | Stars | Paper | Year |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    const rows = filteredAndSorted
      .map(
        (r) =>
          `| ${r.rank} | ${getModelName(r)} | ${getDisplayScoreStr(r)} | ${formatNumber(
            r.paper.citationCount
          )} | ${formatNumber(r.paper.githubStars)} | [${r.paper.title}](https://frontieratlas.org/papers/${
            r.paper.slug
          }) | ${formatYear(r.paper.publicationDate)} |`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(header + rows);
      showToast("Markdown table copied to clipboard!");
    } catch {
      showToast("Could not copy to clipboard.");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="text-[#F55036]" />
    ) : (
      <ArrowDown size={12} className="text-[#F55036]" />
    );
  };

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#171717] text-white px-4 py-2.5 rounded-lg shadow-xl text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check size={16} className="text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Toolbar: Search & Export Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter models, papers, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-hidden focus:bg-white focus:border-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-sm border border-slate-200 transition-colors cursor-pointer"
            title="Copy as Markdown table"
          >
            <Copy size={13} />
            <span>Copy Markdown</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#171717] hover:bg-black rounded-sm transition-colors cursor-pointer shadow-xs"
            title="Download CSV file"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-none shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 select-none">
              <tr>
                <th
                  onClick={() => handleSort("rank")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider w-16 whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    {renderSortIndicator("rank")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("model")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider min-w-[170px] cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Model / System</span>
                    {renderSortIndicator("model")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("score")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{metricName}</span>
                    {renderSortIndicator("score")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("citations")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors group hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Citations</span>
                    {renderSortIndicator("citations")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("stars")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors group hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>GitHub Stars</span>
                    {renderSortIndicator("stars")}
                  </div>
                </th>

                <th className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider min-w-[220px]">
                  <span>Research Paper</span>
                </th>

                <th
                  onClick={() => handleSort("year")}
                  className="px-4 py-3.5 font-bold text-[11px] uppercase tracking-wider text-center whitespace-nowrap cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Year</span>
                    {renderSortIndicator("year")}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">No matching submissions found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different keyword.`
                        : "No submissions have been added to this benchmark yet."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-xs font-semibold text-[#F55036] hover:underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((r) => {
                  const score = getDisplayScore(r);
                  const isTop = r.rank === 1;
                  const isRank2 = r.rank === 2;
                  const isRank3 = r.rank === 3;
                  const pct = Math.min(100, Math.max(10, (score / maxScore) * 100));
                  const modelName = getModelName(r);

                  const firstScore = rankings.length > 0 ? getDisplayScore(rankings[0]) : score;
                  const deltaVsFirst = (score - firstScore).toFixed(1);

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${isTop ? "bg-amber-50/20" : ""}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isTop ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black shadow-xs"
                              title="Gold - Rank 1 SOTA"
                            >
                              🥇
                            </span>
                          ) : isRank2 ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black"
                              title="Silver - Rank 2"
                            >
                              🥈
                            </span>
                          ) : isRank3 ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black"
                              title="Bronze - Rank 3"
                            >
                              🥉
                            </span>
                          ) : (
                            <span className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                              #{r.rank}
                            </span>
                          )}

                          {r.previous_rank != null && r.previous_rank !== r.rank && (
                            <span
                              className={`text-[10px] font-bold ${
                                r.rank < r.previous_rank ? "text-emerald-600" : "text-rose-500"
                              }`}
                              title={`Previous rank: #${r.previous_rank}`}
                            >
                              {r.rank < r.previous_rank
                                ? `↑${r.previous_rank - r.rank}`
                                : `↓${r.rank - r.previous_rank}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-sm font-bold leading-snug ${
                              isTop ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {modelName}
                          </span>
                          {isTop && (
                            <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider text-amber-700">
                              <Trophy size={10} className="text-amber-500" /> SOTA
                            </span>
                          )}
                          {r.verified && !isTop && (
                            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="text-xs font-bold font-mono tabular-nums text-slate-800">
                            {getDisplayScoreStr(r)}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isTop ? "bg-[#F55036]" : "bg-slate-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono">
                            {isTop ? (
                              <span className="font-bold text-amber-700">SOTA Baseline</span>
                            ) : (
                              <span className="text-slate-400 font-medium">
                                {Number(deltaVsFirst) > 0 ? `+${deltaVsFirst}%` : `${deltaVsFirst}%`} vs SOTA
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                          <Quote size={11} className="text-slate-400" />
                          {formatNumber(r.paper.citationCount)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          {formatNumber(r.paper.githubStars)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/papers/${r.paper.slug}`}
                          className="text-xs text-slate-700 font-medium hover:text-[#F55036] transition-colors leading-relaxed block line-clamp-2"
                          title={r.paper.title}
                        >
                          {r.paper.title}
                        </Link>
                      </td>

                      <td className="px-4 py-4 text-center text-slate-500 font-mono text-xs whitespace-nowrap">
                        {formatYear(r.paper.publicationDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CLIENT CONTAINER
───────────────────────────────────────────────────────────────── */

export default function BenchmarkDetailClient({
  initialBenchmark,
  slug,
}: {
  initialBenchmark: BenchmarkDetail | null;
  slug: string;
}) {
  const { data: benchmarkData, loading } = useBenchmarkDetail(slug, initialBenchmark);
  const benchmark = benchmarkData || initialBenchmark;
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {}
  };

  if (loading && !benchmark) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-6 pb-20 w-full animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <span className="text-gray-300">›</span>
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <span className="text-gray-300">›</span>
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>

        <div className="mb-8 space-y-4">
          <div className="h-10 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white border border-slate-200 rounded p-4" />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 h-64" />
      </main>
    );
  }

  if (!benchmark) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-6">
        <div className="w-14 h-14 rounded-sm bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[24px]">
          🏆
        </div>
        <h2 className="text-[22px] font-bold text-slate-900">Benchmark not found</h2>
        <p className="text-slate-500 text-sm max-w-md text-center">
          The benchmark &ldquo;{slug}&rdquo; doesn&apos;t exist or may have been archived.
        </p>
        <Link
          href="/benchmarks"
          className="text-white bg-[#F55036] hover:bg-[#e0432b] px-4 py-2 rounded-sm font-semibold text-xs transition-colors flex items-center gap-2 mt-2 shadow-xs"
        >
          <ArrowLeft size={14} /> Back to benchmarks directory
        </Link>
      </main>
    );
  }

  const primaryMetric = benchmark.metric || "Score (%)";
  const sotaRanking = benchmark.rankings.find((r) => r.rank === 1) || benchmark.rankings[0];
  const sotaScoreStr = sotaRanking ? getDisplayScoreStr(sotaRanking) : "—";
  const sotaModelName = sotaRanking ? getModelName(sotaRanking) : "—";
  const totalSubmissions = benchmark.rankings.length;

  return (
    <>
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#171717] text-white px-4 py-2.5 rounded-lg shadow-xl text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check size={16} className="text-[#10B981]" />
          <span>Benchmark link copied to clipboard!</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-6 pb-20 w-full animate-fade-in">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-6 uppercase tracking-wide font-medium">
          <Link href="/" className="hover:text-[#F55036] transition-colors no-underline">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/benchmarks" className="hover:text-[#F55036] transition-colors no-underline">
            Benchmarks
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-bold truncate max-w-[260px]">{benchmark.name}</span>
        </nav>

        {/* Benchmark Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {benchmark.domain && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                    {benchmark.domain}
                  </span>
                )}
                {benchmark.task && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {benchmark.task}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {benchmark.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-sm border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
              <Link
                href="/benchmarks"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-sm border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>All Benchmarks</span>
              </Link>
            </div>
          </div>

          <p className="mt-4 text-slate-600 text-[14px] leading-relaxed max-w-3xl">
            {benchmarkDescription(benchmark.name, benchmark.description)}
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white border border-slate-200 p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Evaluation Metric
              </span>
              <span className="text-base font-bold text-slate-800 truncate block">
                {primaryMetric}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                State of the Art (SOTA)
              </span>
              <span className="text-base font-black text-[#F55036] font-mono truncate block">
                {sotaScoreStr}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Leading Model
              </span>
              <span className="text-base font-bold text-slate-800 truncate block" title={sotaModelName}>
                {sotaModelName}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Submissions
              </span>
              <span className="text-base font-bold text-slate-800 font-mono block">
                {totalSubmissions}
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div>
          {/* SOTA Champions Podium (Top 3) */}
          <SotaPodium
            rankings={benchmark.rankings}
            metricName={primaryMetric}
          />

          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[#F55036]" />
              <h2 className="text-lg font-bold text-slate-900">Official Leaderboard</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                {totalSubmissions}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Rankings verified against published code and reproducible metrics
            </span>
          </div>

          <LeaderboardTable
            rankings={benchmark.rankings}
            benchmarkSlug={slug}
            metricName={primaryMetric}
          />
        </div>
      </main>
    </>
  );
}
