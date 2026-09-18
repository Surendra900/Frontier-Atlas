"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  GitBranch,
  Calendar,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { ModelDetail, ModelItem } from "@/lib/models";

interface ModelLineageTreeProps {
  currentModel: ModelDetail | ModelItem;
  familyModels?: ModelItem[];
}

function parseYear(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatParams(paramStr: string | null | undefined): string | null {
  if (!paramStr) return null;
  const cleaned = paramStr.trim();
  if (cleaned.toLowerCase().endsWith("b") || cleaned.toLowerCase().endsWith("m")) {
    return cleaned.toUpperCase();
  }
  return cleaned;
}

export default function ModelLineageTree({
  currentModel,
  familyModels = [],
}: ModelLineageTreeProps) {
  const familyName =
    currentModel.modelFamily ||
    (currentModel as any).model_family ||
    currentModel.name.split(/[\s-_0-9]/)[0] ||
    "Model Series";

  const lineageNodes = useMemo(() => {
    const map = new Map<string, ModelItem | ModelDetail>();

    // Add sibling models
    for (const m of familyModels) {
      if (m && m.slug) {
        map.set(m.slug.toLowerCase(), m);
      }
    }

    // Always include current model
    if (currentModel && currentModel.slug) {
      map.set(currentModel.slug.toLowerCase(), currentModel);
    }

    const list = Array.from(map.values());

    // Sort chronologically by releaseDate, then by name
    list.sort((a, b) => {
      const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

    return list;
  }, [currentModel, familyModels]);

  const currentIndex = lineageNodes.findIndex(
    (m) => m.slug.toLowerCase() === currentModel.slug.toLowerCase()
  );

  return (
    <section className="rounded-[12px] border border-[#E5E5E0] bg-white p-6 md:p-8 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#F0EFEA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,90,31,0.08)] border border-[rgba(255,90,31,0.2)] flex items-center justify-center text-[#FF5A1F] shrink-0">
            <GitBranch size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] md:text-[20px] font-bold tracking-tight text-[#111111]">
                Model Lineage & Evolution Tree
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAFAF8] border border-[#E5E5E0] text-[#666666]">
                {lineageNodes.length} {lineageNodes.length === 1 ? "Checkpoint" : "Lineage Nodes"}
              </span>
            </div>
            <p className="text-[13px] text-[#666666] mt-0.5">
              Architectural lineage and generational progression within the{" "}
              <span className="font-semibold text-[#222222]">{familyName}</span> family
              {currentModel.vendor ? ` by ${currentModel.vendor}` : ""}.
            </p>
          </div>
        </div>

        {lineageNodes.length > 1 && (
          <div className="flex items-center gap-2 text-[12px] text-[#888888] shrink-0 self-start sm:self-center">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
            <span>Current Model Active</span>
          </div>
        )}
      </div>

      {/* Lineage Progression Track */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-[#E0DDD6]">
          <div className="inline-flex items-center min-w-full gap-3 md:gap-4 py-2">
            {lineageNodes.map((node, index) => {
              const isCurrent = node.slug.toLowerCase() === currentModel.slug.toLowerCase();
              const isPast = currentIndex !== -1 && index < currentIndex;
              const dateDisplay = parseYear(node.releaseDate);
              const paramsDisplay = formatParams(node.parameterCount);
              const archDisplay = node.architecture;

              return (
                <React.Fragment key={node.slug}>
                  {/* Step Connector Arrow */}
                  {index > 0 && (
                    <div className="flex flex-col items-center justify-center shrink-0 px-1 text-[#C4C2BA]">
                      <div className="w-6 md:w-8 h-[2px] bg-gradient-to-r from-[#E0DDD6] via-[#FF5A1F]/40 to-[#E0DDD6] relative flex items-center justify-center">
                        <ArrowRight size={14} className="text-[#FF5A1F] absolute" />
                      </div>
                      <span className="text-[10px] text-[#999999] mt-1 font-mono uppercase">
                        v{index + 1}
                      </span>
                    </div>
                  )}

                  {/* Model Node Card */}
                  <Link
                    href={`/models/${node.slug}`}
                    className={`group relative flex flex-col justify-between w-[220px] md:w-[250px] min-h-[168px] rounded-[10px] p-4 transition-all duration-200 no-underline shrink-0 ${
                      isCurrent
                        ? "bg-gradient-to-b from-[#FFF9F6] to-white border-2 border-[#FF5A1F] shadow-[0_4px_16px_rgba(255,90,31,0.12)] -translate-y-1"
                        : "bg-[#FAFAF8] hover:bg-white border border-[#E5E5E0] hover:border-[#D0CFC8] hover:shadow-sm"
                    }`}
                  >
                    {/* Top Status & Generation */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono text-[#888888]">
                        Gen #{index + 1}
                      </span>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF5A1F] text-white shadow-xs">
                          <Zap size={10} fill="currentColor" /> Active
                        </span>
                      ) : isPast ? (
                        <span className="text-[10px] font-medium text-[#888888] bg-[#EAE9E4] px-1.5 py-0.5 rounded">
                          Predecessor
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-[#888888] bg-[#EAE9E4] px-1.5 py-0.5 rounded">
                          Successor
                        </span>
                      )}
                    </div>

                    {/* Model Name */}
                    <div className="my-1">
                      <h3
                        className={`text-[15px] md:text-[16px] font-bold tracking-tight line-clamp-1 group-hover:text-[#FF5A1F] transition-colors ${
                          isCurrent ? "text-[#FF5A1F]" : "text-[#111111]"
                        }`}
                        title={node.name}
                      >
                        {node.name}
                      </h3>
                      <p className="text-[12px] text-[#666666] line-clamp-1 mt-0.5">
                        {node.vendor || "AI Research"}
                      </p>
                    </div>

                    {/* Meta Badges */}
                    <div className="space-y-2 mt-3 pt-3 border-t border-[#EFEFEA]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {paramsDisplay && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#333333] bg-white border border-[#E5E5E0] px-1.5 py-0.5 rounded">
                            <Cpu size={11} className="text-[#888888]" />
                            {paramsDisplay}
                          </span>
                        )}
                        {archDisplay && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#555555] bg-white border border-[#E5E5E0] px-1.5 py-0.5 rounded">
                            <Layers size={11} className="text-[#888888]" />
                            {archDisplay}
                          </span>
                        )}
                        {node.opennessType && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded">
                            <ShieldCheck size={10} />
                            {node.opennessType}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#888888]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {dateDisplay || "Released"}
                        </span>
                        {node.paperCount !== undefined && node.paperCount > 0 && (
                          <span className="font-mono text-[10px] text-[#666666]">
                            {node.paperCount} {node.paperCount === 1 ? "paper" : "papers"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Context note */}
      <div className="mt-4 pt-3 border-t border-[#F0EFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-[#777777]">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#FF5A1F]" />
          <span>
            Click any checkpoint node to inspect its specific architecture weights, benchmarks, and research papers.
          </span>
        </div>
        <Link
          href={`/models?search=${encodeURIComponent(familyName)}`}
          className="text-[#FF5A1F] hover:underline font-medium inline-flex items-center gap-1 shrink-0"
        >
          View all {familyName} variants →
        </Link>
      </div>
    </section>
  );
}
