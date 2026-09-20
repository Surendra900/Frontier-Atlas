"use client";
import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  Profiler,
  Fragment,
} from "react";
import {
  ArrowUpRight,
  ArrowUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getPapers,
  getPapersSync,
  getArxivAbsUrl,
  getArxivPdfUrl,
  resolveHfModelUrl,
  type GetPapersParams,
  type GetPapersResult,
  type Paper,
} from "@/lib/paperApi";
import { prefetchPaperBySlug } from "@/lib/papers";
import { prefetchBenchmarkDetail } from "@/lib/benchmarks";
import { getTaxonomyHref } from "@/lib/taxonomy";
 
// --- Performance Logger ---
const logRender = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
) => {
  if (process.env.NODE_ENV !== "development") return;
  console.group(`[Profiler] ${id} (${phase})`);
  console.log(`- Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`- Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`- Start time: ${startTime.toFixed(2)}ms`);
  console.log(`- Commit time: ${commitTime.toFixed(2)}ms`);
  console.groupEnd();
};
 
/* ─── Tag color map ──────────────────────────────────────────────────────── */
const TAG_COLORS: Record<
  string,
  { bg: string; text: string; dot: string; border?: string }
> = {
  purple: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#6B21A8]",
    dot: "bg-[#9333EA]",
    border: "border border-[#D8B4FE]",
  },
  blue: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    dot: "bg-[#0284C7]",
    border: "border border-[#BAE6FD]",
  },
  green: {
    bg: "bg-[#ECFDF5]",
    text: "text-[#047857]",
    dot: "bg-[#10B981]",
    border: "border border-[#A7F3D0]",
  },
  cyan: {
    bg: "bg-[#CFFAFE]",
    text: "text-[#0E7490]",
    dot: "bg-[#06B6D4]",
    border: "border border-[#CFFAFE]",
  },
  gray: {
    bg: "bg-white",
    text: "text-[#111111]",
    dot: "",
    border: "border border-[#E5E5E0]",
  },
};
 
