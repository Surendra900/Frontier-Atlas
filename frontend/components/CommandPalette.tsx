"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  PlusCircle,
  X,
  CornerDownLeft,
  User,
  Database,
  Loader2,
} from "lucide-react";
import { globalSearch, type SearchResults } from "@/lib/search";

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  category: "Navigation" | "Discovery";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "trending-papers",
    title: "Trending Papers Feed",
    subtitle: "High-velocity research breaking across arXiv & GitHub",
    href: "/",
    icon: <TrendingUp size={16} className="text-[#FF5A1F]" />,
    category: "Navigation",
  },
  {
    id: "latest-papers",
    title: "Latest arXiv Research",
    subtitle: "Chronological feed of newly published papers",
    href: "/?sort=latest",
    icon: <Clock size={16} className="text-blue-500" />,
    category: "Navigation",
  },
  {
    id: "stars-papers",
    title: "Most Starred Implementations",
    subtitle: "Open-source repositories with highest GitHub community stars",
    href: "/?sort=stars",
    icon: <Star size={16} className="text-amber-500" />,
    category: "Navigation",
  },
  {
    id: "models-directory",
    title: "AI Foundation Models",
    subtitle: "Lineages, parameter specs, weights, and benchmarks",
    href: "/models",
    icon: <Cpu size={16} className="text-purple-500" />,
    category: "Navigation",
  },
  {
    id: "benchmarks-hub",
    title: "SOTA Benchmarks & Leaderboards",
    subtitle: "MMLU, GSM8K, MATH, HumanEval podiums",
    href: "/benchmarks",
    icon: <Trophy size={16} className="text-amber-600" />,
    category: "Navigation",
  },
  {
    id: "tasks-taxonomy",
    title: "Research Tasks & Domains",
    subtitle: "Explore papers classified by machine learning challenges",
    href: "/tasks",
    icon: <Layers size={16} className="text-emerald-500" />,
    category: "Navigation",
  },
  {
    id: "methods-index",
    title: "Methods & Architectures",
    subtitle: "Attention mechanisms, RLHF, DPO, LoRA, and reasoning tokens",
    href: "/methods",
    icon: <Sparkles size={16} className="text-pink-500" />,
    category: "Navigation",
  },
  {
    id: "submit-paper",
    title: "Submit Research Paper",
    subtitle: "Index new research, repository, or checkpoint to Frontier Atlas",
    href: "/submit",
    icon: <PlusCircle size={16} className="text-teal-500" />,
    category: "Navigation",
  },
];

