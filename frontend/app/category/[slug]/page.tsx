"use client";
import { use, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PaperList from "@/components/PaperFeed";
import PaperTabs from "@/components/PaperTabs";

import HeroSection from "@/components/HeroSection";

const SLUG_TO_LABEL: Record<string, string> = {
  "trending": "Trending Papers",
  "latest": "Latest Papers",
  "github-stars": "Most GitHub Stars",
  "agents": "Agents",
  "reasoning": "Reasoning",
  "language-modeling": "Language Modeling",
  "coding-agents": "Coding Agents",
  "computer-use": "Computer Use",
  "world-models": "World Models",
  "robotics": "Robotics",
  "transformer": "Transformer",
  "chain-of-thought": "Chain of Thought",
  "react": "ReAct",
  "lora": "LoRA",
  "rlhf": "RLHF",
  "dpo": "DPO",
  "mcp": "MCP",
  "text-generation": "Text Generation",
  "image-generation": "Image Generation",
  "video-generation": "Video Generation",
  "audio-generation": "Audio Generation",
};

function getFilterParams(slug: string) {
  const params: { sort?: string; task?: string; method?: string } = {};

  switch (slug) {
    case "trending":
      params.sort = "trending";
      break;
    case "latest":
      params.sort = "latest";
      break;
    case "github-stars":
      params.sort = "stars";
      break;
    case "agents":
      params.task = "agents";
      break;
    case "reasoning":
      params.task = "reasoning";
      break;
    case "language-modeling":
      params.task = "language-modeling";
      break;
    case "coding-agents":
      params.task = "coding-agents";
      break;
    case "computer-use":
      params.task = "computer-use";
      break;
    case "world-models":
      params.task = "world-models";
      break;
    case "robotics":
      params.task = "robotics";
      break;
    case "transformer":
      params.method = "transformer";
      break;
    case "chain-of-thought":
      params.method = "chain-of-thought";
      break;
    case "react":
      params.method = "react";
      break;
    case "lora":
      params.method = "lora";
      break;
    case "rlhf":
      params.method = "rlhf";
      break;
    case "dpo":
      params.method = "dpo";
      break;
    case "mcp":
      params.method = "mcp";
      break;
    case "text-generation":
      params.task = "text-generation";
      break;
    case "image-generation":
      params.task = "image-generation";
      break;
    case "video-generation":
      params.task = "video-generation";
      break;
    case "audio-generation":
      params.task = "audio-generation";
      break;
    default:
      if (["transformer", "diffusion-models", "mixture-of-experts", "policy-learning", "chain-of-thought", "rag", "mcp", "lora", "rlhf"].includes(slug)) {
        params.method = slug;
      } else {
        params.task = slug;
      }
  }

  return params;
}

function getPeriodParam(selectedPeriod: string) {
  switch (selectedPeriod) {
    case "Today":
      return "today";
    case "This Week":
      return "week";
    case "This Month":
      return "month";
    case "All time":
      return "all";
    default:
      return "today";
  }
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const label = SLUG_TO_LABEL[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    slug === "latest" ? "Today" : "All time"
  );
  const filterParams = useMemo(() => getFilterParams(slug), [slug]);

  const handleSidebarSelect = (item: string) => {
    void item;
    setSelectedTag(undefined);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar />
      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-6">
          <HeroSection
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          />
        </div>
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-6 pb-20 flex items-start gap-5 lg:gap-8 xl:gap-10">
          <div className="hidden xl:block w-[240px] shrink-0 sticky top-3 h-[calc(100vh-80px)]">
            <Sidebar onItemSelect={handleSidebarSelect} initialActive={label} />
          </div>
          <main className="flex-1 min-w-0 xl:max-w-[1380px]">
            <PaperTabs
              selectedPeriod={selectedPeriod}
              onPeriodSelect={setSelectedPeriod}
            />
            <PaperList
              selectedTag={selectedTag}
              filterParams={filterParams}
              period={getPeriodParam(selectedPeriod)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
