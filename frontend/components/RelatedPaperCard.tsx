"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import type { Paper } from "@/lib/paperApi";

function formatCompactNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function RelatedPaperThumbnail({ paper }: { paper: Paper }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const rawArxiv = useMemo(() => {
    if (!paper.arxivId) return null;
    const match = paper.arxivId.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)([a-z\-]+(?:\.[a-z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i);
    return match && match[1] ? match[1].replace(/\.pdf$/i, "") : paper.arxivId.replace(/^arxiv:/i, "");
  }, [paper.arxivId]);

  const cleanArxiv = useMemo(() => {
    return rawArxiv ? rawArxiv.replace(/v\d+$/i, "") : null;
  }, [rawArxiv]);

  const candidates = useMemo(() => {
    const list: string[] = [];
    const thumb = paper.thumbnail || (paper as any).thumbnailUrl;
    if (thumb && !thumb.includes("cloudinary.com/xipefqle") && thumb !== "FAILED_404") {
      list.push(thumb);
    }
    if (cleanArxiv) {
      list.push(`https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${cleanArxiv}.webp`);
      list.push(`https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${cleanArxiv}v1.webp`);
    }
    if (rawArxiv && rawArxiv !== cleanArxiv) {
      list.push(`https://pub-c9b7a41de3434a4ab7c7f137edbec13b.r2.dev/papers/real_page1_gcp/${rawArxiv}.webp`);
    }
    if (paper.slug) list.push(`/thumbnails/${paper.slug}.jpg`);
    if (cleanArxiv) list.push(`/thumbnails/${cleanArxiv}.jpg`);
    if (cleanArxiv) list.push(`https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${cleanArxiv}.png`);
    return Array.from(new Set(list));
  }, [paper.thumbnail, (paper as any).thumbnailUrl, cleanArxiv, rawArxiv, paper.slug]);

  const currentSrc = candidates[srcIndex];
  const isExternal = currentSrc && currentSrc.startsWith("http");
  const isR2 = currentSrc && currentSrc.includes("r2.dev");
  const imageSource = isExternal && !isR2 ? `/api/proxy-image?url=${encodeURIComponent(currentSrc)}` : currentSrc;

  const handleImgError = useCallback(() => {
    setSrcIndex(prev => (prev + 1 < candidates.length ? prev + 1 : candidates.length));
  }, [candidates.length]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0) {
      handleImgError();
    }
  }, [imageSource, handleImgError]);

  if (currentSrc && srcIndex < candidates.length) {
    return (
      <img
        ref={imgRef}
        key={imageSource}
        src={imageSource}
        alt={`Preview of ${paper.title}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        onError={handleImgError}
      />
    );
  }

  return (
    <div className="w-full p-5 flex flex-col gap-2">
      <div className="h-[3px] rounded bg-black/5 w-2/5" />
      <div className="h-[5px] rounded bg-black/6 w-full" />
      <div className="h-[5px] rounded bg-black/6 w-4/5" />
      <div className="h-[3px] rounded bg-black/4 w-3/5 mt-1" />
    </div>
  );
}

export function RelatedPaperCard({ paper }: { paper: Paper }) {
  const displayAuthors = (() => {
    if (!Array.isArray(paper.authors) || paper.authors.length === 0) return "";
    const names = paper.authors.map((a: any) => typeof a === "string" ? a : (a?.name || "")).filter(Boolean);
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
        <RelatedPaperThumbnail paper={paper} />
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
