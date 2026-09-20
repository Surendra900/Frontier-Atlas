"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PaperList from "@/components/PaperFeed";
import PaperTabs from "@/components/PaperTabs";
import HeroSection from "@/components/HeroSection";
import type { GetPapersResult } from "@/lib/paperApi";
import { getPapers } from "@/lib/paperApi";
import { prefetchMethods } from "@/lib/methodCache";

export default function HomeContent({
  initialPapers,
  initialError,
  initialPeriod = "Today",
}: {
  initialPapers: GetPapersResult | null;
  initialError?: string;
  initialPeriod?: string;
}) {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [activeSort, setActiveSort] = useState<string>("Trending Papers");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod);
  const [isFilterChanging, setIsFilterChanging] = useState(false);

  // Defer speculative background prefetching so initial feed & infinite scroll get 100% network bandwidth
  useEffect(() => {
    // Only pre-warm adjacent filters after the user has been on the page for 1.5s
    const timer = setTimeout(() => {
      const prefetch = async (params: Parameters<typeof getPapers>[0]) => {
        try { await getPapers(params); } catch {}
      };
      
      // Warm only the most immediate adjacent period and sorts
      prefetch({ sort: "trending", period: "week", page: 1 });
      setTimeout(() => prefetch({ sort: "latest", period: "today", page: 1 }), 200);
      setTimeout(() => prefetchMethods(), 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // --- FILTER HANDLERS ---
 const handleSidebarSelect = (label: string) => {
  if (
    label === "Trending Papers" ||
    label === "Latest Papers" ||
    label === "Most GitHub Stars" ||
    label === "GitHub Hourly"
  ) {
    setIsFilterChanging(true);
    setActiveSort(label);
  }
};

  const handlePeriodSelect = (period: string) => {
    setIsFilterChanging(true);
    setSelectedPeriod(period);
  };

  // Custom handler to ensure `isFilterChanging` triggers when a pill is clicked
  const handleTagSelect = (tag: string | undefined | ((prev: string | undefined) => string | undefined)) => {
    setIsFilterChanging(true);
    setSelectedTag(tag);
  };

  // Map the UI tab to API parameters
  const apiPeriod =
    selectedPeriod === "Today" ? "today" :
      selectedPeriod === "This Week" ? "week" :
        selectedPeriod === "This Month" ? "month" : "all";

  const apiSort =
    activeSort === "Trending Papers"
      ? "trending"
      : activeSort === "Most GitHub Stars"
      ? "stars"
      : activeSort === "GitHub Hourly"
      ? "hourly"
      : "latest";

  // Distinguish methods from tasks and ensure case-insensitivity
 const isMethod =
  selectedTag?.toLowerCase() === "model-context-protocol-mcp";
  const dynamicFilterParams: Record<string, string> = { sort: apiSort };

  if (selectedTag) {
    if (isMethod) {
      dynamicFilterParams.method = selectedTag.toLowerCase();
    } else {
      dynamicFilterParams.task = selectedTag.toLowerCase(); 
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar activeSort={activeSort} onItemSelect={handleSidebarSelect} />
      <div
        id="scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col"
      >
        {/* Hero Section Container */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-3">
          <HeroSection
            selectedTag={selectedTag}
            setSelectedTag={handleTagSelect as any}
          />
        </div>

        {/* 3-Column Layout */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-4 pb-12 flex items-start gap-5 lg:gap-8 xl:gap-10">
          <div className="hidden lg:block w-[240px] shrink-0 sticky top-3 h-[calc(100vh-80px)]">
            <Sidebar initialActive={activeSort} onItemSelect={handleSidebarSelect} />
          </div>

          <main className="flex-1 min-w-0 max-w-[1380px]">
            <PaperTabs selectedPeriod={selectedPeriod} onPeriodSelect={handlePeriodSelect} />
            <PaperList
              selectedTag={isMethod ? undefined : selectedTag}
              period={apiPeriod}
              filterParams={dynamicFilterParams}
              initialPapers={initialPapers}
              initialError={initialError}
              isFilterChanging={isFilterChanging}
              onFilterDone={() => setIsFilterChanging(false)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}