"use client";
import { useRecentPapers } from '@/lib/useRecentPapers';
import RecentlyViewed from '@/components/RecentlyViewed';
import {
  ExternalLink,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  Github,
  BookOpen,
  Quote,
  Star,
  Bookmark,
  GitBranch,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, type ReactNode } from "react";
import type { PaperDetail as PaperDetailType, PaperRanking, PaperSotaClaim } from "@/lib/papers";
import { getPapers, getArxivAbsUrl, getArxivPdfUrl, resolveHfModelUrl, type Paper } from "@/lib/paperApi";
import { atlasUiFont } from "@/lib/fonts";
import { fetchWithAuthRetry } from "@/lib/auth-client";


function ArxivIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.8423 0a1.0037 1.0037 0 0 0-.922.6078c-.1536.3687-.0438.6275.2938 1.1113l6.9185 8.3597-1.0223 1.1058a1.0393 1.0393 0 0 0 .003 1.4229l1.2292 1.3135-5.4391 6.4444c-.2803.299-.4538.823-.2971 1.1986a1.0253 1.0253 0 0 0 .9585.635.9133.9133 0 0 0 .6891-.3405l5.783-6.126 7.4902 8.0051a.8527.8527 0 0 0 .6835.2597.9575.9575 0 0 0 .8777-.6138c.1577-.377-.017-.7502-.306-1.1407l-7.0518-8.3418 1.0632-1.13a.9626.9626 0 0 0 .0089-1.3165L4.6336.4639s-.3733-.4535-.768-.463zm0 .272h.0166c.2179.0052.4874.2715.5644.3639l.005.006.0052.0055 10.169 10.9905a.6915.6915 0 0 1-.0072.945l-1.0666 1.133-1.4982-1.7724-8.5994-10.39c-.3286-.472-.352-.6183-.2592-.841a.7307.7307 0 0 1 .6704-.4401Zm14.341 1.5701a.877.877 0 0 0-.6554.2418l-5.6962 6.1584 1.6944 1.8319 5.3089-6.5138c.3251-.4335.479-.6603.3247-1.0292a1.1205 1.1205 0 0 0-.9763-.689zm-7.6557 12.2823 1.3186 1.4135-5.7864 6.1295a.6494.6494 0 0 1-.4959.26.7516.7516 0 0 1-.706-.4669c-.1119-.2682.0359-.6864.2442-.9083l.0051-.0055.0047-.0055z" />
    </svg>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getCitationYear(dateStr: string | null): string {
  if (!dateStr) return "n.d.";
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return "n.d.";
  }
}

function formatCompactNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

type CitationFormat = "bibtex" | "apa" | "mla" | "chicago";

const CITATION_FORMATS: { key: CitationFormat; label: string }[] = [
  { key: "bibtex", label: "BibTeX" },
  { key: "apa", label: "APA" },
  { key: "mla", label: "MLA" },
  { key: "chicago", label: "Chicago" },
];

function parseGitHubRepo(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.replace("www.", "") !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // ignore
  }
  return null;
}

function formatExternalUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "N/A") return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

function generateCitation(paper: PaperDetailType, format: CitationFormat): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((pa) => pa.name);
  const authorStr = authors.length > 0 ? authors.join(", ") : "Unknown Author";
  const title = paper.title;
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : null;
  const arxiv = paper.arxivId ? `arXiv:${paper.arxivId}` : null;
  const source = arxiv || "Online";
  const lastName = authors[0]?.split(/\s+/).pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "unknown";
  const citeKey = `${lastName}${year}`;

  switch (format) {
    case "bibtex": {
      const lines = [
        `@article{${citeKey},`,
        `  author = {${authorStr}},`,
        `  title = {${title}},`,
        `  year = {${year}},`,
      ];
      if (paper.arxivId) lines.push(`  eprint = {${paper.arxivId}},`, `  archivePrefix = {arXiv},`);
      if (paper.doi) lines.push(`  doi = {${paper.doi}},`);
      lines.push(`}`);
      return lines.join("\n");
    }
    case "apa":
      return `${authorStr} (${year}). ${title}. ${source}.${doi ? ` https://doi.org/${paper.doi}` : ""}`;
    case "mla":
      return `${authorStr}. "${title}." ${source}, ${year}.${doi ? ` doi:${paper.doi}.` : ""}`;
    case "chicago":
      return `${authorStr}. ${year}. "${title}." ${source}.${doi ? ` https://doi.org/${paper.doi}.` : ""}`;
  }
}

function CitationPreview({ text, format }: { text: string; format: CitationFormat }) {
  if (format !== "bibtex") {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-[11.5px] leading-[1.75] text-[#484037]">
        {text}
      </pre>
    );
  }

  const lines = text.split("\n");
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[11.5px] leading-[1.75]">
      {lines.map((line, index) => {
        const entryMatch = line.match(/^(@\w+\{)([^,]+)(,)?$/);
        const fieldMatch = line.match(/^(\s+)(\w+)(\s*=\s*)(\{.*\}),?$/);

        if (entryMatch) {
          return (
            <span key={index}>
              <span className="text-[#6B21A8]">{entryMatch[1]}</span>
              <span className="text-[#B45309]">{entryMatch[2]}</span>
              <span className="text-[#6B21A8]">{entryMatch[3] ?? ""}</span>
              {"\n"}
            </span>
          );
        }

        if (fieldMatch) {
          return (
            <span key={index}>
              {fieldMatch[1]}
              <span className="text-[#0369A1]">{fieldMatch[2]}</span>
              {fieldMatch[3]}
              <span className="text-[#047857]">{fieldMatch[4]}</span>
              {line.endsWith(",") ? "," : ""}
              {"\n"}
            </span>
          );
        }

        return (
          <span key={index} className="text-[#484037]">
            {line}
            {"\n"}
          </span>
        );
      })}
    </pre>
  );
}

