"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, User, Beaker, ListChecks, Cpu, Database, AlertCircle, Inbox } from "lucide-react";
import Link from "next/link";
import { globalSearch, type SearchResult, type SearchResultType } from "@/lib/search";

const TABS: { type: SearchResultType; label: string; icon: React.ReactNode }[] = [
  { type: "papers", label: "Papers", icon: <FileText size={16} /> },
  { type: "authors", label: "Authors", icon: <User size={16} /> },
  { type: "methods", label: "Methods", icon: <Beaker size={16} /> },
  { type: "tasks", label: "Tasks", icon: <ListChecks size={16} /> },
  { type: "models", label: "Models", icon: <Cpu size={16} /> },
  { type: "datasets", label: "Datasets", icon: <Database size={16} /> },
];

interface SearchResultsProps {
  query: string;
}

function ResultCard({ result }: { result: SearchResult }) {
  const getIcon = () => {
    const icons: Record<SearchResultType, React.ReactNode> = {
      papers: <FileText size={16} className="text-[#8B8B8B]" />,
      authors: <User size={16} className="text-[#8B8B8B]" />,
      methods: <Beaker size={16} className="text-[#8B8B8B]" />,
      tasks: <ListChecks size={16} className="text-[#8B8B8B]" />,
      models: <Cpu size={16} className="text-[#8B8B8B]" />,
      datasets: <Database size={16} className="text-[#8B8B8B]" />,
    };
    return icons[result.type];
  };

  const getPath = () => {
    return `/${result.type === 'papers' ? 'papers' : result.type}/${encodeURIComponent(result.slug)}`;
  };

  return (
    <Link
      href={getPath()}
      className="ds-card p-4 flex items-start gap-3 hover:shadow-soft transition-shadow duration-200 group no-underline"
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-[#111111] group-hover:text-[#F55036] transition-colors leading-snug mb-1">
          {result.title}
        </h3>
        {result.subtitle && (
          <p className="text-[13px] text-[#555555]">{result.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="ds-card p-4 flex items-start gap-3 animate-pulse">
      <div className="w-4 h-4 bg-[#E5E5E0] rounded shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#E5E5E0] rounded w-3/4" />
        <div className="h-3 bg-[#E5E5E0] rounded w-1/2" />
      </div>
    </div>
  );
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<SearchResultType>("papers");
  const [results, setResults] = useState<Record<SearchResultType, SearchResult[]>>({
    papers: [],
    authors: [],
    methods: [],
    tasks: [],
    models: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults({
        papers: [],
        authors: [],
        methods: [],
        tasks: [],
        models: [],
        datasets: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await globalSearch(query, 20);
      setResults(data);
      if (data.papers.length === 0) {
        const firstNonEmpty = (Object.keys(data) as SearchResultType[]).find(
          (key) => data[key] && data[key].length > 0
        );
        if (firstNonEmpty) {
          setActiveTab(firstNonEmpty);
        }
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Failed to load search results. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fetch results when query changes
 useEffect(() => {
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }

  debounceTimer.current = setTimeout(() => {
    fetchResults();
  }, 300);

  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };
}, [fetchResults]);

  const activeResults = results[activeTab];
  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-[#E5E5E0]">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              disabled
              className="px-4 py-2 text-[13px] font-medium text-[#8B8B8B] border-b-2 border-transparent opacity-50"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle size={32} className="text-[#FF5A1F]" />
        <p className="text-[14px] text-[#FF5A1F]">{error}</p>
        <button onClick={fetchResults} className="ds-button text-[12px]">
          Retry
        </button>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Inbox size={32} className="text-[#8B8B8B]" />
        <p className="text-[14px] text-[#555555]">Enter a search query to find papers, authors, methods, tasks, models, and datasets.</p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Inbox size={32} className="text-[#8B8B8B]" />
        <p className="text-[14px] text-[#555555]">No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs - Responsive wrapped layout */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E0] mb-6 pb-2">
        {TABS.map((tab) => {
          const count = results[tab.type!].length;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type!)}
              className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === tab.type
                  ? "text-[#F55036] border-[#F55036]"
                  : "text-[#555555] border-transparent hover:text-[#F55036]"
              }`}
              aria-selected={activeTab === tab.type}
              role="tab"
            >
              {tab.icon}
              {tab.label}
              {count > 0 && (
                <span className="ds-chip text-[10px] px-1.5 py-0.5">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {activeResults.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[13px] text-[#8B8B8B]">
            {activeResults.length} result{activeResults.length !== 1 ? "s" : ""} found
          </p>
          {activeResults.map((result) => (
            <ResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Inbox size={28} className="text-[#8B8B8B]" />
          <p className="text-[14px] text-[#555555]">
            No {activeTab} found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
