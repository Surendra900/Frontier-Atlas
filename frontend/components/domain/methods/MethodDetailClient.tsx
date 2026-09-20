"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Settings,
  MessageSquare,
  Eye,
  Mic,
  Bot,
  Brain,
  Dumbbell,
  LineChart,
  Zap,
  Search,
  Gamepad2,
  Wand2,
  Layers,
  Cpu,
  CheckSquare,
  Binary,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MethodFilteredPapers from "@/components/domain/methods/MethodFilteredPapers";
import { useMethodDetail } from "@/lib/methodCache";

const ICON_MAP: Record<string, React.ElementType> = {
  "General": Settings,
  "Language": MessageSquare,
  "Vision": Eye,
  "Audio & Speech": Mic,
  "Agents": Bot,
  "Reasoning": Brain,
  "Training": Dumbbell,
  "Optimization": LineChart,
  "Inference": Zap,
  "Retrieval": Search,
  "Reinforcement Learning": Gamepad2,
  "Diffusion & Generation": Wand2,
  "Multimodal": Layers,
  "Architectures": Cpu,
  "Evaluation": CheckSquare,
  "Embeddings": Binary
};

function MethodDetailSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fafafa] text-slate-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col">
        <main className="max-w-7xl mx-auto px-5 lg:px-6 py-5 lg:py-6 w-full">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-10 bg-slate-100 rounded animate-pulse" />
            <span className="text-slate-300">›</span>
            <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
            <span className="text-slate-300">›</span>
            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
          </div>

          <section className="mb-8 lg:mb-10">
            <div className="w-full max-w-4xl">
              <div className="h-10 w-[300px] max-w-full bg-slate-100 rounded animate-pulse mb-4" />
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-10/12 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-8/12 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-4 bg-white border border-gray-100 rounded-none p-4 shadow-sm">
                <div className="w-14 h-14 bg-orange-50 rounded-none animate-pulse" />
                <div>
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse mb-2" />
                  <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </section>

          {/* Papers skeleton */}
          <div className="space-y-4 pb-20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col xl:flex-row gap-4 p-4 border border-gray-100 bg-white animate-pulse rounded-xl">
                <div className="flex-1 flex flex-col">
                  <div className="h-5 bg-slate-100 rounded mb-2 w-10/12" />
                  <div className="h-4 bg-slate-100 rounded mb-2 w-7/12" />
                  <div className="h-4 bg-slate-100 rounded mb-4 w-full" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-slate-100 rounded" />
                    <div className="h-6 w-28 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-[150px] h-[200px] shrink-0 bg-slate-100 order-first xl:order-last" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MethodDetailClient({ slug }: { slug: string }) {
  const { data: methodDetail, loading, error } = useMethodDetail(slug);

  if (loading) {
    return <MethodDetailSkeleton />;
  }

  if (error || !methodDetail) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#fafafa] text-slate-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`body { overflow: hidden !important; }`}</style>
        <Navbar />
        <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-12 text-center text-slate-900 mt-20">Method not found. Please try another one.</div>
        </div>
      </div>
    );
  }

  const categoryName = methodDetail.category || methodDetail.categoryName || "Methods";
  const actualPaperCount = methodDetail.paperCount ?? methodDetail.papers?.length ?? 0;

  const DynamicIcon = ICON_MAP[categoryName] || FileText;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fafafa] text-slate-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`body { overflow: hidden !important; }`}</style>
      <Navbar />

      <div id="scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <main className="max-w-7xl mx-auto px-5 lg:px-6 py-5 lg:py-6 w-full">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs lg:text-sm text-gray-500 uppercase mb-2 lg:mb-4">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span>›</span>
            <Link href="/methods" className="hover:text-gray-800">Methods</Link>
            <span>›</span>
            <span className="text-orange-600 font-medium">{methodDetail.name}</span>
          </nav>

          <section className="mb-8 lg:mb-10">
            <div className="w-full max-w-4xl">
              <h1 className="text-2xl lg:text-4xl font-bold mb-1.5 lg:mb-2 text-slate-800 leading-tight uppercase">
                {methodDetail.name}
              </h1>

              <p className="text-sm lg:text-[15px] text-gray-500 leading-[1.65] mb-5 lg:mb-6">
                {(methodDetail.description || `${methodDetail.name} is an advanced artificial intelligence method.`) +
                  ` By leveraging state-of-the-art computational techniques, this method provides researchers and engineers with powerful tools to solve complex real-world problems. Its continued advancement plays a central role in shaping the next generation of AI systems.`}
              </p>

              {/* Metrics Widget */}
              <div className="inline-flex items-center gap-4 bg-white border border-gray-100 rounded-none p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="bg-orange-50 p-3 rounded-none mr-2 lg:mr-0">
                  <DynamicIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Papers Using</div>
                  <div className="text-2xl lg:text-3xl font-bold text-orange-600">{actualPaperCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Filter Bar + Paper List */}
          <MethodFilteredPapers
            papers={methodDetail.papers ?? []}
            methodName={methodDetail.name}
          />
        </main>
      </div>
    </div>
  );
}
