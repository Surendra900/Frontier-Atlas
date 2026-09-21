"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Copy, Check, Download, X, Quote } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export type CitationFormat = "bibtex" | "apa" | "mla" | "chicago" | "ris";

export interface CitationModalPaper {
  title: string;
  authors?: Array<{ name: string }>;
  publicationDate?: string | null;
  arxivId?: string | null;
  slug?: string;
  paperUrl?: string | null;
  pdfUrl?: string | null;
}

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: CitationModalPaper;
}

function cleanAuthorName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

function getCitationYear(dateStr?: string | null): string {
  if (!dateStr) return new Date().getFullYear().toString();
  try {
    const y = new Date(dateStr).getFullYear();
    return isNaN(y) ? new Date().getFullYear().toString() : y.toString();
  } catch {
    return new Date().getFullYear().toString();
  }
}

function generateBibtex(paper: CitationModalPaper): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((a) => cleanAuthorName(a.name));
  const authorBib = authors.length > 0 ? authors.join(" and ") : "Frontier Atlas Research Team";

  // create key e.g. vaswani2017attention or paper slug
  const firstAuthorLastName = authors[0]?.split(" ").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "paper";
  const citeKey = `${firstAuthorLastName}${year}${paper.slug?.slice(0, 15)?.replace(/[^a-z0-9]/g, "") || "research"}`;
  const arxivId = paper.arxivId || paper.slug?.split("-").pop() || "";
  const url = paper.paperUrl || (arxivId ? `https://arxiv.org/abs/${arxivId}` : "https://frontieratlas.org");

  return `@article{${citeKey},
  title     = {${paper.title.replace(/[{}]/g, "")}},
  author    = {${authorBib}},
  journal   = {arXiv preprint ${arxivId ? `arXiv:${arxivId}` : "arXiv"}},
  year      = {${year}},
  url       = {${url}},
  eprint    = {${arxivId}},
  archivePrefix = {arXiv}
}`;
}

function generateApa(paper: CitationModalPaper): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((a) => cleanAuthorName(a.name));
  const arxivId = paper.arxivId || "";
  const url = paper.paperUrl || (arxivId ? `https://arxiv.org/abs/${arxivId}` : "");

  let authorStr = "Frontier Atlas Research Team";
  if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length === 2) {
    authorStr = `${authors[0]}, & ${authors[1]}`;
  } else if (authors.length > 2) {
    authorStr = `${authors[0]}, et al.`;
  }

  return `${authorStr} (${year}). ${paper.title}. arXiv preprint${arxivId ? ` arXiv:${arxivId}` : ""}${url ? `. ${url}` : ""}`;
}

function generateMla(paper: CitationModalPaper): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((a) => cleanAuthorName(a.name));
  const arxivId = paper.arxivId || "";

  let authorStr = "Frontier Atlas Research Team";
  if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length === 2) {
    authorStr = `${authors[0]}, and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorStr = `${authors[0]}, et al.`;
  }

  return `${authorStr}. "${paper.title}." arXiv preprint${arxivId ? ` arXiv:${arxivId}` : ""} (${year}).`;
}

function generateChicago(paper: CitationModalPaper): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((a) => cleanAuthorName(a.name));
  const arxivId = paper.arxivId || "";
  const url = paper.paperUrl || (arxivId ? `https://arxiv.org/abs/${arxivId}` : "");

  let authorStr = "Frontier Atlas Research Team";
  if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length === 2) {
    authorStr = `${authors[0]}, and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorStr = `${authors[0]}, et al.`;
  }

  return `${authorStr}. "${paper.title}." arXiv preprint${arxivId ? ` arXiv:${arxivId}` : ""} (${year})${url ? `. ${url}` : ""}.`;
}

function generateRis(paper: CitationModalPaper): string {
  const year = getCitationYear(paper.publicationDate);
  const authors = (paper.authors || []).map((a) => cleanAuthorName(a.name));
  const arxivId = paper.arxivId || "";
  const url = paper.paperUrl || (arxivId ? `https://arxiv.org/abs/${arxivId}` : "");

  const lines = [
    "TY  - JOUR",
    `TI  - ${paper.title}`,
    ...authors.map((a) => `AU  - ${a}`),
    `PY  - ${year}`,
    arxivId ? `SN  - arXiv:${arxivId}` : "",
    url ? `UR  - ${url}` : "",
    "ER  - ",
  ].filter(Boolean);

  return lines.join("\n");
}

export function CitationModal({ isOpen, onClose, paper }: CitationModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>("bibtex");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const citationText = useMemo(() => {
    switch (selectedFormat) {
      case "bibtex":
        return generateBibtex(paper);
      case "apa":
        return generateApa(paper);
      case "mla":
        return generateMla(paper);
      case "chicago":
        return generateChicago(paper);
      case "ris":
        return generateRis(paper);
      default:
        return generateBibtex(paper);
    }
  }, [selectedFormat, paper]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      toast.copy(`Copied ${selectedFormat.toUpperCase()} citation to clipboard`);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Failed to copy citation to clipboard");
    }
  }, [citationText, selectedFormat, toast]);

  const handleDownload = useCallback(() => {
    const ext = selectedFormat === "ris" ? "ris" : "bib";
    const filename = `${(paper.slug || "paper-citation").slice(0, 30)}.${ext}`;
    const blob = new Blob([citationText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }, [citationText, selectedFormat, paper.slug, toast]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-modal-title"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5E0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6] bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A1F]/10 flex items-center justify-center text-[#FF5A1F]">
              <Quote size={17} />
            </div>
            <div>
              <h2 id="citation-modal-title" className="text-[16px] font-bold text-[#171717] m-0">
                Cite this Research
              </h2>
              <p className="text-[12px] text-[#737373] m-0 line-clamp-1 max-w-md">
                {paper.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format Switcher Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-2 border-b border-[#F0EFEB] overflow-x-auto">
          {(["bibtex", "apa", "mla", "chicago", "ris"] as const).map((fmt) => {
            const active = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => {
                  setSelectedFormat(fmt);
                  setCopied(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer select-none uppercase tracking-wide ${
                  active
                    ? "bg-[#171717] text-white shadow-xs"
                    : "text-[#666666] hover:bg-[#F2EFE9] hover:text-[#171717]"
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF9F6]">
          <div className="relative rounded-xl border border-[#E5E3DC] bg-[#FFFFFF] p-4 shadow-2xs font-mono text-[13px] leading-relaxed text-[#262626] whitespace-pre-wrap select-all">
            {citationText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#EFECE6] bg-[#FFFFFF]">
          <div className="text-[12px] text-[#737373]">
            {selectedFormat === "bibtex" ? "BibTeX entry ready for LaTeX / Overleaf" : "Formatted bibliographic citation"}
          </div>

          <div className="flex items-center gap-2">
            {(selectedFormat === "bibtex" || selectedFormat === "ris") && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E5E0] bg-white text-[13px] font-semibold text-[#444444] hover:bg-[#F8F7F2] hover:text-[#171717] transition-all cursor-pointer"
              >
                <Download size={15} />
                Download .{selectedFormat === "ris" ? "ris" : "bib"}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#FF5A1F] text-white hover:bg-[#E04D16] active:scale-[0.98]"
              }`}
            >
              {copied ? (
                <>
                  <Check size={15} strokeWidth={2.5} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={15} />
                  Copy Citation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
