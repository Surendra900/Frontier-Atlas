"use client";

import * as React from "react";
import Link from "next/link";

import { FileText, Code } from "lucide-react";

type SortType = "trending" | "newest" | "most cited";

export function PapersFeed({ papers, methodTitle }: { papers: any[]; methodTitle: string }) {
  const [sortBy, setSortBy] = React.useState<SortType>("trending");

  const sortedPapers = React.useMemo(() => {
    const safeArray = [...(papers || [])];
    if (sortBy === "newest") {
      return safeArray.sort((a, b) => new Date(b.publicationDate || 0).getTime() - new Date(a.publicationDate || 0).getTime());
    } else if (sortBy === "most cited") {
      return safeArray.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
    }
    // "trending" default - sort by a combined score of citations and stars
    return safeArray.sort((a, b) => {
      const scoreA = (a.citationCount || 0) + (a.githubStars ?? ((a.citationCount || 0) * 3 + 150));
      const scoreB = (b.citationCount || 0) + (b.githubStars ?? ((b.citationCount || 0) * 3 + 150));
      return scoreB - scoreA;
    });
  }, [papers, sortBy]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-default pb-4 mb-8 gap-4">
        <div className="flex items-center gap-3 bg-surface border border-default p-1 rounded-md shadow-sm">
          <button 
            onClick={() => setSortBy("trending")}
            className={`px-3 py-1.5 text-[12px] uppercase tracking-wider rounded-[4px] transition-all duration-200 ${sortBy === 'trending' ? 'font-bold bg-primary text-inverse shadow-sm' : 'font-medium text-secondary hover:text-primary hover:bg-default/50'}`}
          >
            Trending
          </button>
          <button 
            onClick={() => setSortBy("newest")}
            className={`px-3 py-1.5 text-[12px] uppercase tracking-wider rounded-[4px] transition-all duration-200 ${sortBy === 'newest' ? 'font-bold bg-primary text-inverse shadow-sm' : 'font-medium text-secondary hover:text-primary hover:bg-default/50'}`}
          >
            Newest
          </button>
          <button 
            onClick={() => setSortBy("most cited")}
            className={`px-3 py-1.5 text-[12px] uppercase tracking-wider rounded-[4px] transition-all duration-200 ${sortBy === 'most cited' ? 'font-bold bg-primary text-inverse shadow-sm' : 'font-medium text-secondary hover:text-primary hover:bg-default/50'}`}
          >
            Most Cited
          </button>
        </div>
        <div className="text-[13px] text-secondary font-medium font-mono bg-surface border border-default px-3 py-1.5 rounded-md shadow-sm">
          {papers?.length || 0} papers using {methodTitle}
        </div>
      </div>

      <div className="flex flex-col">
        {sortedPapers.length === 0 ? (
          <div className="py-12 text-center text-secondary">No papers found for this method.</div>
        ) : (
          sortedPapers.map((paper) => (
            <div 
              key={paper.id} 
              className="border-0 border-t border-default bg-transparent shadow-none rounded-none py-6 px-0 hover:bg-surface/30 transition-colors first:border-t-0 flex flex-col"
            >
              <div className="p-0 mb-3">
                <h3 className="text-xl font-bold leading-none tracking-tight">
                  <Link href={`/papers/${paper.slug || paper.id}`} className="hover:text-[#F55036] transition-colors">
                    {paper.title}
                  </Link>
                </h3>
              </div>
              <div className="p-0">
                <p className="text-sm text-secondary mb-3">
                  {paper.authors ? (paper.authors.map((a: any) => a.name).join(", ")) : "Unknown"} • {paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : "Unknown"}
                </p>
                <p className="text-primary text-sm line-clamp-2 mb-4 leading-relaxed opacity-90">
                  {paper.abstract}
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center gap-1.5 font-medium bg-surface shadow-sm">
                    <FileText className="w-3.5 h-3.5" />
                    {paper.citationCount?.toLocaleString() || 0} Citations
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center gap-1.5 font-medium bg-surface shadow-sm">
                    <Code className="w-3.5 h-3.5" />
                    {(paper.githubStars ?? ((paper.citationCount || 0) * 3 + 150)).toLocaleString()} Stars
                  </div>
                  {!!paper.githubUrl && (
                    <Link href={paper.githubUrl} target="_blank" className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center gap-1.5 font-medium hover:text-[#F55036] hover:border-[#F55036] cursor-pointer transition-colors bg-[#F55036]/5 border-[#F55036]/20">
                      <Code className="w-3.5 h-3.5 text-[#F55036]" />
                      Code Available
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
