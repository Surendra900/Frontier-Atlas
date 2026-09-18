"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDiscussions, type Discussion } from "@/lib/discussionApi";
import {
  Star,
  GitFork,
  ArrowUpRight,
  Github,
  Search,
  MessageSquare,
  Sparkles,
  Layers,
  Bot,
  Brain,
  Eye,
  SlidersHorizontal,
  X,
  Plus,
} from "lucide-react";

const TOPICS = [
  { id: "all", label: "All Topics", icon: Layers },
  { id: "LLMs & Reasoning", label: "LLMs & Reasoning", icon: Brain },
  { id: "Agents & Automation", label: "Agents & Automation", icon: Bot },
  { id: "Vision & Multimodal", label: "Vision & Multimodal", icon: Eye },
  { id: "Open Source & Tooling", label: "Open Source Tools", icon: Sparkles },
];

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformTab, setPlatformTab] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getDiscussions();
        setDiscussions(data);
      } catch (err) {
        console.error("Failed to load discussions:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredDiscussions = useMemo(() => {
    return discussions.filter((item) => {
      // Platform filter
      if (platformTab !== "all" && item.platform !== platformTab) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== "all" && item.category !== selectedTopic) {
        return false;
      }
      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        const matchesCat = (item.category || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSource && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [discussions, platformTab, selectedTopic, searchQuery]);

  const resetFilters = () => {
    setPlatformTab("all");
    setSelectedTopic("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#111111] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 md:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="border-b border-[#E5E5E0] pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(245,80,54,0.08)] text-[#F55036] text-xs font-semibold mb-2">
                <MessageSquare size={13} />
                Developer & Research Community
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
                Discussions & Trends
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#666666]">
                Track trending discussions, open-source repositories, and technical breakdowns
                from GitHub and Hacker News covering AI algorithms, models, and systems.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com/topics/artificial-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E5E0] bg-white text-xs font-bold text-[#333] hover:border-[#F55036] hover:text-[#F55036] transition-colors shadow-2xs"
              >
                <Github size={15} />
                GitHub AI Topics
                <ArrowUpRight size={13} />
              </a>
              <a
                href="https://news.ycombinator.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)] cursor-pointer"
              >
                <Plus size={14} />
                Start Discussion
              </a>
            </div>
          </div>

          {/* Search Bar & Controls */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions, topics, or models..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#222]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Platform Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E5E0] rounded-xl shrink-0">
              {[
                { id: "all", label: "All Platforms" },
                { id: "github", label: "GitHub" },
                { id: "hackernews", label: "Hacker News" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPlatformTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    platformTab === tab.id
                      ? "bg-[#F55036] text-white shadow-xs"
                      : "text-[#666] hover:text-[#111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Category Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#888] mr-1 flex items-center gap-1">
              <SlidersHorizontal size={13} />
              Topics:
            </span>
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              const active = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "bg-[#171717] text-white font-bold shadow-xs"
                      : "bg-white border border-[#E5E5E0] text-[#555] hover:border-[#888] hover:text-[#111]"
                  }`}
                >
                  <Icon size={12} className={active ? "text-white" : "text-[#888]"} />
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Discussions Grid / List */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#F55036] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#777]">
              Aggregating trending developer discussions...
            </p>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#E5E5E0] rounded-2xl my-8 p-8">
            <MessageSquare size={32} className="mx-auto text-[#BBB] mb-3" />
            <h3 className="text-base font-bold text-[#171717]">
              No discussions match your filter
            </h3>
            <p className="text-xs text-[#777] mt-1 max-w-sm mx-auto">
              Try searching with different keywords or resetting platform and topic filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDiscussions.map((discussion, index) => (
              <a
                key={index}
                href={discussion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F55036] hover:shadow-md no-underline"
              >
                <div>
                  {/* Top Bar: Platform & Topic & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0EFEB]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          discussion.platform === "github"
                            ? "bg-[#24292E] text-white"
                            : "bg-[#FF6600] text-white"
                        }`}
                      >
                        {discussion.platform === "github" ? (
                          <>
                            <Github size={11} />
                            GitHub
                          </>
                        ) : (
                          <>🔥 Hacker News</>
                        )}
                      </span>

                      {discussion.category && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#F4F4F0] text-[#555] border border-[#E5E5E0]">
                          {discussion.category}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-[#888]">
                      {discussion.time}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mt-3 text-base font-bold leading-snug text-[#171717] transition-colors group-hover:text-[#F55036]">
                    {discussion.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-[#666] line-clamp-3">
                    {discussion.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="mt-5 flex items-center justify-between border-t border-[#F0EFEB] pt-3 text-xs">
                  <div className="flex items-center gap-4 text-[#777]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Star
                        size={13}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span>{discussion.likes}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium">
                      <GitFork size={13} />
                      <span>{discussion.comments}</span>
                    </div>

                    <span className="truncate max-w-[120px] text-[11px] text-[#999]">
                      via {discussion.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-xs text-[#F55036] opacity-0 group-hover:opacity-100 transition-opacity">
                    Join Thread
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}