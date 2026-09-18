"use client";

import { cn } from "@/lib/utils";
import { getPapers } from "@/lib/paperApi";

const TIME_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

type TimeFilter = typeof TIME_FILTERS[number]["value"];

interface TimeFilterTabsProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

export default function TimeFilterTabs({ activeFilter, onFilterChange }: TimeFilterTabsProps) {
  const handleHover = (period: string) => {
    getPapers({ page: 1, sort: "trending", period }).catch(() => {});
    getPapers({ page: 1, sort: "latest", period }).catch(() => {});
  };

  return (
    <div className="flex items-center gap-1 mb-4">
      {TIME_FILTERS.map((filter) => (
        <button
          key={filter.value}
          onMouseEnter={() => handleHover(filter.value)}
          onTouchStart={() => handleHover(filter.value)}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 rounded-lg text-[13px] font-bold transition-colors",
            activeFilter === filter.value
              ? "bg-[#EBEBE6] text-[#F55036]"
              : "text-[#8B8B8B] hover:bg-[#EBEBE6] hover:text-[#111111]"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export type { TimeFilter };
