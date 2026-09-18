"use client";

import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import Navbar from "@/components/Navbar";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <span className="text-[#555555] font-medium">Search</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-2">
            Search
          </h1>
          <p className="text-[#555555] text-[14px] md:text-[15px]">
            Find papers, authors, methods, tasks, models, and datasets across Frontier Atlas.
          </p>
        </div>

        <div className="mb-8">
          <SearchBar autoFocus placeholder="Search..." />
        </div>

        <SearchResults query={query} />
        </div>
      </div>
    </div>
  );
}
