"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Cpu,
  X,
  Building2,
  Filter,
  RotateCcw,
  Check,
  Layers,
  Layers2,
  FileText,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import {
  type ModelItem,
  type CardMeta,
  getModels,
} from "@/lib/models";
import type { ModelDbFacets } from "@/lib/models-db";

// Helper: format large numbers
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 0)}K`;
  return value.toLocaleString();
}

// Helper: format pricing
function formatPrice(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  if (val === 0) return "$0.00";
  if (val < 0.01) return `$${val.toFixed(4)}`;
  if (val < 1) return `$${val.toFixed(2)}`;
  return `$${val.toFixed(2)}`;
}

// Helper: format date
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

interface ModelsListingClientProps {
  initialSlug: string;
  initialMeta: CardMeta;
  initialModels: ModelItem[];
  initialTotal: number;
  initialFacets?: ModelDbFacets;
}

export default function ModelsListingClient({
  initialSlug,
  initialMeta,
  initialModels,
  initialTotal,
  initialFacets,
}: ModelsListingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params
  const querySearch = searchParams.get("q") || searchParams.get("search") || "";
  const queryVendor = searchParams.get("vendor") || "all";
  const queryModality = searchParams.get("modality") || "all";
  const queryOpenness = searchParams.get("openness") || "all";
  const queryCapability = searchParams.get("capability") || "all";
  const queryContext = searchParams.get("context") || "0";
  const queryPrice = searchParams.get("price") || "0";
  const querySort = searchParams.get("sort") || "newest";
  const queryView = (searchParams.get("view") as "table" | "grid") || "table";
  const queryModelSlug = searchParams.get("model") || "";

  // Component state
  const [models, setModels] = useState<ModelItem[]>(initialModels);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [cardMeta] = useState<CardMeta>(initialMeta);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedVendor, setSelectedVendor] = useState(queryVendor);
  const [selectedModality, setSelectedModality] = useState(queryModality);
  const [selectedOpenness, setSelectedOpenness] = useState(queryOpenness);
  const [selectedCapability, setSelectedCapability] = useState(queryCapability);
  const [selectedContext, setSelectedContext] = useState(queryContext);
  const [selectedPrice, setSelectedPrice] = useState(queryPrice);
  const [sortBy, setSortBy] = useState(querySort);
  const [viewMode, setViewMode] = useState<"table" | "grid">(queryView);

  // Detail Drawer state
  const [activeModelDetails, setActiveModelDetails] = useState<ModelItem | null>(null);

  // Sync drawer with URL ?model=<slug>
  useEffect(() => {
    if (queryModelSlug && models.length > 0) {
      const match = models.find(
        (m) => m.slug.toLowerCase() === queryModelSlug.toLowerCase() || m.id.toLowerCase() === queryModelSlug.toLowerCase()
      );
      if (match) {
        setActiveModelDetails(match);
      }
    }
  }, [queryModelSlug, models]);

  // Keyboard shortcut: Escape closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModelDetails) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModelDetails]);

  const openDrawer = (model: ModelItem) => {
    setActiveModelDetails(model);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("model", model.slug);
    router.replace(`/models/${initialSlug}?${current.toString()}`, { scroll: false });
  };

  const closeDrawer = () => {
    setActiveModelDetails(null);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("model");
    const qStr = current.toString();
    router.replace(qStr ? `/models/${initialSlug}?${qStr}` : `/models/${initialSlug}`, { scroll: false });
  };

  // Update URL state when filters change
  const updateQueryState = useCallback((updates: Record<string, string | number | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === "all" || v === 0 || v === "0") {
        current.delete(k);
      } else {
        current.set(k, String(v));
      }
    }
    const qStr = current.toString();
    router.replace(qStr ? `/models/${initialSlug}?${qStr}` : `/models/${initialSlug}`, { scroll: false });
  }, [initialSlug, router, searchParams]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedVendor("all");
    setSelectedModality("all");
    setSelectedOpenness("all");
    setSelectedCapability("all");
    setSelectedContext("0");
    setSelectedPrice("0");
    setSortBy("newest");
    router.replace(`/models/${initialSlug}`, { scroll: false });
  };

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(query);
        const matchesVendor = m.vendor?.toLowerCase().includes(query);
        const matchesFamily = m.modelFamily?.toLowerCase().includes(query);
        const matchesDesc = m.description?.toLowerCase().includes(query);
        const matchesSlug = m.slug?.toLowerCase().includes(query);
        if (!matchesName && !matchesVendor && !matchesFamily && !matchesDesc && !matchesSlug) {
          return false;
        }
      }

      if (selectedVendor !== "all" && m.vendor?.toLowerCase() !== selectedVendor.toLowerCase()) {
        return false;
      }

      if (selectedModality !== "all" && m.modality?.toLowerCase() !== selectedModality.toLowerCase()) {
        return false;
      }

      if (selectedOpenness === "open_weights" && m.opennessType !== "Open Weights") {
        return false;
      }
      if (selectedOpenness === "proprietary" && m.opennessType !== "Proprietary") {
        return false;
      }

      if (selectedCapability !== "all") {
        const caps = (m.capabilities || []).map((c) => c.toLowerCase());
        const target = selectedCapability.toLowerCase();
        const cat = (m.category || "").toLowerCase();

        const match =
          caps.includes(target) ||
          (target === "reasoning" && (cat.includes("reasoning") || caps.includes("math"))) ||
          (target === "coding" && (cat.includes("code") || caps.includes("code"))) ||
          (target === "vision" && (cat.includes("vision") || caps.includes("multimodal")));

        if (!match) return false;
      }

      const ctxNum = typeof m.contextWindow === "number" ? m.contextWindow : parseInt(String(m.contextWindow || 0), 10);
      const minCtx = parseInt(selectedContext, 10);
      if (minCtx > 0 && ctxNum < minCtx) return false;

      const maxP = parseFloat(selectedPrice);
      if (maxP > 0 && (m.inputCostPerMtoken || 0) > maxP) return false;

      return true;
    });
  }, [
    models,
    searchTerm,
    selectedVendor,
    selectedModality,
    selectedOpenness,
    selectedCapability,
    selectedContext,
    selectedPrice,
  ]);

  // Sorted models
  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "price_asc") {
        return (a.inputCostPerMtoken ?? 0) - (b.inputCostPerMtoken ?? 0);
      }
      if (sortBy === "price_desc") {
        return (b.inputCostPerMtoken ?? 0) - (a.inputCostPerMtoken ?? 0);
      }
      if (sortBy === "context_desc" || sortBy === "context") {
        const ca = typeof a.contextWindow === "number" ? a.contextWindow : parseInt(String(a.contextWindow || 0), 10);
        const cb = typeof b.contextWindow === "number" ? b.contextWindow : parseInt(String(b.contextWindow || 0), 10);
        return cb - ca;
      }
      if (sortBy === "trending") {
        return (b.trendingScore ?? 50) - (a.trendingScore ?? 50);
      }
      // default "newest"
      const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return db - da;
    });
  }, [filteredModels, sortBy]);

  // Derived filter options & counts from initialFacets and loaded models
  const vendorCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of models) {
      if (m.vendor) {
        map.set(m.vendor, (map.get(m.vendor) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [models]);

  const capabilityPills = [
    { id: "all", label: "All Capabilities" },
    { id: "reasoning", label: "Reasoning" },
    { id: "coding", label: "Coding" },
    { id: "vision", label: "Computer Vision" },
    { id: "tools", label: "Tool Use" },
    { id: "document_ai", label: "Document AI" },
    { id: "agents", label: "Agentic" },
  ];

  const totalWithPapers = useMemo(() => {
    return filteredModels.filter((m) => (m.paperCount && m.paperCount > 0) || (m.papers && m.papers.length > 0)).length;
  }, [filteredModels]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedVendor !== "all" ||
    selectedModality !== "all" ||
    selectedOpenness !== "all" ||
    selectedCapability !== "all" ||
    selectedContext !== "0" ||
    selectedPrice !== "0";

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#111827]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#FF5A1F] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/models" className="hover:text-[#FF5A1F] transition-colors">
            Models
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#111827] capitalize">
            {cardMeta.title}
          </span>
        </nav>

        {/* Section Header */}
        <div className="bg-white border border-[#E5E5E0] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                  {cardMeta.title}
                </h1>
                <span className="bg-[#FF5A1F]/10 text-[#FF5A1F] font-mono text-xs font-semibold px-2.5 py-1 rounded-full border border-[#FF5A1F]/20">
                  {cardMeta.totalModels || totalCount} Models
                </span>
              </div>
              <p className="text-sm text-[#4B5563] max-w-3xl leading-relaxed">
                {cardMeta.description}
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-4 shrink-0 bg-[#FAF9F5] px-4 py-3 rounded-xl border border-[#E5E5E0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8B8B8B] tracking-wider block">
                  Mapped Papers
                </span>
                <span className="text-lg font-mono font-bold text-[#FF5A1F]">
                  {totalWithPapers}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-[#E5E5E0]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8B8B8B] tracking-wider block">
                  Catalog View
                </span>
                <span className="text-xs font-semibold text-[#111827] capitalize">
                  {cardMeta.type}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Capability Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-6 mt-6 border-t border-[#F0EFEA] no-scrollbar">
            {capabilityPills.map((pill) => {
              const isActive = selectedCapability === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    const next = isActive ? "all" : pill.id;
                    setSelectedCapability(next);
                    updateQueryState({ capability: next });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#FF5A1F] text-white shadow-xs font-semibold"
                      : "bg-[#FAF9F5] text-[#4B5563] border border-[#E5E5E0] hover:border-[#D1D5DB] hover:text-[#111827]"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sorters, View Mode Toggle */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-4 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateQueryState({ q: e.target.value });
                }}
                placeholder="Search by model name, architecture, family, or vendor (e.g. GPT-4o, Claude, DeepSeek)..."
                className="w-full pl-10 pr-4 py-2 bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    updateQueryState({ q: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode & Sorters */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateQueryState({ sort: e.target.value });
                  }}
                  className="appearance-none bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[#374151] hover:border-[#D1D5DB] focus:outline-hidden focus:border-[#FF5A1F]"
                >
                  <option value="newest">Sort: Recently Released</option>
                  <option value="trending">Sort: Trending Score</option>
                  <option value="name">Sort: Model Name (A-Z)</option>
                  <option value="price_asc">Sort: Price (Lowest First)</option>
                  <option value="price_desc">Sort: Price (Highest First)</option>
                  <option value="context_desc">Sort: Context Window</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              </div>

              {/* Table / Grid Toggle */}
              <div className="flex items-center border border-[#E5E5E0] rounded-lg bg-[#FAF9F5] p-0.5">
                <button
                  onClick={() => {
                    setViewMode("table");
                    updateQueryState({ view: "table" });
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "table" ? "bg-white text-[#FF5A1F] shadow-xs" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                  title="Table View (LiteLLM / Models.dev style)"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  onClick={() => {
                    setViewMode("grid");
                    updateQueryState({ view: "grid" });
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid" ? "bg-white text-[#FF5A1F] shadow-xs" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                  title="Grid View (Card layout)"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#F0EFEA] text-xs">
            {/* Vendor Filter */}
            <div className="relative">
              <select
                value={selectedVendor}
                onChange={(e) => {
                  setSelectedVendor(e.target.value);
                  updateQueryState({ vendor: e.target.value });
                }}
                className="appearance-none bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg pl-3 pr-7 py-1.5 font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-hidden"
              >
                <option value="all">All Vendors ({vendorCounts.length})</option>
                {vendorCounts.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.count})
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Modality Filter */}
            <div className="relative">
              <select
                value={selectedModality}
                onChange={(e) => {
                  setSelectedModality(e.target.value);
                  updateQueryState({ modality: e.target.value });
                }}
                className="appearance-none bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg pl-3 pr-7 py-1.5 font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-hidden"
              >
                <option value="all">All Modalities</option>
                <option value="text">Text Only</option>
                <option value="multimodal">Multimodal</option>
                <option value="audio">Audio / Speech</option>
                <option value="vision">Vision</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Openness Filter */}
            <div className="relative">
              <select
                value={selectedOpenness}
                onChange={(e) => {
                  setSelectedOpenness(e.target.value);
                  updateQueryState({ openness: e.target.value });
                }}
                className="appearance-none bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg pl-3 pr-7 py-1.5 font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-hidden"
              >
                <option value="all">All Licenses</option>
                <option value="open_weights">Open Weights</option>
                <option value="proprietary">Proprietary API</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Context Window Minimum */}
            <div className="relative">
              <select
                value={selectedContext}
                onChange={(e) => {
                  setSelectedContext(e.target.value);
                  updateQueryState({ context: e.target.value });
                }}
                className="appearance-none bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg pl-3 pr-7 py-1.5 font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-hidden"
              >
                <option value="0">Any Context Window</option>
                <option value="32000">32K+ Tokens</option>
                <option value="128000">128K+ Tokens</option>
                <option value="200000">200K+ Tokens</option>
                <option value="1000000">1M+ Tokens</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-[#FF5A1F] hover:text-[#E04810] font-semibold px-2 py-1 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 hover:bg-[#FF5A1F]/15 transition-colors ml-auto"
              >
                <RotateCcw size={12} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Display: Empty State OR Table OR Grid */}
        {sortedModels.length === 0 ? (
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="w-14 h-14 bg-[#FF5A1F]/10 text-[#FF5A1F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FF5A1F]/20">
              <Search size={26} />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">
              No models match your current filters
            </h3>
            <p className="text-xs text-[#6B7280] mb-6 max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any AI models matching your search criteria. Try loosening your filters or resetting to view the complete catalog.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5A1F] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#E04810] transition-colors"
            >
              <RotateCcw size={14} />
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW (Inspired by Models.dev & LiteLLM catalog tables) */
          <div className="bg-white border border-[#E5E5E0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E0] bg-[#FAF9F5] text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Model</th>
                    <th className="py-3.5 px-4 font-bold">Vendor</th>
                    <th className="py-3.5 px-4 font-bold">Modality</th>
                    <th className="py-3.5 px-4 font-bold">Openness</th>
                    <th className="py-3.5 px-4 font-bold text-right">Context</th>
                    <th className="py-3.5 px-4 font-bold text-right">Input / 1M</th>
                    <th className="py-3.5 px-4 font-bold text-right">Output / 1M</th>
                    <th className="py-3.5 px-4 font-bold">Research Paper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA] text-xs">
                  {sortedModels.map((m) => {
                    const paper = m.papers?.[0];
                    const isOpenWeights = m.opennessType === "Open Weights";
                    const variantCount = m.variants?.length || 0;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => openDrawer(m)}
                        className="hover:bg-[#FAF9F5] cursor-pointer transition-colors group"
                      >
                        {/* Model Name & Badges */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md border border-[#E5E5E0] bg-white flex items-center justify-center shrink-0 overflow-hidden">
                              {m.vendorLogoUrl ? (
                                <img
                                  src={m.vendorLogoUrl}
                                  alt={m.vendor}
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Cpu size={14} className="text-[#9CA3AF]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#111827] group-hover:text-[#FF5A1F] transition-colors">
                                  {m.name}
                                </span>
                                {variantCount > 0 && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E5E0] text-[#6B7280]">
                                    +{variantCount} {variantCount === 1 ? "variant" : "variants"}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#6B7280] font-mono block">
                                {m.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Vendor */}
                        <td className="py-3 px-4 font-medium text-[#374151]">
                          {m.vendor}
                        </td>

                        {/* Modality */}
                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E5E5E0] text-[#4B5563] text-[10px] font-semibold">
                            {m.modality || "text"}
                          </span>
                        </td>

                        {/* Openness */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isOpenWeights
                                ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                                : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                            }`}
                          >
                            {isOpenWeights ? "Open Weights" : "Proprietary"}
                          </span>
                        </td>

                        {/* Context Window */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#111827]">
                          {formatNumber(Number(m.contextWindow))}
                        </td>

                        {/* Input Price */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#111827]">
                          {formatPrice(m.inputCostPerMtoken)}
                        </td>

                        {/* Output Price */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#111827]">
                          {formatPrice(m.outputCostPerMtoken)}
                        </td>

                        {/* Mapped Academic Paper */}
                        <td className="py-3 px-4 max-w-xs">
                          {paper ? (
                            <Link
                              href={`/papers/${paper.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[#FF5A1F] hover:underline font-medium truncate"
                            >
                              <BookOpen size={12} className="shrink-0" />
                              <span className="truncate">{paper.title}</span>
                              <ExternalLink size={10} className="shrink-0 text-[#9CA3AF]" />
                            </Link>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedModels.map((m) => {
              const paper = m.papers?.[0];
              const isOpenWeights = m.opennessType === "Open Weights";
              const variantCount = m.variants?.length || 0;

              return (
                <div
                  key={m.id}
                  onClick={() => openDrawer(m)}
                  className="bg-white border border-[#E5E5E0] rounded-xl p-5 hover:border-[#FF5A1F] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg border border-[#E5E5E0] bg-white flex items-center justify-center shrink-0 overflow-hidden">
                          {m.vendorLogoUrl ? (
                            <img
                              src={m.vendorLogoUrl}
                              alt={m.vendor}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 size={14} className="text-[#9CA3AF]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#111827] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                              {m.name}
                            </h3>
                            {variantCount > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#FAF9F5] border border-[#E5E5E0] text-[#6B7280]">
                                +{variantCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280]">{m.vendor}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                          isOpenWeights
                            ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                            : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                        }`}
                      >
                        {isOpenWeights ? "Open Weights" : "Proprietary"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
                      {m.description || "Leading foundation model optimized for reasoning, agentic tasks, and coding."}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EFEA] text-xs">
                      <div className="bg-[#FAF9F5] p-2 rounded-lg border border-[#E5E5E0]">
                        <span className="text-[10px] uppercase font-semibold text-[#8B8B8B] block">
                          Context Window
                        </span>
                        <span className="font-mono font-bold text-[#111827]">
                          {formatNumber(Number(m.contextWindow))}
                        </span>
                      </div>
                      <div className="bg-[#FAF9F5] p-2 rounded-lg border border-[#E5E5E0]">
                        <span className="text-[10px] uppercase font-semibold text-[#8B8B8B] block">
                          Cost / 1M Tokens
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {formatPrice(m.inputCostPerMtoken)}
                        </span>
                      </div>
                    </div>

                    {/* Capability Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {m.capabilities?.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E5E0] text-[#4B5563] capitalize"
                        >
                          {c.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Mapped Research Paper */}
                  <div className="mt-4 pt-3 border-t border-[#F0EFEA]">
                    {paper ? (
                      <Link
                        href={`/papers/${paper.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between text-xs font-medium text-[#FF5A1F] hover:underline"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <BookOpen size={13} />
                          <span className="truncate">{paper.title}</span>
                        </span>
                        <ExternalLink size={12} className="shrink-0" />
                      </Link>
                    ) : (
                      <div className="text-xs text-[#9CA3AF] flex items-center justify-between">
                        <span>Released {formatDate(m.releaseDate)}</span>
                        <span className="text-[11px] group-hover:text-[#111827] flex items-center gap-0.5">
                          Inspect <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Slide-Out Details Drawer (Extra Specifications, Variants & Papers) */}
        {activeModelDetails && (
          <div
            className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={closeDrawer}
          >
            <div
              className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E0] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-[#E5E5E0] bg-[#FAF9F5] flex items-center justify-center shrink-0">
                      {activeModelDetails.vendorLogoUrl ? (
                        <img
                          src={activeModelDetails.vendorLogoUrl}
                          alt={activeModelDetails.vendor}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Cpu size={24} className="text-[#FF5A1F]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#111827]">
                        {activeModelDetails.name}
                      </h2>
                      <p className="text-sm text-[#6B7280]">
                        {activeModelDetails.vendor} • {activeModelDetails.modelFamily || "General Family"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-[#9CA3AF] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-[#374151] leading-relaxed">
                    {activeModelDetails.description ||
                      "Advanced model architecture configured for frontier AI applications and research benchmarks."}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div>
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E5E0]">
                      <span className="text-[#8B8B8B] block mb-1">Context Window</span>
                      <span className="font-mono font-bold text-[#111827] text-sm">
                        {formatNumber(Number(activeModelDetails.contextWindow))} tokens
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E5E0]">
                      <span className="text-[#8B8B8B] block mb-1">Max Output</span>
                      <span className="font-mono font-bold text-[#111827] text-sm">
                        {formatNumber(activeModelDetails.maxOutputTokens || 4096)} tokens
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E5E0]">
                      <span className="text-[#8B8B8B] block mb-1">Input Price / 1M</span>
                      <span className="font-bold text-[#111827] text-sm">
                        {formatPrice(activeModelDetails.inputCostPerMtoken)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E5E0]">
                      <span className="text-[#8B8B8B] block mb-1">Output Price / 1M</span>
                      <span className="font-bold text-[#111827] text-sm">
                        {formatPrice(activeModelDetails.outputCostPerMtoken)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsed Model Variants */}
                {activeModelDetails.variants && activeModelDetails.variants.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Model Variants & Endpoints</span>
                      <span className="text-[#FF5A1F] font-mono">
                        {activeModelDetails.variants.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {activeModelDetails.variants.map((v: any, idx: number) => (
                        <div
                          key={v.id || idx}
                          className="p-3 rounded-xl border border-[#E5E5E0] bg-[#FAF9F5] flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#111827]">{v.name || v.id}</span>
                            <div className="text-[11px] text-[#6B7280] mt-0.5">
                              Context: {formatNumber(v.context_window)} tokens • Tag: <code className="bg-[#E5E5E0] px-1 py-0.2 rounded text-[10px]">{v.tag}</code>
                            </div>
                          </div>
                          <div className="text-right font-mono shrink-0">
                            <span className="font-semibold text-[#111827] block">
                              {formatPrice(v.input_cost_per_mtoken)} in
                            </span>
                            <span className="text-[10px] text-[#6B7280]">
                              {formatPrice(v.output_cost_per_mtoken)} out
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mapped Research Papers */}
                <div>
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Mapped Research Papers</span>
                    <span className="text-[#FF5A1F] font-mono">
                      {activeModelDetails.papers?.length || 0}
                    </span>
                  </h4>

                  {activeModelDetails.papers && activeModelDetails.papers.length > 0 ? (
                    <div className="space-y-2.5">
                      {activeModelDetails.papers.map((p) => (
                        <Link
                          key={p.id}
                          href={`/papers/${p.slug}`}
                          className="block p-3 rounded-xl border border-[#E5E5E0] bg-[#FAF9F5] hover:border-[#FF5A1F] hover:bg-white transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h5 className="text-sm font-semibold text-[#111827] group-hover:text-[#FF5A1F] transition-colors">
                                {p.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
                                {p.arxivId && <span>arXiv:{p.arxivId}</span>}
                                {p.citationCount > 0 && <span>• {p.citationCount} Citations</span>}
                                {p.role && (
                                  <span className="capitalize px-1.5 py-0.2 bg-[#E5E7EB] text-[#374151] rounded text-[10px]">
                                    {p.role}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-[#9CA3AF] group-hover:text-[#FF5A1F] shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-[#E5E5E0] bg-[#FAF9F5] text-xs text-[#6B7280] text-center">
                      No primary academic paper directly linked to this model variant yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="pt-6 border-t border-[#E5E5E0] mt-6 flex items-center justify-between gap-3">
                {activeModelDetails.paperUrl ? (
                  <a
                    href={activeModelDetails.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5E0] text-xs font-semibold text-[#111827] hover:border-[#FF5A1F] transition-colors"
                  >
                    <FileText size={14} className="text-[#FF5A1F]" />
                    arXiv Paper
                  </a>
                ) : (
                  <div />
                )}

                <button
                  onClick={closeDrawer}
                  className="px-5 py-2 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-[#374151] transition-colors"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