const getTagColor = (label: string): string => {
  const map: Record<string, string> = {
    "Reinforcement Learning": "blue",
    "Image Understanding": "blue",
    Agents: "green",
    "Long Context": "purple",
    Robotics: "cyan",
    "World Models": "purple",
  };
  if (map[label]) return map[label];
 
  const colors = ["purple", "blue", "green", "cyan"];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
 
/* ─── Pill tag ───────────────────────────────────────────────────────────── */
const Pill = memo(
  ({
    label,
    colorKey,
    defaultType = "task",
  }: {
    label: string;
    colorKey: string;
    defaultType?: "task" | "method" | "model" | "dataset" | "benchmark" | "author";
  }) => {
    const router = useRouter();
    const c = TAG_COLORS[colorKey] || TAG_COLORS.gray;
    const isGray = colorKey === "gray";
    const href = getTaxonomyHref(label, defaultType);
 
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(href);
    };
 
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        router.push(href);
      }
    };
 
    return (
      <span
        role="link"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`group h-[24px] inline-flex items-center px-2.5 rounded-[4px] text-[11px] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:brightness-[0.96] hover:shadow-sm active:scale-95 select-none ${c.bg} ${c.text} ${c.border || ""} whitespace-nowrap`}
      >
        {!isGray && (
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${c.dot}`}
          />
        )}
        {label}
      </span>
    );
  },
);
Pill.displayName = "Pill";
 
/* ─── SOTA Display ───────────────────────────────────────────────────────── */
const SotaDisplay = memo(({ sota }: { sota: string }) => {
  const router = useRouter();
  if (!sota) return null;
  const segments = sota.split(" • ");
 
  return (
    <div className="mb-[10px] text-[11px] tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 w-full">
      {segments.map((segment, idx) => {
        const isSota = segment.startsWith("SOTA on ");
        const isOn = segment.includes(" on ");
 
        let prefix = "";
        let benchmarks = segment;
 
        if (isSota) {
          benchmarks = segment.replace("SOTA on ", "");
        } else if (isOn) {
          const parts = segment.split(" on ");
          prefix = parts[0];
          benchmarks = parts[1];
        }
 
        const benchmarkList = benchmarks.split(",").map((b) => b.trim()).filter(Boolean);
 
        return (
          <span key={idx} className="inline-flex items-center">
            {idx > 0 && (
              <span className="text-[#9CA3AF] mx-1.5 font-normal">•</span>
            )}
 
            {isSota ? (
              <>
                <span className="text-[#B48C52] font-semibold mr-1 tracking-wide">
                  SOTA
                </span>
                <span className="mr-1 text-[10px]">🏆</span>
                <span className="text-[#8B8B8B] mr-1 font-normal">on</span>
                {benchmarkList.map((bName, bIdx) => {
                  const href = getTaxonomyHref(bName, "benchmark");
                  const bSlug = href.replace("/benchmarks/", "");
                  const handlePrefetch = () => {
                    if (bSlug) {
                      router.prefetch(href);
                      prefetchBenchmarkDetail(bSlug);
                    }
                  };
                  return (
                    <span key={bIdx}>
                      {bIdx > 0 && <span className="text-[#8B8B8B] mr-1">, </span>}
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePrefetch();
                          router.push(href);
                        }}
                        onMouseEnter={handlePrefetch}
                        onTouchStart={handlePrefetch}
                        onFocus={handlePrefetch}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrefetch();
                            router.push(href);
                          }
                        }}
                        className="text-[#1E40AF] text-[11.5px] tracking-tighter hover:underline cursor-pointer"
                      >
                        {bName}
                      </span>
                    </span>
                  );
                })}
              </>
            ) : isOn ? (
              <>
                <span className="text-[#8B8B8B] font-normal mr-1">
                  {prefix}
                </span>
                <span className="text-[#8B8B8B] font-normal mr-1">on</span>
                {benchmarkList.map((bName, bIdx) => {
                  const href = getTaxonomyHref(bName, "benchmark");
                  return (
                    <span key={bIdx}>
                      {bIdx > 0 && <span className="text-[#8B8B8B] mr-1">, </span>}
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(href);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(href);
                          }
                        }}
                        className="text-[#1E40AF] text-[11.5px] tracking-tighter hover:underline cursor-pointer"
                      >
                        {bName}
                      </span>
                    </span>
                  );
                })}
              </>
            ) : (
              <span className="text-[#8B8B8B] font-normal tracking-tight">
                {segment}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
});
SotaDisplay.displayName = "SotaDisplay";
 
/* ─── Thumbnail ──────────────────────────────────────────────────────────── */
// Deterministic color palette from title string
function getTitleColors(title: string): {
  bg1: string;
  bg2: string;
  accent: string;
} {
  const palettes = [
    { bg1: "#1a1a2e", bg2: "#16213e", accent: "#e94560" },
    { bg1: "#0f3460", bg2: "#533483", accent: "#e94560" },
    { bg1: "#1b262c", bg2: "#0f3460", accent: "#00b4d8" },
    { bg1: "#2d132c", bg2: "#ee4540", accent: "#c72c41" },
    { bg1: "#1a1a2e", bg2: "#2e4057", accent: "#048a81" },
    { bg1: "#212121", bg2: "#37474f", accent: "#ff6f00" },
    { bg1: "#1b1b2f", bg2: "#162447", accent: "#1f4068" },
    { bg1: "#2c003e", bg2: "#1a0533", accent: "#870160" },
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++)
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}
 
function GeneratedCover({ title }: { title: string }) {
  const { bg1, bg2, accent } = getTitleColors(title);
  const words = (title || "Untitled").split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 20 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else cur = (cur + " " + w).trim();
    if (lines.length === 3) break;
  }
  if (cur && lines.length < 3) lines.push(cur.trim());
  const displayLines = lines.slice(0, 3);
 
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 250" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="0" y="0" width="100%" height="4" fill="${accent}"/>
      <circle cx="160" cy="50" r="55" fill="${accent}" fill-opacity="0.07"/>
      <circle cx="30" cy="210" r="40" fill="${accent}" fill-opacity="0.06"/>
      <rect x="12" y="16" width="42" height="14" rx="3" fill="${accent}" fill-opacity="0.9"/>
      <text x="33" y="27" font-family="monospace" font-size="8" fill="white" text-anchor="middle">arXiv</text>
      ${displayLines.map((line, i) => `<text x="12" y="${115 + i * 20}" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="white" fill-opacity="0.95">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}</text>`).join("")}
      <rect x="12" y="247" width="30" height="3" rx="1.5" fill="${accent}"/>
    </svg>
  `;
 
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
 
  return (
    <div className="absolute inset-0 bg-[#3A3F45]">
      <img
        src={dataUrl}
        alt={`Cover for ${title}`}
        className="w-full h-full object-cover block"
      />
    </div>
  );
}
 
const isValidImageSrc = (src: string) => {
  if (!src || src === "null" || src === "None") return false;
  if (src.startsWith('/')) return true;
  if (src.startsWith('data:image/')) return true;
  try {
    new URL(src);
    return true;
  } catch {
    return false;
  }
};
 
