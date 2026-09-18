import { useState, useEffect } from 'react';
import type { PaperDetail as PaperDetailType } from "@/lib/papers";

export function useRecentPapers() {
  const [recentPapers, setRecentPapers] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent_papers');
      if (stored) {
        setRecentPapers(JSON.parse(stored));
      }
    } catch (error) {
      // Safely attempt to clear corrupted data, ignore if it fails
      try {
        localStorage.removeItem('recent_papers');
      } catch (e) {
        console.warn("Could not read or clear local storage.");
      }
    }
  }, []);

  const addRecentPaper = (paper: PaperDetailType | any) => {
    setRecentPapers((prev) => {
      const id = paper.slug || paper.id;
      // Remove it if it already exists in the history
      const filtered = prev.filter((p) => (p.slug || p.id) !== id);
      
      // STRIP DOWN THE OBJECT: Only keep what the Card actually needs
      const lightweightPaper = {
        id: paper.id,
        slug: paper.slug,
        title: paper.title,
        thumbnail: paper.thumbnail || paper.thumbnailUrl, 
        authors: (paper.authors || []).slice(0, 3).map((a: any) => ({ name: a.name })),
        githubUrl: paper.githubUrl,
        conference: paper.conferences?.[0]?.name || paper.conference || "",
        citations: paper.citationCount || paper.citations || 0,
      };

      // Add to front, keep exactly 4 items
      const updated = [lightweightPaper, ...filtered].slice(0, 4); 
      
      try {
        // Attempt 1: Save the normal list
        localStorage.setItem('recent_papers', JSON.stringify(updated));
      } catch (error) {
        console.warn("Storage full, attempting to reset recent papers.");
        
        try {
          // Attempt 2: Wipe the slate clean and try to save just this one
          localStorage.removeItem('recent_papers');
          localStorage.setItem('recent_papers', JSON.stringify([lightweightPaper]));
        } catch (fatalError) {
          // Attempt 3: The browser refuses to save anything. 
          // Fail silently so we don't crash the entire website!
          console.error("Local storage is completely disabled or full. Skipping save.");
        }
      }

      return updated;
    });
  };

  return { recentPapers, addRecentPaper };
}