"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Check, ArrowRight, Trophy, Cpu, Sparkles } from "lucide-react";
import { compareModels, type ModelComparisonResult } from "@/lib/models";

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  slugs: string[];
}

export default function ModelComparisonModal({
  isOpen,
  onClose,
  slugs,
}: ModelComparisonModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ModelComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || slugs.length < 2) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    setLoading(true);
    setError(null);

    compareModels(slugs)
      .then((result) => {
        if (!result || !result.models || result.models.length < 2) {
          setError("Could not retrieve side-by-side comparison data for the selected models.");
        } else {
          setData(result);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to compare models.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, slugs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E2D9]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF5A1F]/10 text-[#FF5A1F]">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 id="comparison-title" className="text-[16px] font-bold text-[#171717] m-0">
                Foundation Model Comparison Matrix
              </h2>
              <p className="text-[12px] text-[#777777] m-0">
                Side-by-side architecture, hardware memory sizing, and benchmark leaderboard deltas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#777777] hover:text-[#171717] hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Close comparison"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[13px] font-medium text-[#777777]">
                Normalizing specifications and evaluating benchmark scores...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="py-12 text-center max-w-md mx-auto space-y-3">
              <p className="text-[14px] text-[#DC2626] font-medium">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#171717] text-white rounded-lg text-[13px] font-semibold hover:bg-black"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && data && data.models && (
            <div className="space-y-6">
              {/* Models Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.models.map((m) => (
                  <div
                    key={m.slug}
                    className="p-4 rounded-xl border border-[#EDE8DF] bg-[#FAF9F6] flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A1F]">
                        {m.vendor || "Foundation Lab"}
                      </span>
                      <h3 className="text-[17px] font-extrabold text-[#171717] mt-1 mb-2">
                        {m.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {m.parameterCount && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E2D9] text-[11px] font-bold text-[#444]">
                            {m.parameterCount}
                          </span>
                        )}
                        {data.specComparison?.architecture?.[m.slug] && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E2D9] text-[11px] font-semibold text-[#666]">
                            {data.specComparison.architecture[m.slug]}
                          </span>
                        )}
                        {data.specComparison?.license?.[m.slug] && (
                          <span className="px-2 py-0.5 rounded bg-white border border-[#E5E2D9] text-[11px] font-semibold text-[#666]">
                            {data.specComparison.license[m.slug]}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/models/${m.slug}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#FF5A1F] hover:underline pt-2 border-t border-[#ECEAE4]"
                    >
                      Inspect Model Details
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Hardware & Sizing Comparison */}
              <div className="rounded-xl border border-[#EDE8DF] overflow-hidden">
                <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#EDE8DF] flex items-center gap-2">
                  <Cpu size={16} className="text-[#FF5A1F]" />
                  <span className="text-[12px] font-black uppercase tracking-wider text-[#171717]">
                    Hardware & Memory Sizing
                  </span>
                </div>
                <div className="divide-y divide-[#F0ECE1]">
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center">
                    <span className="font-semibold text-[#666]">4-bit Quantized VRAM</span>
                    {data.models.map((m) => {
                      const vram = data.specComparison?.minVramQuantizedGb?.[m.slug] ?? m.hardware?.minVramQuantizedGb;
                      return (
                        <span key={m.slug} className="font-bold text-[#171717] px-2">
                          {vram != null ? `${vram} GB` : "N/A"}
                        </span>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center">
                    <span className="font-semibold text-[#666]">FP16 / BF16 VRAM</span>
                    {data.models.map((m) => {
                      const vram = data.specComparison?.minVramFp16Gb?.[m.slug] ?? m.hardware?.minVramFp16Gb;
                      return (
                        <span key={m.slug} className="font-bold text-[#171717] px-2">
                          {vram != null ? `${vram} GB` : "N/A"}
                        </span>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center">
                    <span className="font-semibold text-[#666]">Fits Consumer 6GB GPU</span>
                    {data.models.map((m) => {
                      const fits = data.specComparison?.fitsOn6GbGpu?.[m.slug] ?? m.hardware?.fitsOn6GbGpu;
                      return (
                        <div key={m.slug} className="px-2">
                          {fits ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                              <Check size={12} /> Yes (RTX 4050/3060)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#999999] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                              Requires 16GB+
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center">
                    <span className="font-semibold text-[#666]">Recommended Tier</span>
                    {data.models.map((m) => {
                      const tier = data.specComparison?.hardwareTier?.[m.slug] ?? m.hardware?.hardwareTier ?? "Standard";
                      return (
                        <span key={m.slug} className="font-medium text-[#444] px-2 capitalize">
                          {tier.replace("_", " ")}
                        </span>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center">
                    <span className="font-semibold text-[#666]">Context Window</span>
                    {data.models.map((m) => {
                      const ctx = data.specComparison?.contextWindow?.[m.slug] ?? "Standard";
                      return (
                        <span key={m.slug} className="font-semibold text-[#222] px-2">
                          {ctx}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Benchmarks Comparison Table */}
              {data.benchmarkComparison && data.benchmarkComparison.length > 0 && (
                <div className="rounded-xl border border-[#EDE8DF] overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#EDE8DF] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-[#EAB308]" />
                      <span className="text-[12px] font-black uppercase tracking-wider text-[#171717]">
                        Verified Benchmark Evaluations
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#888]">
                      Highest Score Highlighted
                    </span>
                  </div>
                  <div className="divide-y divide-[#F0ECE1]">
                    {data.benchmarkComparison.map((b) => (
                      <div
                        key={b.benchmark}
                        className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] p-3 text-[13px] items-center hover:bg-[#FAF9F7] transition-colors"
                      >
                        <span className="font-semibold text-[#171717] truncate pr-2">
                          {b.benchmark}
                        </span>
                        {data.models.map((m) => {
                          const score = b.scores[m.slug];
                          const isWinner = b.winner === m.slug;

                          return (
                            <div key={m.slug} className="px-2 flex items-center gap-1.5">
                              {score !== null && score !== undefined ? (
                                <>
                                  <span
                                    className={`font-mono font-bold ${
                                      isWinner ? "text-[#059669] font-black" : "text-[#333]"
                                    }`}
                                  >
                                    {typeof score === "number" ? score.toFixed(1) : score}
                                  </span>
                                  {isWinner && (
                                    <span className="text-[10px] font-black text-[#059669] bg-[#D1FAE5] px-1.5 py-0.5 rounded uppercase">
                                      Lead
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[#AAAAAA] text-[12px] font-mono">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-[#ECEAE4] bg-[#FAF8F5] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-[#171717] hover:bg-black rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
