"use client";

import { TrendingUp, Clock3, Star } from "lucide-react";
interface Props {
  selectedSort: "popular" | "latest" | "citations";

onSortChange: (
  sort: "popular" | "latest" | "citations"
) => void;
}

export default function TaskFilterBar({
  selectedSort,
  onSortChange,
}: Props) {
  return (
    <div className="w-full flex flex-wrap items-center bg-white rounded-xl border border-gray-200 p-2 sm:px-5 sm:py-3 mb-4 sm:mb-5 max-w-full overflow-x-auto">
      {/* SORT */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase shrink-0">
          Sort
        </span>

        <div className="flex rounded-lg bg-gray-100 p-0.5 shrink-0">
          <button
            onClick={() => onSortChange("popular")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-medium transition-all ${
              selectedSort === "popular" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp size={13} />
            Popular
          </button>

          <button
            onClick={() => onSortChange("latest")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-medium transition-all ${
              selectedSort === "latest" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock3 size={13} />
            Recent
          </button>

          <button
            onClick={() => onSortChange("citations")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-medium transition-all ${
              selectedSort === "citations" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Star size={13} />
            Citations
          </button>
        </div>
      </div>
    </div>
  );
}