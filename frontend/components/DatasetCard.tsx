"use client";

import { Calendar } from "lucide-react";
import type { DatasetItem } from "@/lib/datasets";
import Link from "next/link";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function DatasetCard({ dataset }: { dataset: DatasetItem }) {
  const createdDate = new Date(dataset.createdAt);
  const isNew = Date.now() - createdDate.getTime() < THIRTY_DAYS_MS;

  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="ds-card p-5 flex flex-col gap-3 hover:shadow-soft transition-shadow duration-200 group no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#F55036] transition-colors leading-snug truncate">
            {dataset.name}
          </h3>
          {isNew && (
            <span className="shrink-0 ds-chip text-[10px] px-2 py-0.5">
              New
            </span>
          )}
        </div>
        <span className="ds-text-muted text-[11px] shrink-0 mt-0.5">
          {dataset.slug}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[13px] text-[#555555]">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="text-[#8B8B8B]" />
          {createdDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