function RepositoryPanel({ paper, resolvedGithubUrl }: { paper: PaperDetailType; resolvedGithubUrl: string | null }) {
  const repoName = parseGitHubRepo(resolvedGithubUrl);
  const hasStars = paper.githubStars != null && paper.githubStars > 0;
  const hasForks = paper.githubForks != null && paper.githubForks > 0;
  if (!resolvedGithubUrl) {
    return (
      <div className="border border-[#EDE8DF] rounded-lg p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E0]">
          <Github size={16} className="text-[#8B8B8B]" />
          <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">Repository</h3>
        </div>
        <div className="pt-5 pb-2 flex flex-col items-center text-center">
          <Github size={26} className="mb-3 text-[#DCDCD7]" strokeWidth={1.5} />
          <p className="text-[14px] font-semibold text-[#171717]">No repository available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#EDE8DF] rounded-lg p-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E0]">
        <Github size={16} className="text-[#8B8B8B]" />
        <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">Repository</h3>
      </div>
      <div className="pt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-2">
            <p className="font-mono text-[16px] font-extrabold text-[#171717] m-0 truncate">
              {repoName ?? "GitHub Repository"}
            </p>
            <div className="flex items-center gap-3">
              {paper.isOfficialCode === true && (
                <span className="inline-flex items-center rounded-full border border-[#BAE6FD] bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0369A1]">
                  Official
                </span>
              )}
              {hasStars && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#444444]">
                  <Star size={14} fill="#FF5A1F" stroke="#FF5A1F" />
                  {formatCompactNumber(paper.githubStars!)}
                </span>
              )}
              {hasForks && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#444444]">
                  <GitBranch size={14} className="text-[#FF5A1F]" />
                  {formatCompactNumber(paper.githubForks!)}
                </span>
              )}
            </div>
          </div>
          <Github size={24} className="shrink-0 text-[#8B8B8B]" />
        </div>

        {resolvedGithubUrl && (
          <>
            <p className="text-[13px] font-medium text-[#6F665D] m-0">
              {paper.isOfficialCode ? "Official implementation from the authors" : "Community-maintained repository"}
            </p>
            <a
              href={resolvedGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#E0DDD6] bg-transparent px-5 py-3 text-[14px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)]"
            >
              Open Repository
              <ExternalLink size={14} />
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function HuggingFacePanel({ paper, hfUrl }: { paper: PaperDetailType; hfUrl: string }) {
  const hfRepos = (paper.repositories || []).filter((r) => r.url?.includes("huggingface.co") && !r.url?.includes("/papers/"));
  const hfRepo = hfRepos[0];
  const repoName = hfRepo?.name || (hfRepo?.owner ? `${hfRepo.owner}/${hfRepo.name}` : null);

  return (
    <div className="border border-[#EDE8DF] rounded-lg p-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.simpleicons.org/huggingface" alt="Hugging Face" className="w-4 h-4" />
        <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">Hugging Face</h3>
      </div>
      <div className="pt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-1.5">
            <p className="font-mono text-[15px] font-extrabold text-[#171717] m-0 truncate">
              {repoName || ((paper as any).models?.[0]?.name ? (paper as any).models[0].name : "Hugging Face Model")}
            </p>
            {paper.hfUpvotes != null && paper.hfUpvotes > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FF5A1F]">
                ▲ {formatCompactNumber(paper.hfUpvotes)} upvotes
              </span>
            )}
          </div>
        </div>

        <a
          href={hfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#E0DDD6] bg-transparent px-5 py-3 text-[14px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)]"
        >
          View on Hugging Face
          <ExternalLink size={14} />
        </a>

        <div className="mt-2 flex flex-col gap-3 border-t border-[#E5E5E0] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono text-[#8B8B8B]">Models</span>
            <span className="text-[13px] font-bold font-mono text-[#171717]">{hfRepos.length}</span>
          </div>
          {hfRepos.length > 0 && (
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {hfRepos.map((repo, idx) => {
                const displayName = repo.name ? (repo.owner ? `${repo.owner}/${repo.name}` : repo.name) : repo.url;
                return (
                  <li key={idx} className="truncate">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#4A7AA0] hover:underline hover:text-[#0369A1] font-medium block truncate transition-colors"
                      title={displayName}
                    >
                      {displayName}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CitationPanel({
  paper,
  selectedFormat,
  onFormatChange,
  onCopy,
  copiedFormat,
}: {
  paper: PaperDetailType;
  selectedFormat: CitationFormat;
  onFormatChange: (format: CitationFormat) => void;
  onCopy: (format: CitationFormat) => void;
  copiedFormat: CitationFormat | null;
}) {
  const citationText = generateCitation(paper, selectedFormat);
  const isCopied = copiedFormat === selectedFormat;

  return (
    <div>
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5E5E0]">
        <Quote size={14} className="text-[#8B8B8B]" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">Citation</h3>
      </div>
      <div className="pt-4 flex flex-col gap-3.5">
        <div className="flex rounded-lg border border-[#E0DDD6] bg-[#F6F5F0] p-[3px]">
          {CITATION_FORMATS.map((fmt) => {
            const active = selectedFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                type="button"
                onClick={() => onFormatChange(fmt.key)}
                className={`flex-1 rounded-[5px] px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.06em] transition-all ${active
                  ? "bg-white text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "bg-transparent text-[#8B8B8B] hover:text-[#555555]"
                  }`}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#EDE8DF] p-3.5">
          <CitationPreview text={citationText} format={selectedFormat} />
        </div>

        <button
          type="button"
          onClick={() => onCopy(selectedFormat)}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-all ${isCopied
            ? "scale-[0.98] border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"
            : "border-[#E0DDD6] bg-transparent text-[#444444] hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)]"
            }`}
        >
          {isCopied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy citation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PaperMetadataPanel({
  paper,
  arxivUrl,
  doiUrl,
}: {
  paper: PaperDetailType;
  arxivUrl: string | null;
  doiUrl: string | null;
}) {
  const categoryLabels = (paper.tasks || []).map((t) => t.name);
  const conferenceLabels = (paper.conferences || []).map((c) => c.name);

  const rows: { label: string; value: ReactNode }[] = [];

  if (paper.publicationDate) rows.push({ label: "Published", value: formatDate(paper.publicationDate) });
  if (paper.updatedAt) rows.push({ label: "Updated", value: formatDateTime(paper.updatedAt) });
  if (paper.doi) {
    rows.push({
      label: "DOI",
      value: doiUrl ? (
        <a href={doiUrl} target="_blank" rel="noopener noreferrer" className="text-[#4A7AA0] no-underline hover:underline text-[13px] font-medium">
          {paper.doi}
        </a>
      ) : (
        <span className="text-[13px] font-medium text-[#171717]">{paper.doi}</span>
      ),
    });
  }
  if (paper.arxivId) {
    rows.push({
      label: "arXiv",
      value: arxivUrl ? (
        <a href={arxivUrl} target="_blank" rel="noopener noreferrer" className="text-[#4A7AA0] no-underline hover:underline text-[13px] font-medium">
          {paper.arxivId}
        </a>
      ) : (
        <span className="text-[13px] font-medium text-[#171717]">{paper.arxivId}</span>
      ),
    });
  }
  if (paper.license) rows.push({ label: "License", value: <span className="text-[13px] font-medium text-[#171717]">{paper.license}</span> });
  if (paper.discoverySource) rows.push({ label: "Source", value: <span className="text-[13px] font-medium text-[#171717]">{paper.discoverySource}</span> });
  if (paper.referenceCount > 0) rows.push({ label: "References", value: <span className="text-[13px] font-medium text-[#171717]">{formatCompactNumber(paper.referenceCount)}</span> });
  if (paper.citationCount > 0) rows.push({ label: "Citations", value: <span className="text-[13px] font-medium text-[#171717]">{formatCompactNumber(paper.citationCount)}</span> });
  if (categoryLabels.length > 0) rows.push({ label: "Categories", value: <span className="text-[13px] font-medium text-[#171717]">{categoryLabels.join(", ")}</span> });
  if (conferenceLabels.length > 0) rows.push({ label: "Venue", value: <span className="text-[13px] font-medium text-[#171717]">{conferenceLabels.join(", ")}</span> });
  if (paper.submissionDate && paper.submissionDate !== paper.publicationDate) {
    rows.push({ label: "Submitted", value: formatDate(paper.submissionDate) });
  }
  if (paper.paperType) rows.push({ label: "Type", value: <span className="text-[13px] font-medium text-[#171717]">{paper.paperType}</span> });
  if (paper.status) rows.push({ label: "Status", value: <span className="text-[13px] font-medium text-[#171717]">{paper.status}</span> });
  if (paper.language) rows.push({ label: "Language", value: <span className="text-[13px] font-medium text-[#171717]">{paper.language}</span> });
  if (paper.pageCount != null) rows.push({ label: "Pages", value: <span className="text-[13px] font-medium text-[#171717]">{paper.pageCount}</span> });

  if (rows.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5E5E0]">
        <BookOpen size={14} className="text-[#8B8B8B]" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">Paper Details</h3>
      </div>
      <div className="pt-1">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-4 py-3 ${i < rows.length - 1 ? "border-b border-[#F2EEE6]" : ""}`}
          >
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8B8B8B]">{row.label}</span>
            <div className="text-right break-words max-w-[60%]">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankDisplay({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="tabular-nums tracking-tight font-black text-[#171717]">#{rank}</span>
    </div>
  );
}

function BenchmarksSection({
  rankings,
  models,
  sotaClaims,
}: {
  rankings: PaperRanking[];
  models: PaperDetailType["models"];
  sotaClaims: PaperSotaClaim[];
}) {
  const sotaBenchmarkIds = new Set(sotaClaims.map((claim) => claim.benchmark_id));
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
  const modelName = models[0]?.name ?? null;
  const showRankDelta = sortedRankings.some((ranking) => ranking.previous_rank != null);
  const desktopGridClass = showRankDelta
    ? "grid grid-cols-[80px_minmax(0,1.3fr)_minmax(160px,1fr)_84px_104px] items-center"
    : "grid grid-cols-[80px_minmax(0,1.3fr)_minmax(160px,1fr)_104px] items-center";
  const desktopCellClass = "px-5 py-4";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="section-label">BENCHMARKS</h2>

      {sortedRankings.length > 0 || sotaClaims.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="w-full text-left">
              <div className={`${desktopGridClass} border-b border-[#E5E5E0]`}>
                <div className={`${desktopCellClass} min-w-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]`}>Rank</div>
                <div className={`${desktopCellClass} min-w-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]`}>Benchmark</div>
                <div className={`${desktopCellClass} min-w-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]`}>Model</div>
                {showRankDelta && (
                  <div className={`${desktopCellClass} min-w-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]`}>Change</div>
                )}
                <div className={`${desktopCellClass} flex justify-end text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]`}>Compare</div>
              </div>

              {sortedRankings.map((ranking) => {
                const isSota = sotaBenchmarkIds.has(ranking.benchmark_id);
                return (
                  <div
                    key={ranking.id}
                    className={`${desktopGridClass} border-b border-[#F2EEE6] transition-colors hover:bg-[rgba(255,90,31,0.02)]`}
                  >
                    <div className={desktopCellClass}>
                      <RankDisplay rank={ranking.rank} />
                    </div>
                    <div className={`${desktopCellClass} min-w-0`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/benchmarks/${ranking.benchmark.slug}`}
                          className="text-[14px] font-semibold text-[#171717] hover:text-[#F55036] transition-colors"
                        >
                          {ranking.benchmark.name}
                        </Link>
                        {isSota && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#F0DECF] bg-[#FFF9F4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#B48C52]">
                            SOTA
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`${desktopCellClass} min-w-0`}>
                      <span className="text-[14px] font-medium text-[#555555]">{modelName ?? "—"}</span>
                    </div>
                    {showRankDelta && (
                      <div className={desktopCellClass}>
                        {ranking.previous_rank != null && ranking.previous_rank !== ranking.rank && (
                          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums ${ranking.rank < ranking.previous_rank ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF2F2] text-[#B91C1C]"}`}>
                            {ranking.rank < ranking.previous_rank ? "↑" : "↓"}{Math.abs(ranking.previous_rank - ranking.rank)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className={`${desktopCellClass} flex justify-end`}>
                      <Link
                        href={`/benchmarks/${ranking.benchmark.slug}`}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4A7AA0] hover:text-[#F55036] transition-colors"
                      >
                        Compare →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {sortedRankings.map((ranking) => {
              const isSota = sotaBenchmarkIds.has(ranking.benchmark_id);
              const improved = ranking.previous_rank != null && ranking.rank < ranking.previous_rank;
              const worsened = ranking.previous_rank != null && ranking.rank > ranking.previous_rank;
              return (
                <div key={ranking.id} className="py-3 border-b border-[#EDE8DF]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[18px] font-black text-[#FF5A1F]">#{ranking.rank}</span>
                    </div>
                    {isSota && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#F0DECF] bg-[#FFF9F4] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#B48C52]">
                        SOTA
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/benchmarks/${ranking.benchmark.slug}`}
                    className="text-[14px] font-semibold text-[#171717] hover:text-[#F55036] transition-colors block mb-1"
                  >
                    {ranking.benchmark.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#8B8B8B]">{modelName ?? "—"}</span>
                    {improved && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                        ↑{Math.abs(ranking.previous_rank! - ranking.rank)}
                      </span>
                    )}
                    {worsened && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C]">
                        ↓{Math.abs(ranking.previous_rank! - ranking.rank)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : sotaClaims.length > 0 ? (
        <div className="space-y-3">
          {sotaClaims.map((claim) => (
            <div key={claim.id} className="flex items-center gap-3 rounded-xl border border-[#F0DECF] bg-[#FFF9F4] px-4 py-3.5">
              <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">SOTA</span>
              <div className="min-w-0">
                <Link
                  href={`/benchmarks/${claim.benchmark.slug}`}
                  className="text-[14px] font-semibold text-[#171717] hover:text-[#F55036] transition-colors"
                >
                  {claim.benchmark.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-[13px] text-[#999] italic">Not available</span>
      )}
    </div>
  );
}

export function RelatedPaperCard({ paper }: { paper: Paper }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const showThumbnail = !!paper.thumbnail && !thumbnailFailed;

  const displayAuthors = (() => {
    if (!Array.isArray(paper.authors) || paper.authors.length === 0) return "";
    const names = paper.authors.map((a) => a.name);
    if (names.length > 2) return `${names.slice(0, 2).join(", ")} et al.`;
    return names.join(", ");
  })();

  const hasCode = !!(paper.githubUrl || paper.repositories?.find((r: any) => r.url?.includes("github.com"))?.url);
  const hasConference = !!paper.conference && paper.conference !== "";

  return (
    <Link
      href={`/papers/${paper.slug || paper.id}`}
      className="group flex flex-col border border-[#EDE8DF] bg-white no-underline overflow-hidden transition-all hover:border-[rgba(255,90,31,0.25)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="w-full aspect-[3/2] bg-[#F3F1EC] overflow-hidden flex items-center justify-center relative">
        {showThumbnail ? (
          <Image
            src={paper.thumbnail}
            alt={`Preview of ${paper.title}`}
            width={320}
            height={213}
            unoptimized
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <div className="w-full p-5 flex flex-col gap-2">
            <div className="h-[3px] rounded bg-black/5 w-2/5" />
            <div className="h-[5px] rounded bg-black/6 w-full" />
            <div className="h-[5px] rounded bg-black/6 w-4/5" />
            <div className="h-[3px] rounded bg-black/4 w-3/5 mt-1" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 p-3.5 flex flex-col gap-2">
        <h4 className="text-[13px] font-semibold leading-[1.4] text-[#171717] m-0 line-clamp-2 transition-colors group-hover:text-[#FF5A1F]">
          {paper.title}
        </h4>
        <p className="text-[11px] text-[#8B8B8B] m-0 truncate leading-snug">
          {displayAuthors || "Unknown"}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
          {hasConference && (
            <span className="px-1.5 py-[2px] rounded-[3px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[9px] font-bold uppercase leading-tight">
              {paper.conference}
            </span>
          )}
          {hasCode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[3px] bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[9px] font-bold leading-tight">
              Code
            </span>
          )}
          {paper.citations > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-[#8B8B8B]">
              <Quote size={10} className="text-[#C0BDB8]" />
              {formatCompactNumber(paper.citations)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function PaperDetail({ paper }: { paper: PaperDetailType }) {
  const [citationCopied, setCitationCopied] = useState<CitationFormat | null>(null);
  const [selectedCitationFormat, setSelectedCitationFormat] = useState<CitationFormat>("bibtex");

  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [deferred, setDeferred] = useState(false);
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

  // 1. Check if the paper is saved when the page loads
  useEffect(() => {
    async function checkSavedStatus() {
      try {
        const res = await fetchWithAuthRetry(`${API_BASE}/api/v1/research-papers/check-saved?paper_id=${paper.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.isSaved);
        }
      } catch (err) {
        console.error("Failed to check save status:", err);
      }
    }
    if (paper?.id) checkSavedStatus();
  }, [paper?.id, API_BASE]);

  // 2. Handle clicking the save button with visual toggle feedback
  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuthRetry(`${API_BASE}/api/v1/research-papers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paper.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved); // Toggles true/false from backend
      } else if (response.status === 401) {
        const currentUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?redirect=${currentUrl}`);
      } else {
        console.error("Server error while saving, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const arxivUrl = getArxivAbsUrl(paper.arxivId, paper.paperUrl) || (paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : null);
  const pdfUrl = getArxivPdfUrl(paper.pdfUrl, paper.paperUrl, paper.arxivId);
  const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;
  const { addRecentPaper } = useRecentPapers();

  useEffect(() => {
    if (paper) {
      addRecentPaper(paper);
    }
  }, [paper, addRecentPaper]);

  const huggingFaceRepo = paper.repositories?.find(
    (repo: any) => repo.url?.includes("huggingface.co") && !repo.url?.includes("/papers/")
  );
  const githubRepo = paper.repositories?.find(
    (repo: any) => repo.url?.includes("github.com")
  );
  const resolvedGithubUrl = paper.githubUrl || githubRepo?.url || null;

  // HF button must strictly link to the model page, NOT the paper page.
  // If no model URL is available, gracefully omit HF link.
  const candidateHfUrl =
    paper.hf_model_url ||
    paper.hfUrl ||
    paper.huggingface_url ||
    huggingFaceRepo?.url ||
    (paper.paperUrl?.includes("huggingface.co") && !paper.paperUrl.includes("/papers/") ? paper.paperUrl : null) ||
    (paper.sourceUrl?.includes("huggingface.co") && !paper.sourceUrl.includes("/papers/") ? paper.sourceUrl : null);
  const hfResolvedUrl = (candidateHfUrl && !candidateHfUrl.includes("/papers/")) ? candidateHfUrl : resolveHfModelUrl(paper);
  const rawProjectPageUrl = formatExternalUrl(paper.projectUrl);
  const projectPageUrl = rawProjectPageUrl && !rawProjectPageUrl.includes("huggingface.co") ? rawProjectPageUrl : null;
  const previewHref =
    pdfUrl || arxivUrl || paper.paperUrl || doiUrl || paper.sourceUrl || projectPageUrl || hfResolvedUrl;

  const handleShare = useCallback(async () => {
    let copied = false;
    if (navigator.share) {
      try {
        await navigator.share({ title: paper.title, url: window.location.href });
        return;
      } catch {
        // user dismissed or share failed — fall through to clipboard
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        copied = true;
      }
    } catch {
      // fallback for environments without clipboard permissions
    }
    if (!copied) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        copied = true;
      } catch {
        // ignore
      }
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  }, [paper.title]);

  const handleCopyCitation = useCallback(
    async (format: CitationFormat) => {
      const text = generateCitation(paper, format);
      try {
        await navigator.clipboard.writeText(text);
        setCitationCopied(format);
        setTimeout(() => setCitationCopied(null), 2000);
      } catch {
        // ignore
      }
    },
    [paper]
  );

  useEffect(() => {
    async function loadRelated() {
      const taskSlugs = [...new Set((paper.tasks || []).map((t) => t.slug))];
      const methodSlugs = [...new Set((paper.methods || []).map((m) => m.slug))];
      const modelSlugs = [...new Set((paper.models || []).map((m) => m.slug))];

      if (taskSlugs.length === 0 && methodSlugs.length === 0 && modelSlugs.length === 0) {
        setRelatedLoading(false);
        return;
      }

      const allSlugs = [...taskSlugs, ...methodSlugs, ...modelSlugs];
      const allTypes = [
        ...taskSlugs.map(() => "task" as const),
        ...methodSlugs.map(() => "method" as const),
        ...modelSlugs.map(() => "model" as const),
      ];

      const seen = new Set<string>();
      const slugs: string[] = [];
      const types: ("task" | "method" | "model")[] = [];
      for (let i = 0; i < allSlugs.length && slugs.length < 5; i++) {
        if (!seen.has(allSlugs[i])) {
          seen.add(allSlugs[i]);
          slugs.push(allSlugs[i]);
          types.push(allTypes[i]);
        }
      }

      try {
        const results = await Promise.all(
          slugs.map((slug, i) =>
            getPapers({ page: 1, [types[i]]: slug, limit: 5 })
          )
        );

        const score = new Map<string, { paper: Paper; count: number }>();
        const currentId = String(paper.id);

        for (const result of results) {
          for (const p of result.papers) {
            const id = String(p.id);
            if (id === currentId) continue;
            const existing = score.get(id);
            if (existing) {
              existing.count++;
            } else {
              score.set(id, { paper: p, count: 1 });
            }
          }
        }

        setRelatedPapers(
          [...score.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 4)
            .map(([, v]) => v.paper)
        );
      } catch {
        // ignore
      }

      setRelatedLoading(false);
    }

    loadRelated();
  }, [paper.id, paper.tasks, paper.methods, paper.models]);

  // Defer non-critical sections until after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setDeferred(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`${atlasUiFont.className} min-h-screen bg-[#F8F7F2] text-[#171717] tracking-tight selection:bg-[rgba(255,90,31,0.16)]`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12pt; color: #000; background: #fff; }
          a { color: #000 !important; text-decoration: underline !important; }
        }
        .section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #171717;
          margin: 0;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E5E5E0;
        }
        .hover-dim { transition: opacity 0.2s ease; }
        .hover-dim:hover { opacity: 0.7; }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: rgba(255,90,31,0.02); }
      `}</style>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 md:px-12 lg:px-16 lg:py-6">

        {/* Breadcrumb */}
        <nav
          className="mb-5 lg:mb-6 flex items-center gap-2 text-[12.5px] font-semibold text-[#8B8B8B]"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="transition-colors hover:text-[#FF5A1F] no-underline text-[#8B8B8B]"
          >
            Home
          </Link>
          {paper.arxivId && (
            <>
              <span className="text-[#DCDCD7] font-normal" aria-hidden="true">/</span>
              <span className="text-[#555555]">arXiv: {paper.arxivId}</span>
            </>
          )}
        </nav>
        {/* Grid: Main + Sidebar */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px] xl:gap-10">

          {/* ===== MAIN CONTENT ===== */}
          <main className="space-y-8 lg:space-y-10 min-w-0 order-1">

            {/* HEADER */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">

                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-3">

                  {(paper.conferences || []).slice(0, 2).map((c) => (
                    <span key={c.id} className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[11px] font-bold uppercase tracking-wide">
                      {c.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-[26px] font-black leading-[1.1] tracking-[-0.03em] text-[#171717] md:text-[34px] lg:text-[38px]">
                  {paper.title}
                </h1>
                {/* Authors */}
                <div className="flex items-center flex-wrap">
                  <div className="flex flex-wrap items-center">
                    {(paper.authors || [])
                      .slice(0, showAllAuthors ? paper.authors.length : 3)
                      .map((pa, i, arr) => (
                        <span key={pa.id || i} className="inline-flex items-center">
                          <Link
                            href={`/authors/${pa.slug || pa.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            className="text-[14px] font-semibold text-[#444444] hover:text-[#F55036] hover:underline cursor-pointer no-underline"
                          >
                            {pa.name}
                          </Link>

                          {i < arr.length - 1 && (
                            <span className="ml-0.5 mr-1 text-[#171717] font-bold">,</span>
                          )}
                        </span>
                      ))}
                    {(paper.authors || []).length > 3 && (
                      <span className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowAllAuthors(!showAllAuthors)}
                          className="ml-1 text-[13px] font-semibold text-[#4A7AA0] hover:text-[#2c4e69] hover:underline"
                        >
                          {showAllAuthors ? "Show less" : `+${paper.authors.length - 3} more`}
                        </button>
                      </span>
                    )}
                  </div>
                  {paper.publicationDate && (
                    <div className="flex items-center gap-1.5 text-[14px] text-[#666]">
                      <span className="text-[#B0B0B0]">•</span>
                      <span>
                        {new Date(paper.publicationDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {(pdfUrl || arxivUrl) && (
                    <a
                      href={pdfUrl || arxivUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-button inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A1F] px-6 py-2.5 text-[14px] font-semibold text-white no-underline transition-all hover:bg-[#FF6C37] active:scale-[0.97]"
                    >
                      <FileText size={18} />
                      View PDF
                    </a>
                  )}
                  {arxivUrl && (
                    <a
                      href={arxivUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                    >
                      <ArxivIcon size={18} />
                      arXiv
                    </a>
                  )}
                  {resolvedGithubUrl && (
                    <a
                      href={resolvedGithubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                    >
                      <Github size={18} />
                      Code
                      {paper.githubStars != null && paper.githubStars > 0 && (
                        <span className="text-[#8B8B8B] font-bold">{formatCompactNumber(paper.githubStars)}</span>
                      )}
                    </a>
                  )}
                  {hfResolvedUrl && (
                    <a
                      href={hfResolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://cdn.simpleicons.org/huggingface" alt="Hugging Face" className="w-[16px] h-[16px]" />
                      Hugging Face
                      {paper.hfUpvotes != null && paper.hfUpvotes > 0 && (
                        <span className="text-[#8B8B8B] font-bold">{formatCompactNumber(paper.hfUpvotes)}</span>
                      )}
                    </a>
                  )}
                  {projectPageUrl && (
                    <a
                      href={projectPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                    >
                      <ExternalLink size={18} />
                      Project Page
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("citation-panel");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          const copyBtn = el.querySelector("button");
                          copyBtn?.focus();
                        }
                      }}
                      className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                    >
                      <Quote size={16} />
                      Cite
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="ds-button-ghost !p-0 w-11 h-11 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent inline-flex items-center justify-center transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
                      title="Share paper"
                    >
                      <Share2 size={18} />
                    </button>
                  <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="ds-button-ghost inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97] disabled:opacity-50"
                >
                  <Bookmark 
                    size={18} 
                    className={isSaved ? "fill-[#FF5A1F] text-[#FF5A1F]" : ""} 
                  />
                  {isSaved ? "Saved" : "Save"}
                </button>

                  </div>
                </div>

                {/* Benchmark Highlights */}
                {paper.rankings && paper.rankings.length > 0 && (
                  <div className="flex flex-col gap-2 pt-3 border-l-[3px] border-[rgba(255,90,31,0.15)] pl-4">
                    {paper.rankings.slice(0, 3).map((ranking) => (
                      <div key={ranking.id} className="flex items-center gap-2 text-[13.5px] font-semibold text-[#171717]">
                        <span className="text-[#FF5A1F]">#{ranking.rank}</span>
                        <span className="text-[#8B8B8B] font-medium">on</span>
                        <Link
                          href={`/benchmarks/${ranking.benchmark.slug}`}
                          className="hover:text-[#FF5A1F] transition-colors cursor-pointer border-b border-transparent hover:border-[rgba(255,90,31,0.3)]"
                        >
                          {ranking.benchmark.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="block w-full lg:w-[220px] shrink-0">
                <a
                  href={previewHref || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block overflow-hidden transition-all duration-300 group ${!previewHref ? 'pointer-events-none' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: '3/4', background: '#EFECE6', transition: 'transform 0.4s ease' }}
                  >
                    {paper.thumbnailUrl ? (
                      <Image
                        src={paper.thumbnailUrl}
                        alt={`Preview of ${paper.title}`}
                        width={220}
                        height={293}
                        unoptimized
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="preview-page flex flex-col h-full p-5 pb-3.5">
                        <div className="h-[3px] rounded mb-3 bg-black/5 w-2/5" />
                        <div className="h-[6px] rounded mb-1.5 bg-black/7 w-[85%]" />
                        <div className="h-[6px] rounded mb-1.5 bg-black/7 w-[60%]" />
                        <div className="mt-2.5 space-y-1.5">
                          <div className="h-1 rounded bg-black/5 w-[92%]" />
                          <div className="h-1 rounded bg-black/5 w-[78%]" />
                          <div className="h-1 rounded bg-black/5 w-[92%]" />
                          <div className="h-1 rounded bg-black/5 w-[60%]" />
                        </div>
                        <div className="mt-auto pt-2.5 flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-black/5" />
                          <div className="h-1 w-[60px] rounded bg-black/5" />
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              </div>
            </div>

            {/* TL;DR */}
            {paper.tlDr && (
              <div className="border-l-[3px] border-[rgba(255,90,31,0.15)] pl-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[12px] font-black uppercase tracking-[0.15em] text-[#171717]">TL;DR</span>
                </div>
                <p className="text-[15px] font-medium leading-[1.8] text-[#333333] m-0">
                  {paper.tlDr}
                </p>
              </div>
            )}

            {/* ===== MAIN CONTENT SECTIONS ===== */}
            <div className="flex flex-col gap-8">

              {/* ABSTRACT */}
              {paper.abstract && (
                <div className="flex flex-col gap-3">
                  <h2 className="section-label">ABSTRACT</h2>
                  <p className="text-[15px] leading-7 text-[#444]">
                    {paper.abstract}
                  </p>
                </div>
              )}

              {/* RESEARCH TAXONOMY */}
              <h2 className="section-label">RESEARCH TAXONOMY</h2>

              {/* TASKS */}
              <section className="flex flex-col gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8B8B8B] m-0">TASKS</h3>
                {(paper.tasks || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(paper.tasks || []).map((t) => (
                      <Link
                        key={t.id}
                        href={`/tasks/${t.slug}`}
                        className="inline-flex items-center gap-1 rounded-[4px] border border-[#D4EDDA] bg-[#F1F9F2] px-2 py-0.5 text-[12.5px] font-medium text-[#2D6A4F] no-underline hover:opacity-80 transition-opacity"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#2D6A4F] opacity-50" />
                        {t.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#999] italic">Not available</span>
                )}
              </section>

              {/* METHODS */}
              <section className="flex flex-col gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8B8B8B] m-0">METHODS</h3>
                {(paper.methods || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(paper.methods || []).map((m) => (
                      <Link
                        key={m.id}
                        href={`/methods/${m.slug}`}
                        className="inline-flex items-center gap-1 rounded-[4px] border border-[#E2D5F0] bg-[#F5F0FA] px-2 py-0.5 text-[12.5px] font-medium text-[#5B3A8C] no-underline hover:opacity-80 transition-opacity"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#5B3A8C] opacity-50" />
                        {m.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#999] italic">Not available</span>
                )}
              </section>

              {/* MODELS */}
              <section className="flex flex-col gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8B8B8B] m-0">MODELS</h3>
                {(paper.models || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(paper.models || []).map((m, i) => (
  <Link
    key={m.id || m.slug || i}
                        href={`/models/${m.slug}`}
                        className="inline-flex items-center gap-1 rounded-[4px] border border-[#FDE4C8] bg-[#FFF8F0] px-2 py-0.5 text-[12.5px] font-medium text-[#A45C00] no-underline hover:opacity-80 transition-opacity"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#A45C00] opacity-50" />
                        {m.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#999] italic">Not available</span>
                )}
              </section>

              {/* DATASETS */}
              <section className="flex flex-col gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#8B8B8B] m-0">DATASETS</h3>
                {paper.datasets.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {paper.datasets.map((d) => (
                      <Link
                        key={d.id}
                        href={`/datasets/${d.slug}`}
                        className="inline-flex items-center gap-1 rounded-[4px] border border-[#D0E6F2] bg-[#EDF5FA] px-2 py-0.5 text-[12.5px] font-medium text-[#2C617D] no-underline hover:opacity-80 transition-opacity"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#2C617D] opacity-50" />
                        {d.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-[13px] text-[#999] italic">Not available</span>
                )}
              </section>

              {/* Benchmarks */}
              {deferred ? (
                <BenchmarksSection
                  rankings={paper.rankings}
                  models={paper.models}
                  sotaClaims={paper.sotaClaims}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="h-[14px] w-32 bg-[#E4E0D8] rounded animate-pulse" />
                  <div className="border border-[#EDE8DF] rounded-lg overflow-hidden">
                    <div className="bg-[#EFECE6] p-3">
                      <div className="h-3 w-36 bg-[#E4E0D8] rounded animate-pulse" />
                    </div>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-6 p-3 border-t border-[#EDE8DF]">
                        <div className="h-[15px] w-14 bg-[#E4E0D8] rounded animate-pulse shrink-0" />
                        <div className="h-[15px] w-44 bg-[#E4E0D8] rounded animate-pulse" />
                        <div className="h-[15px] w-20 bg-[#E4E0D8] rounded animate-pulse ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Discussions & Insights */}
              <section className="flex flex-col gap-3 pt-6 border-t border-[#ECE7DD]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#F55036]" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-[#171717] m-0">
                      Community Discussions & Research Notes
                    </h3>
                  </div>
                  <Link
                    href="/discussions"
                    className="text-xs font-semibold text-[#F55036] hover:underline inline-flex items-center gap-1"
                  >
                    Browse All Discussions <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="border border-[#EDE8DF] bg-white rounded-xl p-5 shadow-2xs">
                  <p className="text-xs leading-relaxed text-[#666]">
                    Join the conversation about <strong>{paper.title}</strong> across developer communities.
                    Share experimental results, reproduction notes, or questions with the AI research ecosystem.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <a
                      href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(
                        pdfUrl || arxivUrl || (typeof window !== "undefined" ? window.location.href : "")
                      )}&t=${encodeURIComponent(paper.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF6600]/10 text-[#D05500] hover:bg-[#FF6600]/20 text-xs font-bold transition-colors no-underline"
                    >
                      🔥 Share on Hacker News <ArrowUpRight size={13} />
                    </a>
                    {resolvedGithubUrl && (
                      <a
                        href={`${resolvedGithubUrl}/discussions`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-bold transition-colors no-underline"
                      >
                        <Github size={13} /> GitHub Discussions <ArrowUpRight size={13} />
                      </a>
                    )}
                    <Link
                      href="/discussions"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F2] text-[#444] hover:border-[#F55036] hover:text-[#F55036] text-xs font-semibold transition-colors no-underline"
                    >
                      Browse Trending Discussions <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* ===== SIDEBAR ===== */}
          {/* On mobile (below xl): order-2 so it appears after main content but before related papers */}
          {/* On desktop (xl+): stays in the right column via grid placement */}
          {deferred ? (
            <aside className="space-y-5 xl:sticky xl:top-6 self-start order-2 xl:row-span-2">
              <RepositoryPanel paper={paper} resolvedGithubUrl={resolvedGithubUrl} />
              {hfResolvedUrl && <HuggingFacePanel paper={paper} hfUrl={hfResolvedUrl} />}
              <div id="citation-panel">
                <CitationPanel
                  paper={paper}
                  selectedFormat={selectedCitationFormat}
                  onFormatChange={setSelectedCitationFormat}
                  onCopy={handleCopyCitation}
                  copiedFormat={citationCopied}
                />
              </div>
              <PaperMetadataPanel paper={paper} arxivUrl={arxivUrl} doiUrl={doiUrl} />
            </aside>
          ) : (
            <aside className="space-y-5 xl:sticky xl:top-6 self-start order-2 xl:row-span-2">
              <div className="border border-[#EDE8DF] rounded-lg bg-white p-4 space-y-3">
                <div className="h-[14px] w-28 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-[#E4E0D8] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[#E4E0D8] rounded w-[65%] animate-pulse" />
                </div>
                <div className="h-10 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
                <div className="h-3 bg-[#E4E0D8] rounded w-[55%] animate-pulse" />
              </div>
              <div className="border border-[#EDE8DF] rounded-lg bg-white p-4 space-y-3">
                <div className="h-[14px] w-20 bg-[#E4E0D8] rounded animate-pulse" />
                <div className="h-8 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
                <div className="h-8 w-full bg-[#E4E0D8] rounded-lg animate-pulse" />
                <div className="h-3 w-1/2 bg-[#E4E0D8] rounded animate-pulse" />
              </div>
              <div className="border border-[#EDE8DF] rounded-lg bg-white divide-y divide-[#EDE8DF]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="h-3 w-16 bg-[#E4E0D8] rounded animate-pulse" />
                    <div className="h-3 w-24 bg-[#E4E0D8] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </aside>
          )}

          {/* ===== RELATED PAPERS + FOOTER (after sidebar on mobile) ===== */}
          <div className="order-3 xl:col-start-1 space-y-8 lg:space-y-10">
            {/* RELATED PAPERS */}
            <section className="border-t border-[#ECE7DD] pt-6">
              <h2 className="section-label mb-3.5">RELATED PAPERS</h2>
              {relatedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col border border-[#EDE8DF] bg-white overflow-hidden animate-pulse">
                      <div className="w-full aspect-[3/2] bg-[#EFECE6]" />
                      <div className="p-3.5 space-y-2">
                        <div className="h-3 bg-[#E8E5DD] rounded w-full" />
                        <div className="h-3 bg-[#E8E5DD] rounded w-3/4" />
                        <div className="h-2.5 bg-[#E8E5DD] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : relatedPapers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {relatedPapers.map((relatedPaper) => (
                    <RelatedPaperCard key={relatedPaper.slug || relatedPaper.id} paper={relatedPaper} />
                  ))}
                </div>
              ) : !relatedLoading ? (
                <span className="text-[13px] text-[#999] italic">Not available</span>
              ) : null}
            </section>

            <RecentlyViewed />

            {/* Back link */}
            <Link
              href="/"
              className="hover-dim inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#8B8B8B] no-underline border-t border-[#E5E5E0] pt-3.5 transition-colors hover:text-[#FF5A1F]"
            >
              <ArrowLeft size={13} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#171717] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 border border-[#333]">
          <Check size={16} className="text-[#34D399]" />
          <span>Paper link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
