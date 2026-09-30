"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(undefined);
  const [activeSort, setActiveSort] = useState<string>("Trending Papers");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod);

  // ---------------------------------------------------------------------------
  // URL Synchronization Helper
  // ---------------------------------------------------------------------------

  const updateUrlParams = useCallback((paramsToSet: Record<string, string | undefined>) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    // If setting a task or method, clear sort/period unless explicitly passed
    if (("task" in paramsToSet || "method" in paramsToSet) && !("sort" in paramsToSet)) {
      url.searchParams.delete("sort");
      url.searchParams.delete("period");
    }

    // If setting a feed sort, clear task/method
    if ("sort" in paramsToSet && !("task" in paramsToSet || "method" in paramsToSet)) {
      url.searchParams.delete("task");
      url.searchParams.delete("method");
    }

    for (const [key, value] of Object.entries(paramsToSet)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }
    const cleanUrl = url.pathname + (url.search ? url.search : "");
    window.history.pushState({}, "", cleanUrl);
  }, []);

  // ---------------------------------------------------------------------------
  // Initialize and Sync from URL on Mount and PopState
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const taskParam = params.get("task");
      const methodParam = params.get("method");
      const sortParam = params.get("sort");
      const periodParam = params.get("period");

      if (taskParam) {
        const normalized = taskParam.toLowerCase() === "reasoning" ? "reasoning-models" : taskParam;
        setSelectedTag(normalized);
        setSelectedMethod(undefined);
        setActiveSort("");
      } else if (methodParam) {
        setSelectedMethod(methodParam);
        setSelectedTag(undefined);
        setActiveSort("");
      } else if (sortParam) {
        setSelectedTag(undefined);
        setSelectedMethod(undefined);
        if (sortParam === "latest") {
          setActiveSort("Latest Papers");
          setSelectedPeriod("Latest");
        } else if (sortParam === "stars") {
          setActiveSort("Most GitHub Stars");
        } else {
          setActiveSort("Trending Papers");
        }
      }

      if (periodParam) {
        if (periodParam === "today" || periodParam === "latest") setSelectedPeriod("Latest");
        else if (periodParam === "week") setSelectedPeriod("This Week");
        else if (periodParam === "month") setSelectedPeriod("This Month");
        else setSelectedPeriod("All time");
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // ---------------------------------------------------------------------------
  // Prefetch commonly used paper views
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      getPapers({
        page: 1,
        sort: "trending",
        period: "all",
      }).catch(() => {});

      getPapers({
        page: 1,
        sort: "latest",
        period: "all",
      }).catch(() => {});

      prefetchMethods();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // Sidebar filter: handles discover, task, and method in-place
  // ---------------------------------------------------------------------------

  const handleSidebarSelect = (
    label: string,
    slug?: string,
    categoryType?: "discover" | "task" | "method"
  ) => {
    if (categoryType === "task" && slug) {
      const normalizedSlug = slug.toLowerCase() === "reasoning" ? "reasoning-models" : slug;
      setSelectedTag(normalizedSlug);
      setSelectedMethod(undefined);
      setActiveSort(label);
      setSelectedPeriod("All time");
      updateUrlParams({ task: normalizedSlug, method: undefined, sort: undefined, period: undefined });
      return;
    }

    if (categoryType === "method" && slug) {
      setSelectedMethod(slug);
      setSelectedTag(undefined);
      setActiveSort(label);
      setSelectedPeriod("All time");
      updateUrlParams({ method: slug, task: undefined, sort: undefined, period: undefined });
      return;
    }

    // Discover or general feed
    setSelectedTag(undefined);
    setSelectedMethod(undefined);

    if (label === "Latest Papers" || slug === "latest") {
      setActiveSort("Latest Papers");
      setSelectedPeriod("Latest");
      updateUrlParams({ sort: "latest", period: undefined, task: undefined, method: undefined });
    } else if (label === "Most GitHub Stars" || slug === "github-stars") {
      setActiveSort("Most GitHub Stars");
      setSelectedPeriod("All time");
      updateUrlParams({ sort: "stars", period: undefined, task: undefined, method: undefined });
    } else {
      setActiveSort("Trending Papers");
      setSelectedPeriod("All time");
      updateUrlParams({ sort: "trending", period: undefined, task: undefined, method: undefined });
    }
  };

  // ---------------------------------------------------------------------------
  // Period filter
  // ---------------------------------------------------------------------------

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);

    const isSelectingLatest = period === "Latest";
    const mappedPeriod =
      isSelectingLatest
        ? "all"
        : period === "This Week"
          ? "week"
          : period === "This Month"
            ? "month"
            : "all";

    const currentSort =
      isSelectingLatest
        ? "latest"
        : activeSort === "Most GitHub Stars"
          ? "stars"
          : activeSort === "Latest Papers"
            ? "latest"
            : "trending";

    if (isSelectingLatest) {
      setActiveSort("Latest Papers");
    }

    if (selectedTag) {
      updateUrlParams({
        task: selectedTag,
        period: mappedPeriod !== "all" ? mappedPeriod : undefined,
      });
    } else if (selectedMethod) {
      updateUrlParams({
        method: selectedMethod,
        period: mappedPeriod !== "all" ? mappedPeriod : undefined,
      });
    } else {
      updateUrlParams({
        sort: isSelectingLatest ? "latest" : currentSort,
        period: mappedPeriod !== "all" ? mappedPeriod : undefined,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Hero Tag filter
  // ---------------------------------------------------------------------------

  const handleTagSelect = (
    tag:
      | string
      | undefined
      | ((prev: string | undefined) => string | undefined)
  ) => {
    const resolvedTag = typeof tag === "function" ? tag(selectedTag) : tag;
    setSelectedMethod(undefined);
    if (!resolvedTag) {
      setSelectedTag(undefined);
      setActiveSort("Trending Papers");
      updateUrlParams({ task: undefined, method: undefined, sort: "trending", period: undefined });
      return;
    }
    const clean = resolvedTag.toLowerCase().trim();
    if (clean === "model-context-protocol-mcp" || clean === "mcp") {
      setSelectedMethod("mcp");
      setSelectedTag(undefined);
      setActiveSort("Model Context Protocol");
      updateUrlParams({ method: "mcp", task: undefined, sort: undefined, period: undefined });
    } else {
      const normalized = clean === "reasoning" ? "reasoning-models" : clean;
      setSelectedTag(normalized);
      setActiveSort("");
      updateUrlParams({ task: normalized, method: undefined, sort: undefined, period: undefined });
    }
  };

  // ---------------------------------------------------------------------------
  // Convert UI state to API query parameters
  // "Latest" tab means chronological sort=latest across all papers, never 0-result period=today
  // ---------------------------------------------------------------------------

  const isLatest = selectedPeriod === "Latest" || activeSort === "Latest Papers";
  const apiPeriod =
    isLatest
      ? "all"
      : selectedPeriod === "This Week"
        ? "week"
        : selectedPeriod === "This Month"
          ? "month"
          : "all";

  const apiSort =
    isLatest
      ? "latest"
      : activeSort === "Trending Papers"
        ? "trending"
        : activeSort === "Most GitHub Stars"
          ? "stars"
          : "latest";

  // ---------------------------------------------------------------------------
  // Build dynamic API filters
  // ---------------------------------------------------------------------------

  const dynamicFilterParams: Record<string, string> = {
    sort: apiSort,
    period: apiPeriod,
  };

  if (selectedMethod) {
    const cleanMethod = selectedMethod.toLowerCase().trim();
    dynamicFilterParams.method =
      cleanMethod === "policy-learning" || cleanMethod === "reinforcement-learning"
        ? "policy-learning"
        : cleanMethod === "diffusion-models" || cleanMethod === "diffusion"
        ? "diffusion-models"
        : cleanMethod === "transformer" || cleanMethod === "transformers"
        ? "transformer"
        : cleanMethod === "rag" || cleanMethod === "retrieval-augmented-generation"
        ? "retrieval-augmented-generation"
        : cleanMethod;
  } else if (selectedTag) {
    const cleanTag = selectedTag.toLowerCase().trim();
    if (cleanTag === "model-context-protocol-mcp" || cleanTag === "mcp") {
      dynamicFilterParams.method = "mcp";
    } else if (cleanTag === "reasoning") {
      dynamicFilterParams.task = "reasoning-models";
    } else {
      dynamicFilterParams.task = cleanTag;
    }
  }

  // ---------------------------------------------------------------------------
  // Homepage Render
  // ---------------------------------------------------------------------------

  const isDefaultView =
    !selectedTag &&
    !selectedMethod &&
    activeSort === "Trending Papers" &&
    selectedPeriod === "All time";

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
              selectedTag={selectedMethod ? undefined : selectedTag}
              period={apiPeriod}
              filterParams={dynamicFilterParams}
              initialPapers={isDefaultView ? initialPapers : null}
              initialError={initialError}
            />
          </main>
        </section>

        <div className="h-0 w-full" />
      </div>
    </div>
  );
}
