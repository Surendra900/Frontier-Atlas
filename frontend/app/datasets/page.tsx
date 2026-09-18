"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ArrowUpDown, AlertCircle, Inbox } from "lucide-react";
import { getDatasets, type DatasetItem } from "@/lib/datasets";
import DatasetCard from "@/components/DatasetCard";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const LIMIT = 12;

function SkeletonCard() {
  return (
    <div className="ds-card p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 bg-[#E5E5E0] rounded w-2/3" />
        <div className="h-4 bg-[#E5E5E0] rounded w-16" />
      </div>
      <div className="h-4 bg-[#E5E5E0] rounded w-1/3" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function DatasetsPage() {
  const [allDatasets, setAllDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name">("name");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDatasets();
      setAllDatasets(data);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
      setError("Failed to load datasets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const filtered = useMemo(() => {
    let result = allDatasets;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (sort === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [allDatasets, debouncedSearch, sort]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / LIMIT);
  const displayed = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <Link href="/" className="hover:text-[#F55036] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium">Datasets</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-2">
            Datasets
          </h1>
          <p className="text-[#555555] text-[14px] md:text-[15px]">
            Browse and discover datasets referenced across research papers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full sm:max-w-[360px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets..."
              className="ds-input w-full pl-10 pr-4 h-10 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-[#8B8B8B]" />
            <button
              onClick={() => setSort("name")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                sort === "name"
                  ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                  : "bg-white text-[#555555] border-[#E5E5E0] hover:border-[#FF5A1F]"
              }`}
            >
              Name
            </button>
          </div>
        </div>

        {loading && <SkeletonGrid />}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-[#FF5A1F]" />
            <p className="text-[14px] text-[#FF5A1F]">{error}</p>
            <button
              onClick={fetchDatasets}
              className="ds-button text-[12px]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Inbox size={32} className="text-[#8B8B8B]" />
            <p className="text-[14px] text-[#555555]">
              {debouncedSearch
                ? `No datasets match "${debouncedSearch}"`
                : "No datasets found."}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className="ds-button-ghost text-[12px]"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <>
            <div className="text-[13px] text-[#8B8B8B] mb-4">
              Showing {displayed.length} of {total} dataset{total !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="ds-button-ghost text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-1 text-[#8B8B8B] text-[13px]">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-full text-[12px] font-medium transition-colors ${
                            page === p
                              ? "bg-[#FF5A1F] text-white"
                              : "text-[#555555] hover:bg-[#EBEBE6]"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="ds-button-ghost text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
