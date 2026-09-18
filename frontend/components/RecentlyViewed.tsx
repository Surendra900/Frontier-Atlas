'use client';

import { useRecentPapers } from '@/lib/useRecentPapers';
import { RelatedPaperCard } from './PaperDetail'; 

export default function RecentlyViewed() {
  const { recentPapers } = useRecentPapers();

  if (recentPapers.length === 0) return null;

  return (
    <section className="border-t border-[#ECE7DD] pt-6 mt-10">
      <h2 className="section-label mb-3.5">RECENTLY VIEWED</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {recentPapers.map((paper) => (
          <RelatedPaperCard key={paper.slug || paper.id} paper={paper as any} />
        ))}
      </div>
    </section>
  );
}