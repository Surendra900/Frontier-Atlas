"use client";

import { useState } from "react";
import TaskFilterBar from "./TaskFilterBar";
import PaperTabs from "@/components/PaperTabs";
import PaperList from "@/components/PaperFeed";
import type { GetPapersResult } from "@/lib/paperApi";

interface Props {
  slug: string;
  initialPapers?: GetPapersResult | null;
}

const PERIOD_MAP: Record<string, string> = {
  Latest: "all",
  Today: "all",
  "This Week": "week",
  "This Month": "month",
  "All time": "all",
};

export default function TaskDetailClient({ slug, initialPapers }: Props) {
  const [sort, setSort] = useState<"popular" | "latest" | "citations">("popular");
  const [period, setPeriod] = useState<string>("All time");

  const rawSlug = (slug || "").trim().toLowerCase();
  const safeSlug =
    rawSlug === "reasoning"
      ? "reasoning-models"
      : rawSlug === "ss1" || rawSlug === "ssl"
      ? "small-language-models"
      : rawSlug;

  const isLatest = period === "Latest";
  const mappedPeriod = isLatest ? "all" : (PERIOD_MAP[period] || "all");
  const effectiveSort = isLatest ? "latest" : sort;

  return (
    <>
      <TaskFilterBar
        selectedSort={effectiveSort}
        onSortChange={setSort}
      />
      <PaperTabs selectedPeriod={period} onPeriodSelect={setPeriod} />

      <PaperList
        filterParams={{
          task: safeSlug,
          sort: effectiveSort,
        }}
        period={mappedPeriod}
        initialPapers={sort === "popular" && period === "All time" ? initialPapers ?? null : null}
      />
    </>
  );
}