const PaperThumbnail = memo(
  ({ title, thumbnail, slug, arxivId }: { title: string; thumbnail?: string; slug?: string; arxivId?: string }) => {
    const [srcIndex, setSrcIndex] = useState(0);

    const cleanArxiv = useMemo(() => {
      if (!arxivId) return null;
      const match = arxivId.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)([a-z\-]+(?:\.[a-z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i);
      const rawId = match && match[1] ? match[1].replace(/\.pdf$/i, "") : arxivId.replace(/^arxiv:/i, "");
      return rawId.replace(/v\d+$/i, "");
    }, [arxivId]);

    const candidates = useMemo(() => {
      const list: string[] = [];
      if (isValidImageSrc(thumbnail || "")) list.push(thumbnail!);
      if (slug) list.push(`/thumbnails/${slug}.jpg`);
      if (cleanArxiv) list.push(`https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${cleanArxiv}.png`);
      return list;
    }, [thumbnail, slug, cleanArxiv]);

    const currentSrc = candidates[srcIndex];
    const isExternal = currentSrc && currentSrc.startsWith("http");
    const imageSource = isExternal ? `/api/proxy-image?url=${encodeURIComponent(currentSrc)}` : currentSrc;

    const handleImgError = () => {
      if (srcIndex + 1 < candidates.length) {
        setSrcIndex(prev => prev + 1);
      } else {
        setSrcIndex(candidates.length);
      }
    };

    const showImg = currentSrc && srcIndex < candidates.length;

    return (
      <div className="w-[150px] sm:w-[180px] xl:w-[200px] aspect-[4/5] xl:aspect-auto xl:h-full shrink-0 bg-white border border-[#E5E5E0] shadow-sm relative mx-auto xl:mx-0 overflow-hidden">
        {showImg ? (
          <img
            key={imageSource}
            src={imageSource}
            alt={title || "Paper thumbnail"}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-300 group-hover/thumb:scale-[1.03]"
            onError={handleImgError}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover/thumb:scale-[1.03]">
            <GeneratedCover title={title} />
          </div>
        )}
      </div>
    );
  },
);
PaperThumbnail.displayName = "PaperThumbnail";
 
/* ─── Metric block ───────────────────────────────────────────────────────── */
const Metric = memo(
  ({
    value,
    label,
    children,
    onClick,
    interactive = false,
  }: {
    value: string;
    label: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    interactive?: boolean;
  }) => {
    const isInteractive = interactive || !!onClick;
    return (
      <div
        className={`flex items-center gap-2.5 group/metric px-3 py-1.5 rounded-lg ${isInteractive ? "cursor-pointer hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out" : ""}`}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
          }
        }}
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-white/60 border border-[#E5E5E0]/60 ${isInteractive ? "group-hover/metric:border-[#F55036]/20 group-hover/metric:bg-[#F55036]/5 transition-colors" : ""}`}>
          {children}
        </div>
        <div className="flex flex-col items-start justify-center">
          <span
            className={`text-[14px] font-bold text-[#111111] leading-none tabular-nums tracking-tight ${isInteractive ? "group-hover/metric:text-[#F55036] transition-colors" : ""}`}
          >
            {value}
          </span>
          <span
            className={`text-[9px] font-semibold text-[#8B8B8B] uppercase tracking-[0.06em] leading-none mt-1 ${isInteractive ? "group-hover/metric:text-[#F55036]/80 transition-colors" : ""}`}
          >
            {label}
          </span>
        </div>
      </div>
    );
  },
);
Metric.displayName = "Metric";
 
