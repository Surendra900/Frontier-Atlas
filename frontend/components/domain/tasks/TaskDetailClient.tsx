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
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "All time": "all",
};

export default function TaskDetailClient({ slug, initialPapers }: Props) {
  const [sort, setSort] = useState<"popular" | "latest" | "citations">("popular");
  const [period, setPeriod] = useState<string>("All time");

  const safeSlug = (slug || "").trim();
  const mappedPeriod = PERIOD_MAP[period] || "all";

  return (
    <>
      <TaskFilterBar
        selectedSort={sort}
        onSortChange={setSort}
      />
      <PaperTabs selectedPeriod={period} onPeriodSelect={setPeriod} />

      <PaperList
        filterParams={{
          task: safeSlug,
          sort,
        }}
        period={mappedPeriod}
        initialPapers={sort === "popular" && period === "All time" ? initialPapers ?? null : null}
      />
    </>
  );
}