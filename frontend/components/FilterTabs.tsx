"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPapers } from "@/lib/paperApi";

const filterTabs = ["Today", "This Week", "This Month", "All time"];
const TAB_TO_PERIOD: Record<string, string> = {
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "All time": "all",
};

interface FilterTabsProps {
  onSelect?: (tab: string) => void;
}

export default function FilterTabs({ onSelect }: FilterTabsProps) {
  const [activeTab, setActiveTab] = useState("Today");

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    onSelect?.(tab);
  };

  const handleHover = (tab: string) => {
    const period = TAB_TO_PERIOD[tab] || "all";
    getPapers({ page: 1, sort: "trending", period }).catch(() => {});
    getPapers({ page: 1, sort: "latest", period }).catch(() => {});
  };

  return (
    <div className="flex items-center border-b border-gray-200 mb-0 -mx-4 px-4 overflow-x-auto hide-scroll">
      {filterTabs.map((tab) => (
        <button
          key={tab}
          onMouseEnter={() => handleHover(tab)}
          onTouchStart={() => handleHover(tab)}
          onClick={() => handleSelect(tab)}
          className={cn(
            "px-3 py-2.5 text-[13px] font-medium cursor-pointer transition-colors border-b-2 -mb-px",
            tab === activeTab
              ? "text-[#7c3aed] border-[#7c3aed]"
              : "text-gray-500 border-transparent hover:text-gray-800"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