export const PaperCard = memo(({ paper }: { paper: Paper }) => {
  console.log("PAPER DATA:", paper.title, paper);
  const upvotesNum = parseFloat(paper.upvotes) || 0;
  const router = useRouter();
 
  const safeAuthors = paper.authors || [];
  const visibleAuthors = safeAuthors.slice(0, 3);
  const remaining = safeAuthors.length - 3;
  const githubRepo = paper.repositories?.find(
    (repo: any) => repo.url?.includes("github.com")
  );
 
  const handlePrefetch = useCallback(() => {
    router.prefetch(`/papers/${paper.slug}`);
    prefetchPaperBySlug(paper.slug);
  }, [router, paper.slug]);
  
  return (
    <div
      className="block"
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
    >
      <div className="group flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-5 p-3 sm:p-4 xl:pt-2 xl:pb-2 bg-white xl:bg-transparent border xl:border-none border-[#E5E5E0] rounded-none hover:shadow-lg xl:hover:bg-white xl:hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out">
        {/* PDF thumbnail */}
        <div className="order-first xl:order-last shrink-0 w-full xl:w-auto mx-auto xl:mx-0 xl:self-stretch border-b xl:border-b-0 border-[#E5E5E0] pb-3 xl:pb-0 mb-1 xl:mb-0">
          <Link href={`/papers/${paper.slug}`} className="block h-full group/thumb cursor-pointer">
            <PaperThumbnail 
              title={paper.title} 
              thumbnail={paper.thumbnail || (paper as any).thumbnailUrl || (paper as any).imageUrl || (paper as any).image_url || (paper as any).image || ""} 
              slug={paper.slug}
              arxivId={paper.arxivId}
            />
          </Link>
        </div>
 
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title */}
          <h3 className="text-[15px] sm:text-[17px] xl:text-[20px] font-serif font-medium text-[#111111] leading-snug xl:leading-[1.3] mb-1 xl:mb-1.5 transition-colors line-clamp-2">
            <Link href={`/papers/${paper.slug}`} className="hover:text-[#F55036]">
              {paper.title}
            </Link>
          </h3>
 
          {/* Authors + Date + Citations */}
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-[#666666] mb-3">
            <div className="flex flex-wrap items-center">
              {visibleAuthors.length > 0 ? (
                visibleAuthors.map((a, i) => (
                  <span key={a.slug || i}>
                    {i > 0 && <span>, </span>}
                    <span className="hover:text-[#F55036] transition-colors">
                      {a.name}
                    </span>
                  </span>
                ))
              ) : (
                <span>Unknown Author</span>
              )}
              {remaining > 0 && <span>, +{remaining} {remaining === 1 ? 'author' : 'authors'}</span>}
            </div>
            <span className="text-[#CCCCCC]">•</span>
 
            <span>{paper.date}</span>
 
            <span className="text-[#CCCCCC]">•</span>
 
            <span>{paper.citations || 0} citations</span>
 
          </div>
 
 
 
          {/* Description */}
          <p className="text-[13px] sm:text-[13.5px] xl:text-[14px] text-[#444444] leading-[1.6] mb-3 line-clamp-3">
            {paper.description}
          </p>
 
          {/* Benchmark / SOTA (Row 1) */}
          <div className="w-full">
            <SotaDisplay sota={paper.sota} />
          </div>
 
          {/* Tasks (Row 2) */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 w-full">
            {paper.tags?.slice(0, 4).map((t) => {
              const colorKey = getTagColor(t);
              return <Pill key={t} label={t} colorKey={colorKey} />;
            })}
          </div>
 
          {/* Methods (Row 3) */}
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            {paper.additionalTags?.slice(0, 4).map((t) => {
              return <Pill key={t} label={t} colorKey="gray" />;
            })}
          </div>
 
          {/* Action Buttons */}
          <div className="grid grid-cols-5 md:grid md:grid-cols-5 gap-1 sm:gap-2 md:gap-3 mt-1.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = paper.arxivUrl || getArxivAbsUrl(paper.arxivId, paper.paperUrl) || "https://arxiv.org";
                window.open(url, "_blank");
              }}
              className="flex-none md:flex-1 flex items-center justify-center lg:justify-between xl:justify-center px-0.5 min-[375px]:px-1 md:px-2 lg:px-4 xl:px-2 h-[24px] md:h-[28px] lg:h-[58px] xl:h-[28px] bg-white text-[#b31b1b] border-[1.5px] border-[#b31b1b]/40 hover:border-[#b31b1b] hover:bg-[#b31b1b]/5 rounded-[6px] transition-all duration-300"
            >
              <div className="flex items-center gap-0.5 min-[375px]:gap-1 md:gap-1.5 lg:gap-3 xl:gap-1.5">
                <div className="w-[12px] h-[12px] min-[375px]:w-[14px] min-[375px]:h-[14px] md:w-[20px] md:h-[20px] lg:w-8 lg:h-8 xl:w-[20px] xl:h-[20px] rounded-[4px] md:rounded-[6px] lg:rounded-[10px] xl:rounded-[6px] bg-transparent flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/arxiv/b31b1b" alt="arXiv" className="w-[9px] h-[9px] min-[375px]:w-[10px] min-[375px]:h-[10px] md:w-[12px] md:h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium lg:font-semibold xl:font-medium text-[7.5px] min-[375px]:text-[8.5px] sm:text-[9.5px] md:text-[11.5px] lg:text-[15px] xl:text-[11.5px] whitespace-nowrap tracking-tighter min-[375px]:tracking-tight">arXiv</span>
                  <span className="hidden lg:block text-[12px] text-[#666] xl:hidden">Original preprint</span>
                </div>
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="hidden lg:block xl:hidden" />
            </button>
 
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = paper.pdfUrl || getArxivPdfUrl((paper as any).pdfUrl, paper.paperUrl, paper.arxivId) || "https://arxiv.org";
                window.open(url, "_blank");
              }}
              className="flex-none md:flex-1 flex items-center justify-center lg:justify-between xl:justify-center px-0.5 min-[375px]:px-1 md:px-2 lg:px-4 xl:px-2 h-[24px] md:h-[28px] lg:h-[58px] xl:h-[28px] bg-white text-[#E54D59] border-[1.5px] border-[#E54D59]/40 hover:border-[#E54D59] hover:bg-[#E54D59]/5 rounded-[6px] transition-all duration-300"
            >
              <div className="flex items-center gap-0.5 min-[375px]:gap-1 md:gap-1.5 lg:gap-3 xl:gap-1.5">
                <div className="w-[12px] h-[12px] min-[375px]:w-[14px] min-[375px]:h-[14px] md:w-[20px] md:h-[20px] lg:w-8 lg:h-8 xl:w-[20px] xl:h-[20px] rounded-[4px] md:rounded-[6px] lg:rounded-[10px] xl:rounded-[6px] bg-transparent flex items-center justify-center">
                  <FileText className="text-[#E54D59] w-[9px] h-[9px] min-[375px]:w-[10px] min-[375px]:h-[10px] md:w-[12px] md:h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium lg:font-semibold xl:font-medium text-[7.5px] min-[375px]:text-[8.5px] sm:text-[9.5px] md:text-[11.5px] lg:text-[15px] xl:text-[11.5px] whitespace-nowrap tracking-tighter min-[375px]:tracking-tight">PDF</span>
                  <span className="hidden lg:block text-[12px] text-[#666] xl:hidden">Full paper</span>
                </div>
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="hidden lg:block xl:hidden" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const ghUrl =
                  paper.githubUrl ||
                  githubRepo?.url ||
                  (paper.repositories?.find((repo: any) => repo.url?.includes("github.com"))?.url);
                if (ghUrl) {
                  window.open(ghUrl, "_blank");
                } else {
                  window.open("https://github.com", "_blank");
                }
              }}
              className="flex-none md:flex-1 flex items-center justify-center lg:justify-between xl:justify-center px-0.5 min-[375px]:px-1 md:px-2 lg:px-4 xl:px-2 h-[24px] md:h-[28px] lg:h-[58px] xl:h-[28px] bg-white text-[#24292f] border-[1.5px] border-[#24292f]/30 hover:border-[#24292f] hover:bg-[#24292f]/5 rounded-[6px] transition-all duration-300"
            >
              <div className="flex items-center gap-0.5 min-[375px]:gap-1 md:gap-1.5 lg:gap-3 xl:gap-1.5">
                <div className="w-[12px] h-[12px] min-[375px]:w-[14px] min-[375px]:h-[14px] md:w-[20px] md:h-[20px] lg:w-8 lg:h-8 xl:w-[20px] xl:h-[20px] rounded-[4px] md:rounded-[6px] lg:rounded-[10px] xl:rounded-[6px] bg-transparent flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/github/24292f" alt="GitHub" className="w-[9px] h-[9px] min-[375px]:w-[10px] min-[375px]:h-[10px] md:w-[12px] md:h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px]" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium lg:font-semibold xl:font-medium text-[7.5px] min-[375px]:text-[8.5px] sm:text-[9.5px] md:text-[11.5px] lg:text-[15px] xl:text-[11.5px] whitespace-nowrap tracking-tighter min-[375px]:tracking-tight">Code</span>
                  <span className="hidden lg:block text-[12px] text-[#666] xl:hidden">
                    {upvotesNum > 0 ? `${upvotesNum >= 1000 ? (upvotesNum / 1000).toFixed(1) + "k" : upvotesNum} stars` : "0 stars"}
                  </span>
                </div>
                {upvotesNum > 0 && <span className="hidden lg:inline xl:hidden text-[#9CA3AF] text-[12.5px] font-normal">{upvotesNum}k</span>}
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#9CA3AF] hidden lg:block xl:hidden" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const hfUrl = resolveHfModelUrl(paper);
                if (hfUrl) {
                  window.open(hfUrl, "_blank");
                } else {
                  alert("Hugging Face model will be available soon.");
                }
              }}
              className="relative overflow-hidden flex-none md:flex-1 flex items-center justify-center lg:justify-between xl:justify-center px-0.5 min-[375px]:px-1 md:px-2 lg:px-4 xl:px-2 h-[24px] md:h-[28px] lg:h-[58px] xl:h-[28px] bg-white text-[#B7791F] border-[1.5px] border-[#eab308]/50 hover:border-[#eab308] hover:bg-[#eab308]/10 rounded-[6px] transition-all duration-300"
            >
              {/* Mobile Content */}
              <div className="absolute inset-0 flex sm:hidden items-center justify-center pointer-events-none">
                <div className="flex items-center gap-0.5 transform scale-[0.60] min-[375px]:scale-[0.70] whitespace-nowrap">
                  <img src="https://cdn.simpleicons.org/huggingface" alt="Hugging Face" className="w-[10px] h-[10px]" />
                  <span className="font-medium text-[10px] tracking-tight">Hugging Face</span>
                </div>
              </div>

              {/* Desktop Content */}
              <div className="hidden sm:flex items-center gap-1.5 lg:gap-3 xl:gap-1.5">
                <div className="w-[20px] h-[20px] lg:w-8 lg:h-8 xl:w-[20px] xl:h-[20px] rounded-[6px] lg:rounded-[10px] xl:rounded-[6px] bg-transparent flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/huggingface" alt="Hugging Face" className="w-[12px] h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px]" />
                </div>
                <span className="font-semibold xl:font-medium text-[9.5px] md:text-[11.5px] lg:text-[15px] xl:text-[11.5px] whitespace-nowrap tracking-tight">
                  Hugging Face
                </span>
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#9CA3AF] hidden lg:block xl:hidden" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const ghUrl =
                  paper.githubUrl ||
                  githubRepo?.url ||
                  (paper.repositories?.find((repo: any) => repo.url?.includes("github.com"))?.url);
                if (ghUrl) {
                  window.open(ghUrl, "_blank");
                }
              }}
              className="relative overflow-hidden flex-none md:flex-1 flex items-center justify-center lg:justify-between xl:justify-center px-0.5 min-[375px]:px-1 md:px-2 lg:px-4 xl:px-2 h-[24px] md:h-[28px] lg:h-[58px] xl:h-[28px] bg-white text-[#24292f] border-[1.5px] border-[#24292f]/30 hover:border-[#24292f] hover:bg-[#24292f]/5 rounded-[6px] transition-all duration-300"
            >
              {/* Mobile Content */}
              <div className="absolute inset-0 flex sm:hidden items-center justify-center pointer-events-none">
                <div className="flex items-center gap-0.5 transform scale-[0.60] min-[375px]:scale-[0.70] whitespace-nowrap">
                  <img src="https://cdn.simpleicons.org/github/24292f" alt="GitHub" className="w-[10px] h-[10px]" />
                  <span className="font-medium text-[10px] tracking-tight">{paper.github_hourly_increase?.toFixed(2) ?? "0.00"} stars/hr</span>
                </div>
              </div>

              {/* Desktop Content */}
              <div className="hidden sm:flex items-center gap-1.5 lg:gap-3 xl:gap-1.5">
                <div className="w-[20px] h-[20px] lg:w-8 lg:h-8 xl:w-[20px] xl:h-[20px] rounded-[6px] lg:rounded-[10px] xl:rounded-[6px] bg-transparent flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://cdn.simpleicons.org/github/24292f" alt="GitHub" className="w-[12px] h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px]" />
                </div>
                <ArrowUp className="w-[12px] h-[12px] lg:w-4 lg:h-4 xl:w-[12px] xl:h-[12px] text-[#24292f]" strokeWidth={2.5} />
                <span className="font-semibold xl:font-medium text-[9.5px] md:text-[11.5px] lg:text-[15px] xl:text-[11.5px] whitespace-nowrap tracking-tight">
                  {paper.github_hourly_increase?.toFixed(2) ?? "0.00"} stars / hour
                </span>
              </div>
              <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#9CA3AF] hidden lg:block xl:hidden" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
