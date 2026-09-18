"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RelatedPaperCard } from "../../components/PaperDetail";
import { fetchWithAuthRetry } from "@/lib/auth-client";
import { mapBackendPaper, type Paper } from "@/lib/paperApi";

const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8787" : defaultApiUrl)).replace(/\/$/, "");
export default function SavedPapersPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedPapers() {
      try {
        const res = await fetchWithAuthRetry(`${API_BASE}/api/v1/research-papers/saved`);

        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data.papers) ? data.papers : [];
          setPapers(rawList.map((p: any) => mapBackendPaper(p)));
        } else if (res.status === 401 || res.status === 403) {
          router.push("/login?redirect=/saved");
        }
      } catch (error) {
        console.error("Failed to load saved papers", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedPapers();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717] tracking-tight pt-10 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <h1 className="text-3xl font-black mb-2">Saved Papers</h1>
        <p className="text-[#8B8B8B] mb-8">Papers you have bookmarked for later reading.</p>

        {loading ? (
          <div className="text-[#8B8B8B] font-medium">Loading your library...</div>
        ) : papers.length === 0 ? (
          <div className="p-10 border border-[#EDE8DF] bg-white rounded-lg text-center">
            <p className="text-[#555] font-medium">You haven't saved any papers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {papers.map((paper) => (
              <RelatedPaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}