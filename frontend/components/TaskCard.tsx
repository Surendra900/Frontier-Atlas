"use client";

import type { TaskItem } from "@/lib/tasks";
import Link from "next/link";

const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  purple: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", dot: "bg-[#9333EA]" },
  blue: { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", dot: "bg-[#0284C7]" },
  green: { bg: "bg-[#ECFDF5]", text: "text-[#047857]", dot: "bg-[#10B981]" },
  orange: { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]", dot: "bg-[#EA580C]" },
  red: { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]", dot: "bg-[#EF4444]" },
  pink: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]", dot: "bg-[#EC4899]" },
  gray: { bg: "bg-white", text: "text-[#111111]", dot: "" },
};

function getTagColorKey(color: string | null): string {
  const map: Record<string, string> = {
    "#9333EA": "purple",
    "#0284C7": "blue",
    "#10B981": "green",
    "#EA580C": "orange",
    "#EF4444": "red",
    "#EC4899": "pink",
  };
  return (color && map[color]) || "gray";
}

function ColorDot({ color }: { color: string | null }) {
  if (!color) return null;
  const key = getTagColorKey(color);
  const c = TAG_COLORS[key] || TAG_COLORS.gray;
  return <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />;
}

export default function TaskCard({ task }: { task: TaskItem }) {
  return (
    <Link
      href={`/tasks/${task.slug}`}
      className="ds-card p-5 flex flex-col gap-3 hover:shadow-soft transition-shadow duration-200 group no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ColorDot color={task.color} />
          <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#F55036] transition-colors leading-snug truncate">
            {task.name}
          </h3>
        </div>
        <span className="ds-text-muted text-[11px] shrink-0 mt-0.5">
          {task.slug}
        </span>
      </div>
    </Link>
  );
}