PaperCard.displayName = "PaperCard";
 
/* ─── Paper Card Skeleton ────────────────────────────────────────────────── */
const PaperCardSkeleton = memo(() => {
  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 p-4 xl:py-6 xl:px-6 border xl:border-x-0 xl:border-t-0 border-[#E5E5E0] bg-white xl:bg-transparent min-w-0 rounded-xl xl:rounded-none h-full animate-pulse">
      <div className="flex flex-col justify-center shrink-0 w-full xl:w-auto">
        <div className="w-full xl:w-[170px] h-[180px] sm:h-[220px] xl:h-[240px] shrink-0 border border-[#E5E5E0] rounded-md xl:rounded-none bg-[#EFEDE6]" />
      </div>
 
      <div className="flex-1 min-w-0 flex flex-col xl:pr-8">
        <div className="h-6 bg-[#EFEDE6] rounded mb-2 w-11/12" />
        <div className="h-6 bg-[#EFEDE6] rounded mb-3 w-7/12" />
        <div className="h-4 bg-[#EFEDE6] rounded mb-2 w-8/12" />
        <div className="h-4 bg-[#EFEDE6] rounded mb-2 w-full" />
        <div className="h-4 bg-[#EFEDE6] rounded mb-2 w-11/12" />
        <div className="h-4 bg-[#EFEDE6] rounded mb-4 w-9/12" />
        <div className="h-4 bg-[#EFEDE6] rounded mb-[12px] w-10/12" />
        <div className="flex gap-2 mb-2 overflow-hidden">
          <div className="h-[28px] xl:h-[24px] w-24 bg-[#EFEDE6] rounded-[4px]" />
          <div className="h-[28px] xl:h-[24px] w-32 bg-[#EFEDE6] rounded-[4px]" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          <div className="h-[28px] xl:h-[24px] w-28 bg-[#EFEDE6] rounded-[4px]" />
          <div className="h-[28px] xl:h-[24px] w-20 bg-[#EFEDE6] rounded-[4px]" />
        </div>
      </div>
 
      <div className="shrink-0 flex items-stretch xl:pl-[24px] xl:pr-[32px] border-t xl:border-t-0 xl:border-l border-[#E5E5E0] mt-auto xl:mt-0 pt-4 xl:pt-0 w-full xl:w-auto">
        <div className="flex flex-row xl:flex-col justify-around xl:justify-around items-center w-full xl:w-[64px] xl:py-2 gap-2 xl:gap-0">
          <div className="h-8 w-12 bg-[#EFEDE6] rounded" />
          <div className="h-8 w-12 bg-[#EFEDE6] rounded" />
          <div className="h-8 w-12 bg-[#EFEDE6] rounded" />
        </div>
      </div>
    </div>
  );
});
PaperCardSkeleton.displayName = "PaperCardSkeleton";
 
