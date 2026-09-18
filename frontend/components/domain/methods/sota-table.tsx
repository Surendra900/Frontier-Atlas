"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SotaResult {
  dataset: string;
  task: string;
  metric: string;
  score: string;
  model: string;
}

export function SotaTable({ results }: { results: SotaResult[] }) {
  const [expanded, setExpanded] = React.useState(false);
  
  const safeResults = results || [];
  const hasMore = safeResults.length > 5;
  const visibleResults = expanded ? safeResults : safeResults.slice(0, 5);

  if (safeResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-default rounded-lg mb-8 overflow-hidden shadow-sm transition-all duration-300">
      <div className="px-6 py-4 border-b border-default bg-surface/50">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-secondary uppercase">State of the Art Results</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/30">
              <th className="px-6 py-3 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-default">Dataset</th>
              <th className="px-6 py-3 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-default">Task</th>
              <th className="px-6 py-3 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-default">Metric</th>
              <th className="px-6 py-3 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-default">Score</th>
              <th className="px-6 py-3 text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-default">Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {visibleResults.map((sota, idx) => (
              <tr key={idx} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-3 text-[13px] font-semibold text-primary">{sota.dataset}</td>
                <td className="px-6 py-3 text-[13px] text-secondary">{sota.task}</td>
                <td className="px-6 py-3 text-[13px] text-secondary">{sota.metric}</td>
                <td className="px-6 py-3 text-[13px] font-bold text-brand">{sota.score || (sota as any).value}</td>
                <td className="px-6 py-3 text-[13px] text-secondary">{sota.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3.5 flex items-center justify-center gap-2 text-[12px] font-bold text-secondary uppercase tracking-wider hover:text-primary hover:bg-surface/80 transition-colors border-t border-default"
        >
          {expanded ? (
            <>View Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>View All {safeResults.length} Results <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