const SUGGESTED_QUERIES = [
  "LLaMA 3",
  "DeepSeek R1",
  "Mixture of Experts",
  "Reasoning",
  "MCP",
  "Diffusion",
  "MMLU",
];

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    papers: [],
    authors: [],
    methods: [],
    tasks: [],
    models: [],
    datasets: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect platform
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }
  }, []);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Custom event listener for external triggers (Navbar search click, mobile button, etc.)
  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => window.removeEventListener("open-command-palette", handleCustomOpen);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      // Prevent body scroll when open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
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
    const timer = setTimeout(async () => {
      try {
        const res = await globalSearch(query.trim(), 4);
        setResults(res);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Command palette search error:", err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened searchable items for keyboard navigation
  const flattenedItems = useMemo(() => {
    if (!query.trim()) {
      return QUICK_ACTIONS.map((action) => ({
        id: action.id,
        title: action.title,
        subtitle: action.subtitle,
        href: action.href,
        icon: action.icon,
        type: "action" as const,
      }));
    }

    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      href: string;
      icon: React.ReactNode;
      type: string;
      group: string;
    }> = [];

    // Models
    (results.models || []).forEach((m) => {
      items.push({
        id: `model-${m.id || m.slug}`,
        title: m.title,
        subtitle: m.subtitle || "Foundation Model",
        href: `/models/${m.slug}`,
        icon: <Cpu size={15} className="text-purple-500" />,
        type: "Model",
        group: "Models",
      });
    });

    // Papers
    (results.papers || []).forEach((p) => {
      items.push({
        id: `paper-${p.id || p.slug}`,
        title: p.title,
        subtitle: p.subtitle || "Research Paper",
        href: `/papers/${p.slug}`,
        icon: <FileText size={15} className="text-[#FF5A1F]" />,
        type: "Paper",
        group: "Papers",
      });
    });

    // Tasks
    (results.tasks || []).forEach((t) => {
      items.push({
        id: `task-${t.id || t.slug}`,
        title: t.title,
        subtitle: "Research Domain & Benchmark Task",
        href: `/tasks/${t.slug}`,
        icon: <Layers size={15} className="text-emerald-500" />,
        type: "Task",
        group: "Tasks",
      });
    });

    // Methods
    (results.methods || []).forEach((m) => {
      items.push({
        id: `method-${m.id || m.slug}`,
        title: m.title,
        subtitle: m.subtitle || "Algorithmic Architecture",
        href: `/methods/${m.slug}`,
        icon: <Sparkles size={15} className="text-pink-500" />,
        type: "Method",
        group: "Methods",
      });
    });

    // Authors
    (results.authors || []).forEach((a) => {
      items.push({
        id: `author-${a.id || a.slug}`,
        title: a.title,
        subtitle: "Researcher / Lab Author",
        href: `/search?q=${encodeURIComponent(a.title)}`,
        icon: <User size={15} className="text-blue-500" />,
        type: "Author",
        group: "Authors",
      });
    });

    // Datasets
    (results.datasets || []).forEach((d) => {
      items.push({
        id: `dataset-${d.id || d.slug}`,
        title: d.title,
        subtitle: "Evaluation Dataset",
        href: `/search?q=${encodeURIComponent(d.title)}`,
        icon: <Database size={15} className="text-amber-500" />,
        type: "Dataset",
        group: "Datasets",
      });
    });

    return items;
  }, [query, results]);

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  // Handle keyboard arrows and Enter
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flattenedItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedItems.length) % flattenedItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flattenedItems[selectedIndex]) {
        handleSelect(flattenedItems[selectedIndex].href);
      } else if (query.trim()) {
        handleSelect(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[14vh] px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E5E5E0] overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAE9E4] bg-[#FAFAF8]">
          <Search size={18} className="text-[#888888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder="Search papers, models, benchmarks, methods, tasks..."
            className="flex-1 text-[15px] bg-transparent text-[#111111] placeholder:text-[#999999] outline-hidden"
          />
          {loading ? (
            <Loader2 size={16} className="text-[#FF5A1F] animate-spin shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#999999] hover:text-[#333333] p-1 rounded-md transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          ) : null}
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-[#DCDAD4] text-[#666666] shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results / Navigation Scrollable Area */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {!query.trim() ? (
            /* Default: Quick Actions & Suggestions */
            <div className="space-y-4 p-2">
              {/* Suggested Search Chips */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] px-2 block mb-2">
                  Popular Topics
                </span>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {SUGGESTED_QUERIES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#FAFAF8] hover:bg-[#FFF3EC] hover:text-[#FF5A1F] border border-[#E5E5E0] hover:border-[#FF5A1F]/30 text-[#444444] transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions List */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] px-2 block mb-1.5">
                  Navigation Shortcuts
                </span>
                <div className="space-y-1">
                  {QUICK_ACTIONS.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={action.id}
                        data-index={idx}
                        onClick={() => handleSelect(action.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF6F2] text-[#FF5A1F] border border-[rgba(255,90,31,0.2)]"
                            : "hover:bg-[#FAFAF8] text-[#222222] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-white border-[rgba(255,90,31,0.3)]"
                                : "bg-[#F7F7F5] border-[#E8E7E2]"
                            }`}
                          >
                            {action.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-semibold block truncate">
                              {action.title}
                            </span>
                            <span className="text-[12px] text-[#777777] block truncate">
                              {action.subtitle}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 transition-transform ${
                            isSelected ? "text-[#FF5A1F] translate-x-0.5" : "text-[#CCCCCC]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : flattenedItems.length === 0 ? (
            /* Empty State */
            <div className="py-12 px-4 text-center">
              <p className="text-[14px] font-semibold text-[#333333]">
                No instant matches found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[12px] text-[#888888] mt-1">
                Press Enter to perform a full deep database search.
              </p>
              <button
                onClick={() => handleSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] hover:bg-black text-white text-[13px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Deep Search</span>
                <CornerDownLeft size={13} />
              </button>
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-1 p-1">
              {flattenedItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFF6F2] border border-[rgba(255,90,31,0.2)]"
                        : "hover:bg-[#FAFAF8] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-md bg-[#FAFAF8] border border-[#EAE9E4] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[13px] font-semibold truncate ${
                              isSelected ? "text-[#FF5A1F]" : "text-[#111111]"
                            }`}
                          >
                            {item.title}
                          </span>
                          {"group" in item && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#F0EFEA] text-[#666666]">
                              {item.group}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <span className="text-[11px] text-[#777777] block truncate mt-0.5">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <CornerDownLeft
                      size={13}
                      className={isSelected ? "text-[#FF5A1F]" : "text-transparent"}
                    />
                  </button>
                );
              })}

              {/* View all search results option */}
              <button
                onClick={() => handleSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="w-full mt-2 pt-2 border-t border-[#F0EFEA] flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-[#FF5A1F] hover:bg-[#FFF6F2] rounded-md transition-colors cursor-pointer"
              >
                <span>Full catalog search for &ldquo;{query}&rdquo;</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-[#FAFAF8] border-t border-[#EAE9E4] flex items-center justify-between text-[11px] text-[#888888]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCDAD4] font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCDAD4] font-mono text-[10px]">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCDAD4] font-mono text-[10px]">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCDAD4] font-mono text-[10px] font-bold text-[#555555]">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
