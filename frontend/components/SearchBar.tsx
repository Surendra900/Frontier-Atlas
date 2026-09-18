
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchSuggestions, type SearchResult } from "@/lib/search";
import { motion } from "framer-motion";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "default" | "compact" | "homepage";
  initialQuery?: string;
  layoutIdPrefix?: string;
}

export default function SearchBar({
  placeholder = "Search papers, authors, methods, tasks, models, datasets...",
  autoFocus = false,
  variant = "default",
  initialQuery = "",
  layoutIdPrefix,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchSuggestions(q, 8);
      setSuggestions(results);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          const href = `/${suggestion.type === "papers" ? "papers" : suggestion.type}/${suggestion.slug}`;
          router.push(href);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getSuggestionIcon = (type: SearchResult["type"]) => {
    const icons: Record<SearchResult["type"], string> = {
      papers: "📄",
      authors: "👤",
      methods: "⚗️",
      tasks: "✓",
      models: "🤖",
      datasets: "📊",
    };
    return icons[type] || "📄";
  };

  const getSuggestionTypeLabel = (type: SearchResult["type"]) => {
    const labels: Record<SearchResult["type"], string> = {
      papers: "Paper",
      authors: "Author",
      methods: "Method",
      tasks: "Task",
      models: "Model",
      datasets: "Dataset",
    };
    return labels[type] || "Result";
  };

  // Determine if we should show suggestions
  const shouldShowSuggestions = showSuggestions && suggestions.length > 0;

  const isHomepagePresentation = variant === "homepage";

  return (
    <div
  ref={containerRef}
 className={`relative ${
  variant === "compact"
    ? "w-full max-w-[360px]"
    : "w-full max-w-[640px] mx-auto"
}`}
>
        <motion.form
          layoutId={layoutIdPrefix ? `${layoutIdPrefix}-container` : undefined}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          onSubmit={handleSubmit}
          className={`relative flex items-center px-3 md:px-5 bg-white border border-[#E5E5E0] h-10 md:h-12
  shadow-[0_8px_30px_rgb(0,0,0,0.06)]
  hover:shadow-[0_12px_32px_rgb(0,0,0,0.10)]
  focus-within:border-[#FF5A1F]/40
  focus-within:shadow-[0_0_0_3px_rgba(255,90,31,0.08)]
  transition-all duration-200
  rounded-full`}
        >
          <motion.div
            layoutId={layoutIdPrefix ? `${layoutIdPrefix}-icon` : undefined}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className={`flex items-center text-[#737373] shrink-0 ${
              isHomepagePresentation ? "mr-2 md:mr-3" : "mr-2 md:mr-3"
            }`}
          >
          <Search
            size={variant === "compact" ? 16 : 18}
            className={isHomepagePresentation ? "md:w-[20px] md:h-[20px]" : undefined}
          />
        </motion.div>
        <motion.input
          layoutId={layoutIdPrefix ? `${layoutIdPrefix}-input` : undefined}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          ref={inputRef as any}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`bg-transparent outline-none flex-1 text-[#111111] placeholder:text-[#737373] min-w-0 pr-10 text-left h-full ${
           variant === "compact"
  ? "text-[12px] md:text-[13px]"
  : isHomepagePresentation ? "text-[12px] md:text-[14px] truncate mr-2" : "text-[13px] md:text-[15px]"
          }`}
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={shouldShowSuggestions}
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
        />

        {/* Loading Spinner */}
        {loading && (
          <Loader2
            size={variant === "compact" ? 16 : 18}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-[#F55036] animate-spin"
          />
        )}

        {/* Clear Button */}
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#111111] transition-colors p-1 rounded-full hover:bg-[#F5F5F0]"
            aria-label="Clear search"
          >
            <X size={variant === "compact" ? 16 : 18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("open-command-palette"));
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAFAF8] text-[#888888] border border-[#E5E5E0] hover:bg-[#F0EFEA] hover:text-[#333333] transition-colors cursor-pointer"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <span>⌘K</span>
          </button>
        )}
        
      </motion.form>

      {/* Suggestions Dropdown */}
      {shouldShowSuggestions && (
        <motion.ul
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          id="search-suggestions"
          role="listbox"
          className={`
absolute
${isHomepagePresentation ? "left-[-40px] w-[440px] max-w-[calc(100vw-2rem)]" : "left-0 right-0"}
${isHomepagePresentation ? "top-[calc(100%+8px)]" : "top-[calc(100%+12px)]"}

bg-white

${isHomepagePresentation ? "rounded-xl border border-[#E5E5E0] py-2" : "rounded-[28px] border border-[#ECEAE4]"}

${isHomepagePresentation ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "shadow-[0_24px_80px_rgba(0,0,0,0.10)]"}

overflow-hidden
z-50

${isHomepagePresentation ? "max-h-[400px]" : "max-h-[420px]"}
overflow-y-auto
`}
        >
          {suggestions.map((suggestion, index) => {
            const href = `/${suggestion.type === "papers" ? "papers" : suggestion.type}/${suggestion.slug}`;
            return (
              <li
                key={`${suggestion.type}-${suggestion.id}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={`border-b border-[#EBEBE6] last:border-b-0 ${
                  index === selectedIndex
                    ? "bg-[#F8F7F2]"
                    : "hover:bg-[#F8F7F2]"
                }`}
              >
                <Link
                  href={href}
                  onClick={() => setShowSuggestions(false)}
                  className={`flex items-start gap-3 cursor-pointer transition-colors block w-full h-full ${
                    isHomepagePresentation ? "px-4 md:px-5 py-3" : "px-4 py-3"
                  }`}
                >
                  {isHomepagePresentation ? (
                    <div className="flex flex-col gap-1 text-left">
                      <h4 className="text-[14px] font-semibold text-[#111111] leading-snug line-clamp-2">
                        {suggestion.title}
                      </h4>
                      {suggestion.subtitle && (
                        <div className="text-[12px] text-[#737373]">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
  className="
    w-10
    h-10
    rounded-xl
    bg-[#F7F6F2]
    flex
    items-center
    justify-center
    shrink-0
  "
>
  <span className="text-base">
    {getSuggestionIcon(suggestion.type)}
  </span>
</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
  <span className="flex-1 text-[15px] font-semibold text-[#111111] leading-6 truncate">
    {suggestion.title}
  </span>

  <span
    className="
      shrink-0
      rounded-full
      bg-[#F5F5F4]
      px-2.5
      py-1
      text-[10px]
      font-semibold
      uppercase
      tracking-wide
      text-[#737373]
    "
  >
    {getSuggestionTypeLabel(suggestion.type)}
  </span>
</div>
                    {suggestion.subtitle && (
                      <p className="mt-1 text-[13px] text-[#6B7280] leading-5">
  {suggestion.subtitle}
</p>
                    )}
                  </div>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </motion.ul>
      )}
    </div>
  );
}
