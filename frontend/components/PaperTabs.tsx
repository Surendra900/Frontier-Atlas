"use client";

import { useState } from "react";
import { getPapers } from "@/lib/paperApi";

const TABS = ["Today", "This Week", "This Month", "All time"];
const TAB_TO_PERIOD: Record<string, string> = {
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "All time": "all",
};

interface PaperTabsProps {
  selectedPeriod?: string;
  onPeriodSelect?: (period: string) => void;
}

export default function PaperTabs({
  selectedPeriod,
  onPeriodSelect,
}: PaperTabsProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState("Today");
  const activeTab = selectedPeriod ?? internalActiveTab;

  const handleTabClick = (tab: string) => {
    if (selectedPeriod === undefined) {
      setInternalActiveTab(tab);
    }
    onPeriodSelect?.(tab);
  };

  const handleTabHover = (tab: string) => {
    const period = TAB_TO_PERIOD[tab] || "all";
    getPapers({ page: 1, sort: "trending", period }).catch(() => {});
    getPapers({ page: 1, sort: "latest", period }).catch(() => {});
    getPapers({ page: 1, sort: "stars", period }).catch(() => {});
  };

  return (
    <div className="border-b border-[#E5E5E0] mb-0 sm:mb-1">
      <div className="flex gap-4 sm:gap-8 overflow-x-auto hide-scroll snap-x snap-mandatory">
        {TABS.map((tab) => (
          <button
            key={tab}
            onMouseEnter={() => handleTabHover(tab)}
            onTouchStart={() => handleTabHover(tab)}
            onClick={() => handleTabClick(tab)}
            className={`py-3.5 sm:py-3 text-[14px] sm:text-[13px] border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap snap-start sm:snap-none
              ${activeTab.toLowerCase() === tab.toLowerCase()
                ? "text-[#111111] border-[#F55036] font-semibold"
                : "text-[#8B8B8B] border-transparent hover:text-[#555555] hover:border-[#E5E5E0] font-normal"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