/* ─── List ───────────────────────────────────────────────────────────────── */
interface PaperListProps {
  selectedTag?: string;
  filterParams?: Pick<GetPapersParams, "sort" | "task" | "method" | "model">;
  period?: GetPapersParams["period"];
  searchQuery?: string;
  initialPapers?: GetPapersResult | null;
  initialError?: string;
  isFilterChanging?: boolean;
  selectedFilter?: string;
  onFilterDone?: () => void;
}

export default function PaperList({
  selectedTag,
  filterParams,
  period,
  searchQuery,
  initialPapers = null,
  initialError,
  selectedFilter,
  isFilterChanging,
  onFilterDone,
}: PaperListProps) {
  const [papers, setPapers] = useState<Paper[]>(() => {
    if (initialPapers?.papers) {
      return initialPapers.papers;
    }
    return [];
  });

  const [page, setPage] = useState(() => initialPapers?.page ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPapers, setTotalPapers] = useState(() => initialPapers?.total ?? 0);
  const [displayCount, setDisplayCount] = useState(() => initialPapers?.papers?.length ?? 25);
  const cacheRef = useRef<Map<string, GetPapersResult>>(new Map());
  const inFlightRef = useRef<Map<string, Promise<GetPapersResult>>>(new Map());
  const loadingRef = useRef(false);

  // Stabilize onFilterDone so it doesn't cause the filter effect to re-run
  const onFilterDoneRef = useRef(onFilterDone);
  onFilterDoneRef.current = onFilterDone;
  const normalizedSearchQuery = useMemo(
    () => searchQuery?.trim().toLowerCase() ?? "",
    [searchQuery],
  );
  const filteredPapers = useMemo(() => {
    if (!selectedFilter || selectedFilter === "All") {
      return papers;
    }
 
    return papers.filter((paper) => {
      const text = [
        paper.title,
        paper.description,
        ...(paper.tags ?? []),
        ...(paper.additionalTags ?? [])
      ]
        .join(" ")
        .toLowerCase();
 
      return text.includes(selectedFilter.toLowerCase());
    });
  }, [papers, selectedFilter]);
  const totalPages = Math.max(1, Math.ceil(totalPapers / itemsPerPage));
 
  // Render all fetched cards immediately without artificial delay
  useEffect(() => {
    setDisplayCount(papers.length);
  }, [papers.length]);
 
  // Paper detail prefetching — staggered to avoid connection saturation
  const prefetchedRef = useRef(new Set<string>());
  const prefetchQueueRef = useRef<string[]>([]);
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchCountRef = useRef(0);
 
  const schedulePrefetch = useCallback((slug: string) => {
    if (prefetchedRef.current.has(slug)) return;
    prefetchedRef.current.add(slug);
 
    if (prefetchCountRef.current < 3) {
      prefetchCountRef.current++;
      prefetchPaperBySlug(slug);
    } else {
      prefetchQueueRef.current.push(slug);
      if (!prefetchTimerRef.current) {
        const drainQueue = () => {
          const next = prefetchQueueRef.current.shift();
          if (next) {
            prefetchPaperBySlug(next);
            prefetchTimerRef.current = setTimeout(drainQueue, 200);
          } else {
            prefetchTimerRef.current = null;
          }
        };
        prefetchTimerRef.current = setTimeout(drainQueue, 200);
      }
    }
  }, []);
 
  const observerRef = useRef<IntersectionObserver | null>(null);
 
  useEffect(() => {
    const scrollRoot = document.getElementById("scroll-container") || null;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).getAttribute("data-paper-slug");
            if (slug) schedulePrefetch(slug);
          }
        }
      },
      { root: scrollRoot, rootMargin: "400px" }
    );
    return () => {
      observerRef.current?.disconnect();
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    };
  }, [schedulePrefetch]);
 
  const observeCard = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      observerRef.current?.observe(el);
    }
  }, []);
 
  const matchesSearch = useCallback(
    (paper: Paper) => {
      if (!normalizedSearchQuery) return true;
      const haystack = [
        paper.title,
        (paper.authors || []).map((a) => a.name).join(" "),
        paper.description,
        ...(paper.tags ?? []),
        ...(paper.additionalTags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearchQuery);
    },
    [normalizedSearchQuery],
  );
 
  const method = useMemo(() => {
    if (filterParams?.method) return filterParams.method;
    if (selectedTag === "MCP") return "mcp";
    return undefined;
  }, [filterParams?.method, selectedTag]);
 
  const task = useMemo(() => {
    if (filterParams?.task) return filterParams.task;
    if (selectedTag === "MCP") return undefined;
    return selectedTag && selectedTag !== "All Topics"
      ? selectedTag.toLowerCase().replace(/\s+/g, "-")
      : undefined;
  }, [filterParams?.task, selectedTag]);

  const getCacheKey = useCallback(
    (pageNumber: number, limit: number) => {
      return `${task ?? "all"}:${filterParams?.model ?? "none"}:${method ?? "none"}:${filterParams?.sort ?? "none"}:${period ?? "all"}:${limit}:${pageNumber}`;
    },
    [method, filterParams?.model, filterParams?.sort, period, task],
  );

  const fetchPage = useCallback(
    (pageNumber: number, limit: number): Promise<GetPapersResult> => {
      const key = getCacheKey(pageNumber, limit);
      const cached = cacheRef.current.get(key);
      if (cached) {
        return Promise.resolve(cached);
      }
      if (inFlightRef.current.has(key)) {
        return inFlightRef.current.get(key)!;
      }

      const request = getPapers({
        page: pageNumber,
        limit,
        task,
        model: filterParams?.model,
        method,
        sort: filterParams?.sort,
        period,
      })
        .then((result) => {
          cacheRef.current.set(key, result);
          return result;
        })
        .finally(() => {
          inFlightRef.current.delete(key);
        });

      inFlightRef.current.set(key, request);
      return request;
    },
    [
      filterParams?.method,
      filterParams?.model,
      filterParams?.sort,
      getCacheKey,
      period,
      task,
    ],
  );

  const prefetchPage = useCallback(
    (pageNumber: number) => {
      void fetchPage(pageNumber, itemsPerPage).catch((err) => {
        console.warn("Failed to prefetch papers:", err);
      });
    },
    [fetchPage, itemsPerPage],
  );

  const loadPage = useCallback(
    async (pageNumber: number, limit: number) => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        const result = await fetchPage(pageNumber, limit);
        const visiblePapers = normalizedSearchQuery
          ? result.papers.filter(matchesSearch)
          : result.papers;

        setPage(result.page);
        setTotalPapers(result.total);
        setPapers(visiblePapers);

        // Pre-fetch next page if possible
        if (result.hasMore) {
          prefetchPage(result.page + 1);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load papers. Please try again later.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
        onFilterDoneRef.current?.();
      }
    },
    [
      fetchPage,
      matchesSearch,
      normalizedSearchQuery,
      prefetchPage,
    ],
  );
