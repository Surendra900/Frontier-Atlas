"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Download, FileText } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  arxivId?: string | null;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  arxivId,
}: PdfViewerModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex flex-col w-full max-w-6xl h-[92vh] max-h-[950px] bg-[#1E1E1E] text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#252526] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FF5A1F]/20 text-[#FF5A1F] shrink-0">
              <FileText size={16} />
            </span>
            <div className="min-w-0">
              <h2
                id="pdf-modal-title"
                className="text-[13px] sm:text-[14px] font-semibold text-white truncate m-0"
              >
                {title}
              </h2>
              {arxivId && (
                <span className="text-[11px] text-white/50 font-mono">
                  arXiv:{arxivId}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors no-underline"
              title="Open PDF in new browser tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <a
              href={pdfUrl}
              download={`${arxivId || "paper"}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors no-underline"
              title="Download PDF"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              aria-label="Close PDF viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 w-full h-full bg-[#525659] relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`PDF viewer: ${title}`}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
