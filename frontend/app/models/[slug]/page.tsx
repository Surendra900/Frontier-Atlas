"use client";

import React, { useState, useEffect, useMemo, use } from "react";
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
} from "lucide-react";

import Navbar from "@/components/Navbar";
import {
  type ModelItem,
  type CardMeta,
  getModelCardMeta,
  getModels,
} from "@/lib/models";

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

export default function ModelsListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug ? resolvedParams.slug.toLowerCase().trim() : "all";

  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const querySearch = searchParams.get("q") || searchParams.get("search") || "";
  const queryVendor = searchParams.get("vendor") || "all";
  const queryModality = searchParams.get("modality") || "all";
  const queryOpenness = searchParams.get("openness") || "all";
  const queryCapability = searchParams.get("capability") || "all";
  const queryContext = searchParams.get("context") || "0";
  const queryPrice = searchParams.get("price") || "0";
  const querySort = searchParams.get("sort") || "newest";
  const queryView = (searchParams.get("view") as "table" | "grid") || "table";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);

  // Component state
  const [cardMeta, setCardMeta] = useState<CardMeta | null>(null);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedVendor, setSelectedVendor] = useState(queryVendor);
  const [selectedModality, setSelectedModality] = useState(queryModality);
  const [selectedOpenness, setSelectedOpenness] = useState(queryOpenness);
  const [selectedCapability, setSelectedCapability] = useState(queryCapability);
  const [selectedContext, setSelectedContext] = useState(queryContext);
  const [selectedPrice, setSelectedPrice] = useState(queryPrice);
  const [sortBy, setSortBy] = useState(querySort);
  const [viewMode, setViewMode] = useState<"table" | "grid">(queryView);
  const [currentPage, setCurrentPage] = useState(queryPage);

  // Drawer / expanded modal state
  const [activeModelDetails, setActiveModelDetails] = useState<ModelItem | null>(null);

  // Sync state with URL params
  const updateQueryState = (updates: Record<string, string | number | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === "all" || v === 0 || v === "0") {
        current.delete(k);
      } else {
        current.set(k, String(v));
      }
    }
    const qStr = current.toString();
    router.replace(qStr ? `/models/${rawSlug}?${qStr}` : `/models/${rawSlug}`, { scroll: false });
  };

  // Fetch Card Meta
  useEffect(() => {
    let isMounted = true;
    getModelCardMeta(rawSlug)
      .then((meta) => {
        if (isMounted) setCardMeta(meta);
      })
      .catch((err) => {
        console.error("Failed to load card meta:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [rawSlug]);

  // Fetch Models
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const queryParams: Record<string, unknown> = {
      card: rawSlug,
      page: currentPage,
      limit: 50,
      sort: sortBy,
    };
    if (searchTerm) queryParams.search = searchTerm;
    if (selectedVendor !== "all") queryParams.vendor = selectedVendor;
    if (selectedModality !== "all") queryParams.modality = selectedModality;
    if (selectedOpenness !== "all") queryParams.openness = selectedOpenness;
    if (selectedCapability !== "all") queryParams.capability = selectedCapability;
    if (parseInt(selectedContext, 10) > 0) queryParams.min_context = selectedContext;
    if (parseFloat(selectedPrice) > 0) queryParams.max_price = selectedPrice;

    getModels(queryParams)
      .then((items) => {
        if (!isMounted) return;
        setModels(items);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch models:", err);
        setError("Unable to load models. Please check your connection and try again.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    rawSlug,
    searchTerm,
    selectedVendor,
    selectedModality,
    selectedOpenness,
    selectedCapability,
    selectedContext,
    selectedPrice,
    sortBy,
    currentPage,
  ]);

  // Client-side quick filter & search
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = m.name?.toLowerCase().includes(query);
        const matchesVendor = m.vendor?.toLowerCase().includes(query);
        const matchesFamily = m.modelFamily?.toLowerCase().includes(query);
        const matchesDesc = m.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesVendor && !matchesFamily && !matchesDesc) return false;
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
        const caps = m.capabilities || [];
        if (!caps.includes(selectedCapability)) return false;
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

  // Vendor options from current set
  const availableVendors = useMemo(() => {
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

  // Total mapped papers in this view
  const totalMappedPapers = useMemo(() => {
    let count = 0;
    const seenPaperIds = new Set<string>();
    for (const m of filteredModels) {
      for (const p of m.papers || []) {
        if (p?.id && !seenPaperIds.has(p.id)) {
          seenPaperIds.add(p.id);
          count++;
        }
      }
    }
    return count;
  }, [filteredModels]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedVendor("all");
    setSelectedModality("all");
    setSelectedOpenness("all");
    setSelectedCapability("all");
    setSelectedContext("0");
    setSelectedPrice("0");
    setCurrentPage(1);
    updateQueryState({
      q: null,
      vendor: null,
      modality: null,
      openness: null,
      capability: null,
      context: null,
      price: null,
      page: 1,
    });
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedVendor !== "all" ||
    selectedModality !== "all" ||
    selectedOpenness !== "all" ||
    selectedCapability !== "all" ||
    selectedContext !== "0" ||
    selectedPrice !== "0";

  // 404 State if slug is invalid and no models match without active filters
  if (!loading && models.length === 0 && !hasActiveFilters && rawSlug !== "all" && rawSlug !== "models") {
    return (
      <div className="min-h-screen bg-[#F8F7F2] text-[#111827]">
        <Navbar />
        <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#E5E5E0]/50 flex items-center justify-center mx-auto text-[#6B7280]">
              <Cpu size={36} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#111827]">Model Catalog Not Found</h1>
              <p className="text-sm text-[#4B5563]">
                No models or vendor category match &ldquo;{rawSlug}&rdquo;. Check the URL or explore our complete catalog.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/models"
                className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#E04D16] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Browse All Models
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-white border border-[#E5E5E0] hover:bg-stone-50 text-[#111827] rounded-xl text-sm font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#111827]">
      <Navbar />

      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-5">
          <Link href="/" className="hover:text-[#FF5A1F] transition-colors">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link href="/models" className="hover:text-[#FF5A1F] transition-colors">
            Models
          </Link>
          <ChevronRight size={13} />
          <span className="text-[#111827] font-medium capitalize">
            {cardMeta?.title || rawSlug.replace(/-/g, " ")}
          </span>
        </div>

        {/* Page Header */}
        <section className="bg-white border border-[#E5E5E0] rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FFF5F0] text-[#FF5A1F] border border-[#FFD9CC]">
                  <Sparkles size={13} />
                  {cardMeta?.type || "Catalog"}
                </span>

                {cardMeta?.totalModels !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                    <Cpu size={13} />
                    {cardMeta.totalModels} Models
                  </span>
                )}

                {totalMappedPapers > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    <BookOpen size={13} />
                    {totalMappedPapers} Research Papers Mapped
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827]">
                {cardMeta?.title || `${rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1).replace(/-/g, " ")} Models`}
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                {cardMeta?.description ||
                  "Compare capabilities, token pricing, context length, and underlying research papers for all models in this catalog."}
              </p>
            </div>

            {/* Quick Stats Block */}
            <div className="grid grid-cols-2 gap-3 min-w-[220px] shrink-0">
              <div className="bg-[#FAF9F5] border border-[#EBEAE5] rounded-lg p-3 text-center">
                <span className="text-[11px] uppercase font-semibold text-[#8B8B8B] tracking-wider block">
                  Models Listed
                </span>
                <span className="text-xl font-bold text-[#111827]">
                  {loading ? "..." : filteredModels.length}
                </span>
              </div>
              <div className="bg-[#FAF9F5] border border-[#EBEAE5] rounded-lg p-3 text-center">
                <span className="text-[11px] uppercase font-semibold text-[#8B8B8B] tracking-wider block">
                  Mapped Papers
                </span>
                <span className="text-xl font-bold text-[#FF5A1F]">
                  {loading ? "..." : totalMappedPapers}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar: Search, Filters, Sort, View Mode */}
        <section className="bg-white border border-[#E5E5E0] rounded-xl p-4 mb-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateQueryState({ q: e.target.value });
                }}
                placeholder="Search models by name, provider, family, or task..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    updateQueryState({ q: null });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sort By Dropdown */}
              <div className="relative inline-flex items-center">
                <ArrowUpDown size={15} className="absolute left-3 text-[#6B7280] pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateQueryState({ sort: e.target.value });
                  }}
                  className="appearance-none pl-8 pr-8 py-2 bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg text-xs sm:text-sm font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Alphabetical (A-Z)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="context_desc">Context: Largest First</option>
                  <option value="trending">Popularity / Trending</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 text-[#6B7280] pointer-events-none" />
              </div>

              {/* Vendor / Provider Filter Dropdown */}
              {availableVendors.length > 1 && (
                <div className="relative inline-flex items-center">
                  <Building2 size={15} className="absolute left-3 text-[#6B7280] pointer-events-none" />
                  <select
                    value={selectedVendor}
                    onChange={(e) => {
                      setSelectedVendor(e.target.value);
                      updateQueryState({ vendor: e.target.value === "all" ? null : e.target.value });
                    }}
                    className="appearance-none pl-8 pr-8 py-2 bg-[#FAF9F5] border border-[#E5E5E0] rounded-lg text-xs sm:text-sm font-medium text-[#374151] hover:border-[#D1D5DB] focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                  >
                    <option value="all">All Providers</option>
                    {availableVendors.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 text-[#6B7280] pointer-events-none" />
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-lg border border-[#E5E5E0] bg-[#FAF9F5] p-1">
                <button
                  onClick={() => {
                    setViewMode("table");
                    updateQueryState({ view: "table" });
                  }}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-[#FF5A1F] shadow-xs"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                  title="Table View (Reference-grade)"
                >
                  <TableIcon size={16} />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode("grid");
                    updateQueryState({ view: "grid" });
                  }}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#FF5A1F] shadow-xs"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                  title="Grid View (Cards)"
                >
                  <LayoutGrid size={16} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              {/* Reset Filters button if any active */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors border border-transparent hover:border-[#FCA5A5]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
            {/* Capability Filters */}
            <span className="text-[#9CA3AF] font-semibold uppercase text-[10px] tracking-wider pr-1">
              Capabilities:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "reasoning", label: "Reasoning (o1 / R1)" },
              { id: "vision", label: "Vision" },
              { id: "tools", label: "Tool Calling" },
              { id: "structured_output", label: "Structured Output" },
              { id: "code", label: "Coding" },
            ].map((cap) => {
              const active = selectedCapability === cap.id;
              return (
                <button
                  key={cap.id}
                  onClick={() => {
                    setSelectedCapability(cap.id);
                    updateQueryState({ capability: cap.id === "all" ? null : cap.id });
                  }}
                  className={`px-3 py-1.5 rounded-full border whitespace-nowrap transition-all font-medium ${
                    active
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-[#FAF9F5] text-[#4B5563] border-[#E5E5E0] hover:border-[#D1D5DB] hover:bg-white"
                  }`}
                >
                  {cap.label}
                </button>
              );
            })}

            <div className="h-4 w-px bg-[#E5E5E0] mx-1 shrink-0" />

            {/* Openness Filters */}
            <span className="text-[#9CA3AF] font-semibold uppercase text-[10px] tracking-wider pr-1">
              Weights:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "open_weights", label: "Open Weights" },
              { id: "proprietary", label: "Proprietary" },
            ].map((opt) => {
              const active = selectedOpenness === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedOpenness(opt.id);
                    updateQueryState({ openness: opt.id === "all" ? null : opt.id });
                  }}
                  className={`px-3 py-1.5 rounded-full border whitespace-nowrap transition-all font-medium ${
                    active
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-[#FAF9F5] text-[#4B5563] border-[#E5E5E0] hover:border-[#D1D5DB] hover:bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

            <div className="h-4 w-px bg-[#E5E5E0] mx-1 shrink-0" />

            {/* Context Presets */}
            <span className="text-[#9CA3AF] font-semibold uppercase text-[10px] tracking-wider pr-1">
              Context:
            </span>
            {[
              { id: "0", label: "Any" },
              { id: "128000", label: "≥128K" },
              { id: "200000", label: "≥200K" },
              { id: "1000000", label: "≥1M" },
            ].map((ctx) => {
              const active = selectedContext === ctx.id;
              return (
                <button
                  key={ctx.id}
                  onClick={() => {
                    setSelectedContext(ctx.id);
                    updateQueryState({ context: ctx.id === "0" ? null : ctx.id });
                  }}
                  className={`px-3 py-1.5 rounded-full border whitespace-nowrap transition-all font-medium ${
                    active
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-[#FAF9F5] text-[#4B5563] border-[#E5E5E0] hover:border-[#D1D5DB] hover:bg-white"
                  }`}
                >
                  {ctx.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full rounded-xl bg-white border border-[#E5E5E0] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#FCA5A5] rounded-xl p-8 text-center text-[#EF4444] space-y-4">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626]"
            >
              Retry
            </button>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="bg-white border border-[#E5E5E0] rounded-xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F5] text-[#9CA3AF] flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">No models found</h3>
            <p className="text-sm text-[#6B7280] max-w-md mx-auto">
              No models match your current filter and search criteria. Try clearing some filters or searching for another term.
            </p>
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW (Reference-grade inspired by models.dev & OpenRouter) */
          <div className="bg-white border border-[#E5E5E0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E0] bg-[#FAF9F5] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Model & Provider</th>
                    <th className="py-3.5 px-3">Context</th>
                    <th className="py-3.5 px-3">Input / Output Price (1M Tokens)</th>
                    <th className="py-3.5 px-3">Capabilities & Weights</th>
                    <th className="py-3.5 px-3">Released</th>
                    <th className="py-3.5 px-4 text-right">Research Paper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE9E4] text-sm">
                  {filteredModels.map((m) => {
                    const paper = m.papers?.[0];
                    const paperCount = m.paperCount || (m.papers?.length ?? 0);
                    const isOpenWeights = m.opennessType === "Open Weights";

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-[#FAF9F5]/70 transition-colors group cursor-pointer"
                        onClick={() => setActiveModelDetails(m)}
                      >
                        {/* 1. Model & Provider */}
                        <td className="py-4 px-4 min-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg border border-[#E5E5E0] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                              {m.vendorLogoUrl ? (
                                <img
                                  src={m.vendorLogoUrl}
                                  alt={m.vendor}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Building2 size={16} className="text-[#9CA3AF]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#111827] group-hover:text-[#FF5A1F] transition-colors truncate">
                                {m.name}
                              </div>
                              <div className="text-xs text-[#6B7280] flex items-center gap-1.5 truncate">
                                <span>{m.vendor}</span>
                                {m.parameterCount && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-[11px] text-[#4B5563]">
                                      {m.parameterCount}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Context Window */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                            {formatNumber(Number(m.contextWindow))}
                          </span>
                        </td>

                        {/* 3. Pricing */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-baseline gap-1 text-xs">
                            <span className="font-semibold text-[#111827]">
                              {formatPrice(m.inputCostPerMtoken)}
                            </span>
                            <span className="text-[#9CA3AF]">/</span>
                            <span className="text-[#4B5563]">
                              {formatPrice(m.outputCostPerMtoken)}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#9CA3AF]">in / out</span>
                        </td>

                        {/* 4. Capabilities & Weights */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                isOpenWeights
                                  ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                                  : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                              }`}
                            >
                              {isOpenWeights ? "Open Weights" : "Proprietary"}
                            </span>

                            {m.capabilities?.includes("reasoning") && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                                Reasoning
                              </span>
                            )}
                            {m.capabilities?.includes("vision") && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                                Vision
                              </span>
                            )}
                            {m.capabilities?.includes("tools") && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#3F3F46] border border-[#E4E4E7]">
                                Tools
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Release Date */}
                        <td className="py-4 px-3 text-xs text-[#6B7280] whitespace-nowrap">
                          {formatDate(m.releaseDate)}
                        </td>

                        {/* 6. Mapped Research Paper */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {paper ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                href={`/papers/${paper.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#FF5A1F] bg-[#FFF5F0] border border-[#FFD9CC] hover:bg-[#FFEAE0] transition-colors"
                                title={paper.title}
                              >
                                <BookOpen size={13} />
                                <span className="max-w-[130px] truncate">{paper.title}</span>
                                <ExternalLink size={11} className="opacity-70" />
                              </Link>
                              {paperCount > 1 && (
                                <span
                                  className="text-[10px] font-semibold text-[#8B8B8B] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]"
                                  title={`${paperCount} total research papers mapped`}
                                >
                                  +{paperCount - 1}
                                </span>
                              )}
                            </div>
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
          /* GRID VIEW (Crisp cards inspired by LiteLLM & FrontierAtlas) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModels.map((m) => {
              const paper = m.papers?.[0];
              const isOpenWeights = m.opennessType === "Open Weights";

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveModelDetails(m)}
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
                          <h3 className="font-bold text-[#111827] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                            {m.name}
                          </h3>
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
                      {m.description || "Leading large language model optimized for reasoning, agentic tasks, and coding."}
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
                      {m.capabilities?.map((c) => (
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

        {/* Slide-Out Details Drawer (Extra Specifications & Papers) */}
        {activeModelDetails && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
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
                    onClick={() => setActiveModelDetails(null)}
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

                {/* Specs Grid */}
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

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-[#E5E5E0] mt-6 flex items-center justify-between">
                {activeModelDetails.apiUrl && (
                  <a
                    href={activeModelDetails.apiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111827] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                  >
                    <span>API Documentation</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => setActiveModelDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
