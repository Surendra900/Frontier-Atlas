"use client";

import { FileText, MessageCircle, Star } from "lucide-react";
import { type ModelItem, type ModelTask, prefetchModelBySlug } from "@/lib/models";
import Link from "next/link";

const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  purple: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", dot: "bg-[#9333EA]" },
  blue: { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", dot: "bg-[#0284C7]" },
  green: { bg: "bg-[#ECFDF5]", text: "text-[#047857]", dot: "bg-[#10B981]" },
  cyan: { bg: "bg-[#CFFAFE]", text: "text-[#0E7490]", dot: "bg-[#06B6D4]" },
};

const TASK_COLOR_HEX_MAP: Record<string, string> = {
  "#9333EA": "purple",
  "#0284C7": "blue",
  "#10B981": "green",
  "#06B6D4": "cyan",
};

function getTagColorKey(task: ModelTask): string {
  if (task.color && TASK_COLOR_HEX_MAP[task.color]) {
    return TASK_COLOR_HEX_MAP[task.color];
  }
  const colors = ["purple", "blue", "green", "cyan"];
  let hash = 0;
  for (let i = 0; i < task.name.length; i++) {
    hash = task.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function TaskTag({ task }: { task: ModelTask }) {
  const c = TAG_COLORS[getTagColorKey(task)];
  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded-[4px] text-[10px] font-medium whitespace-nowrap ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${c.dot}`} />
      {task.name}
    </span>
  );
}

function getInitial(name: string) {
  return (name || "M").trim().charAt(0).toUpperCase();
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export default function ModelCard({ model, rank: _rank }: { model: ModelItem; rank?: number }) {
  const latestPaperDate = model.latestPaperDate ? new Date(model.latestPaperDate) : null;
  const latestPaperLabel = latestPaperDate
    ? latestPaperDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No papers available yet";

  return (
    <Link
      href={`/models/${model.slug}`}
      onMouseEnter={() => prefetchModelBySlug(model.slug)}
      data-rank={_rank}
      className="ds-card p-4 md:p-5 flex flex-col gap-4 hover:shadow-soft transition-shadow duration-200 group no-underline h-full rounded-[24px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center text-[15px] font-semibold shrink-0 shadow-sm">
            {getInitial(model.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-[18px] md:text-[19px] font-semibold text-[#111111] group-hover:text-[#F55036] transition-colors leading-tight truncate">
              {model.name}
            </h3>
          </div>
        </div>

        <div className="shrink-0 rounded-full border border-[#EAE6DE] bg-[#FBFAF7] px-2.5 py-1 text-[11px] font-medium text-[#555555]">
          {formatCompact(model.paperCount)} papers
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[9px] uppercase tracking-[0.4em] text-[#B0ABA0]">
          Latest Paper
        </div>
        {model.latestPaperTitle ? (
          <p className="text-[14px] md:text-[15px] font-medium text-[#111111] leading-snug line-clamp-2">
            {model.latestPaperTitle}
          </p>
        ) : (
          <p className="text-[14px] md:text-[15px] font-medium text-[#111111] leading-snug">
            No papers available yet.
          </p>
        )}
        <p className="text-[12px] text-[#8B8B8B]">{latestPaperLabel}</p>
      </div>

      {model.tasks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {model.tasks.map((task) => (
            <TaskTag key={task.id} task={task} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="rounded-[14px] border border-[#EAE6DE] bg-[#FBFAF7] px-3 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#8B8B8B] text-[11px] uppercase tracking-[0.18em]">
            <FileText size={12} />
            Papers
          </div>
          <div className="text-[15px] font-semibold text-[#111111] leading-none">
            {formatCompact(model.paperCount)}
          </div>
        </div>

        <div className="rounded-[14px] border border-[#EAE6DE] bg-[#FBFAF7] px-3 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#8B8B8B] text-[11px] uppercase tracking-[0.18em]">
            <Star size={12} />
            Stars
          </div>
          <div className="text-[15px] font-semibold text-[#111111] leading-none">
            {formatCompact(model.githubStars)}
          </div>
        </div>

        <div className="rounded-[14px] border border-[#EAE6DE] bg-[#FBFAF7] px-3 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#8B8B8B] text-[11px] uppercase tracking-[0.18em]">
            <MessageCircle size={12} />
            Citations
          </div>
          <div className="text-[15px] font-semibold text-[#111111] leading-none">
            {formatCompact(model.citationCount)}
          </div>
        </div>
      </div>
    </Link>
  );
}