const isInitialMount = useRef(true);
  const isInitialTransition = useRef(true);
  const prevParamsStr = useRef<string>("");

  useEffect(() => {
    const currentParamsStr = `${task ?? "all"}:${method ?? "none"}:${filterParams?.model ?? "none"}:${filterParams?.sort ?? "none"}:${period ?? "all"}:${normalizedSearchQuery}:${itemsPerPage}`;

// RULE 1: Handle the very first mount (Do absolutely nothing to state, it's already perfect!)
   if (isInitialMount.current) {
  isInitialMount.current = false;
  prevParamsStr.current = currentParamsStr;

  if (
    initialPapers &&
    initialPapers.papers &&
    initialPapers.papers.length > 0 &&
    !normalizedSearchQuery
  ) {
    cacheRef.current.set(getCacheKey(initialPapers.page, itemsPerPage), initialPapers);
    setTotalPapers(initialPapers.total);
    if (initialPapers.hasMore) {
      prefetchPage(initialPapers.page + 1);
    }

    return;
  }

  // No initial papers were provided, so fetch the first page.
  void loadPage(1, itemsPerPage);
  return;
}

    // RULE 2: GUARD AGAINST EXTRA FETCHES
    // If the component re-renders but filters haven't actually changed, DO NOTHING.
    // This completely stops the double-loading flicker and prevents overriding server data.
    if (prevParamsStr.current === currentParamsStr) {
      return;
    }

    prevParamsStr.current = currentParamsStr;

    // RULE 3: Only when filters ACTUALLY change, clear the feed and fetch fresh data
    setPapers([]);
    setLoading(true);
    setPage(1);
    void loadPage(1, itemsPerPage);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterParams?.method,
    filterParams?.model,
    filterParams?.sort,
    filterParams?.task,
    getCacheKey,
    initialError,
    initialPapers,
    loadPage,
    method,
    normalizedSearchQuery,
    period,
    prefetchPage,
    task,
    itemsPerPage,
  ]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Prevent the artificial skeleton flash on the very first page load
    if (isInitialTransition.current) {
      isInitialTransition.current = false;
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [
    filterParams?.method,
    filterParams?.model,
    filterParams?.sort,
    filterParams?.task,
    period,
    selectedTag,
  ]);
 
  if (error && papers.length === 0) {
    return (
      <div className="pb-12 pt-8 flex justify-center items-center text-[#F55036]">
        <p className="text-[14px]">{error}</p>
      </div>
    );
  }
 
  return (
    <Profiler id="PaperList" onRender={logRender}>
      <div
        className="pb-12 bg-transparent grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-col gap-8 md:gap-10 xl:gap-5"
        data-page={page}
      >
        {isTransitioning || isFilterChanging || (loading && papers.length === 0) ? (
          <>
            <PaperCardSkeleton />
            <PaperCardSkeleton />
            <PaperCardSkeleton />
          </>
        ) : (
          filteredPapers
            .slice(0, displayCount)
            .map((paper, idx) => (
              <Fragment key={paper.slug}>
                {idx > 0 && <div className="hidden xl:block h-px w-full bg-[#E5E5E0]" />}
                <div ref={observeCard} data-paper-slug={paper.slug} className="animate-fade-in">
                  <PaperCard paper={paper} />
                </div>
              </Fragment>
            ))
        )}
  
        {!loading && papers.length > 0 && (
          <div className="flex justify-center w-full col-span-full mt-10 mb-6">
            <div className="flex items-center bg-white border border-[#E5E5E0] shadow-sm rounded-full p-1.5 h-[48px]">
              <div className="flex items-center px-2 gap-1">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, page - 1);
                    void loadPage(newPage, itemsPerPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-[#111] hover:bg-[#F8F7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="w-8 h-8 rounded-full bg-[#F55036] text-white flex items-center justify-center text-[14px] font-medium shadow-sm">
                  {page}
                </div>

                <button
                  onClick={() => {
                    const maxPage = Math.max(1, Math.ceil((totalPapers || papers.length) / itemsPerPage));
                    const newPage = Math.min(maxPage, page + 1);
                    void loadPage(newPage, itemsPerPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page >= Math.max(1, Math.ceil((totalPapers || papers.length) / itemsPerPage))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-[#111] hover:bg-[#F8F7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="w-px h-6 bg-[#E5E5E0] mx-1"></div>

              <div className="relative flex items-center px-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setItemsPerPage(newLimit);
                    setPage(1); // Reset to page 1 on limit change
                  }}
                  className="appearance-none bg-transparent text-[#111] text-[14px] font-medium py-1 pl-3 pr-7 rounded-full cursor-pointer hover:bg-[#F8F7F2] focus:outline-none transition-colors h-8"
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#666]">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && papers.length > 0 && (
          <div className="flex justify-center py-8 w-full col-span-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E5E5E0]" />
          </div>
        )}
 
        {!loading && papers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in w-full col-span-full">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-[#E5E5E0] shadow-sm">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B8B8B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#111111] mb-2 tracking-tight">
              No Papers Found
            </h3>
            <p className="text-[14px] text-[#666666] max-w-[320px] leading-relaxed">
              We couldn&apos;t find any papers matching your selected time period or
              category. Try clearing your filters or selecting &quot;All time&quot;.
            </p>
          </div>
        )}
      </div>
    </Profiler>
  );
}
