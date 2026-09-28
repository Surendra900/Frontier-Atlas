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
  initialPeriod = "All time",
}: {
  initialPapers: GetPapersResult | null;
  initialError?: string;
  initialPeriod?: string;
}) {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(
    undefined
  );

  const [activeSort, setActiveSort] =
    useState<string>("");

  const [selectedPeriod, setSelectedPeriod] =
    useState<string>(initialPeriod);

  // ---------------------------------------------------------------------------
  // Prefetch commonly used paper views
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      getPapers({
        page: 1,
        sort: "trending",
        period: "week",
      }).catch(() => {});

      getPapers({
        page: 1,
        sort: "trending",
        period: "all",
      }).catch(() => {});

      prefetchMethods();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // Sidebar filter
  // ---------------------------------------------------------------------------

  const handleSidebarSelect = (label: string) => {
    if (
      label === "Trending Papers" ||
      label === "Latest Papers" ||
      label === "Most GitHub Stars"
    ) {
      setActiveSort(label);

      // Discover options should always show All time
      setSelectedPeriod("All time");
    }
  };

  // ---------------------------------------------------------------------------
  // Period filter
  // ---------------------------------------------------------------------------

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
  };

  // ---------------------------------------------------------------------------
  // Tag filter
  // ---------------------------------------------------------------------------

  const handleTagSelect = (
    tag:
      | string
      | undefined
      | ((prev: string | undefined) => string | undefined)
  ) => {
    setSelectedTag(tag);
  };

  // ---------------------------------------------------------------------------
  // Convert UI period to API period
  // ---------------------------------------------------------------------------

  const apiPeriod =
    selectedPeriod === "Latest"
      ? "today"
      : selectedPeriod === "This Week"
        ? "week"
        : selectedPeriod === "This Month"
          ? "month"
          : "all";

  // ---------------------------------------------------------------------------
  // Convert UI sort to API sort
  // ---------------------------------------------------------------------------

  const apiSort =
    activeSort === "Trending Papers"
      ? "trending"
      : activeSort === "Most GitHub Stars"
        ? "stars"
        : "latest";

  // ---------------------------------------------------------------------------
  // Detect MCP method filter
  // ---------------------------------------------------------------------------

  const isMethod =
    selectedTag?.toLowerCase() === "model-context-protocol-mcp";

  // ---------------------------------------------------------------------------
  // Build dynamic API filters
  // ---------------------------------------------------------------------------

  const dynamicFilterParams: Record<string, string> = {
    sort: apiSort,
  };

  if (selectedTag) {
    if (isMethod) {
      dynamicFilterParams.method = selectedTag.toLowerCase();
    } else {
      dynamicFilterParams.task = selectedTag.toLowerCase();
    }
  }

  // ---------------------------------------------------------------------------
  // Homepage
  //
  // The homepage uses normal browser document scrolling.
  // Do NOT add h-screen, overflow-hidden, or an internal scroll container.
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full bg-[#F8F7F2] text-[#111111]">

      <Navbar
        activeSort={activeSort}
        onItemSelect={handleSidebarSelect}
      />

      <div className="w-full">

        {/* HERO SECTION */}

        <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-3">
          <HeroSection
            selectedTag={selectedTag}
            setSelectedTag={handleTagSelect as any}
            onPeriodSelect={handlePeriodSelect}
          />
        </section>

        {/* PAPERS AREA */}

        <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-0 pb-0 flex items-start gap-5 lg:gap-8 xl:gap-10">

          {/* DESKTOP SIDEBAR */}

          <aside className="hidden lg:block w-[240px] shrink-0 sticky top-[68px] self-start">
            <Sidebar
              initialActive={activeSort}
              onItemSelect={handleSidebarSelect}
            />
          </aside>

          {/* MAIN PAPER CONTENT */}

          <main className="flex-1 min-w-0 max-w-[1380px]">

            <PaperTabs
              selectedPeriod={selectedPeriod}
              onPeriodSelect={handlePeriodSelect}
            />

            <PaperList
              selectedTag={isMethod ? undefined : selectedTag}
              period={apiPeriod}
              filterParams={dynamicFilterParams}
              initialPapers={initialPapers}
              initialError={initialError}
            />

          </main>
        </section>

        {/* NO EXTRA BOTTOM SPACE */}

        <div className="h-0 w-full" />

      </div>
    </div>
  );
}
