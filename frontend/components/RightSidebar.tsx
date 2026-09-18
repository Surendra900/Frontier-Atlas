"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Star,
  GitFork,
  Loader2,
} from "lucide-react";
import { getDiscussions, type Discussion } from "@/lib/discussionApi"




// Hacker News icon
function HackerNewsIcon({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#FF6600" />
      <path
        d="M8 6l4 7v5h2v-5l4-7h-2.2L13 11 10.2 6H8z"
        fill="white"
      />
    </svg>
  );
}


// GitHub icon
function GithubIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState("all");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiscussions() {
      try {
        setLoading(true);
        const data = await getDiscussions();
        setDiscussions(data);
        setError(null);
      } catch (err) {
        console.error("❌ Discussion fetch failed", err);
       
        setError("Failed to load discussions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadDiscussions();
  }, []);


const filteredTopics =
  (
    !Array.isArray(discussions)
      ? []
      : activeTab === "all"
      ? discussions
      : discussions.filter(topic => topic?.platform === activeTab)
  ).slice(0, 5);

    

  return (
    <aside className="flex flex-col w-full shrink-0 justify-start pb-12 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
      <div className="p-0 xl:p-2 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#F55036] fill-transparent" />
          <span className="text-[15px] font-bold text-[#111111]">
            What&apos;s happening
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-5">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "all" ? "bg-[#EBEBE6] text-[#F55036]" : "text-[#8B8B8B] hover:bg-[#EBEBE6] hover:text-[#111111]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("hackernews")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "hackernews"
                ? "bg-[#EBEBE6] text-[#F55036]"
                : "text-[#8B8B8B] hover:bg-[#EBEBE6] hover:text-[#111111]"
            }`}
          >
            Hacker News
          </button>
          
          <button 
            onClick={() => setActiveTab("github")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              activeTab === "github" ? "bg-[#EBEBE6] text-[#F55036]" : "text-[#8B8B8B] hover:bg-[#EBEBE6] hover:text-[#111111]"
            }`}
          >
            GitHub
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#8B8B8B] gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10 text-[13px] font-semibold text-[#F55036]">
              {error}
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-[13px] font-semibold text-[#8B8B8B]">
              No topics found.
            </div>
          ) : (
            filteredTopics.map((topic, idx) => (
            <a
              key={idx}
              href={topic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 py-4 border-b border-[#E5E5E0] last:border-b-0 group cursor-pointer hover:bg-[#F8F7F2] rounded-lg transition-colors"
            >
              {/* Raw Icon */}
              <div className="shrink-0 pt-0.5">
                {topic.platform === "hackernews" && <HackerNewsIcon  size={22} className="text-[#111111]" />}
                {topic.platform === "github" && <GithubIcon size={22} className="text-[#111111]" />}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Meta */}
                {/* Meta */}
<div className="flex items-center gap-1.5 text-[11px] font-medium mb-1">
  <span className="text-[#555555]">{topic.source}</span>
  <span className="text-[#DCDCD7]">•</span>
  <span className="text-[#8B8B8B]">{topic.time}</span>
</div>
                
                <h4 className="text-[13px] font-bold text-[#111111] leading-[1.5] mb-3 group-hover:text-[#F55036] transition-colors">
                  {topic.title}
                </h4>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] font-semibold text-[#8B8B8B]">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} />
                    <span>{topic.likes}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <GitFork size={14} />
                    <span>{topic.comments}</span>
                  </div>
                </div>
              </div>

               </a>
            ))
          )}
        </div>

        {/* Footer Button */}
        <Link
          href="/discussions"
          className="w-full border border-[#E5E5E0] text-[#F55036] bg-white hover:border-[#F55036] hover:bg-[#F8F7F2] hover:text-[#E0462D] rounded-[8px] py-[10px] flex items-center justify-center gap-1.5 font-bold text-[12px] mt-2 transition-colors cursor-pointer"
        >
          View all discussions
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>

      </div>
    </aside>
  );
}
