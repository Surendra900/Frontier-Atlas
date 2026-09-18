"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import { getCategoryColors } from "@/lib/categoryColors";

export function CategoryPillBar({ categories }: { categories: any[] }) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || "");
  const pillBarRef = useRef<HTMLDivElement>(null);

  // track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    categories.forEach((group) => {
      const el = document.getElementById(group.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(group.id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  // scroll pill into view when activeId changes
  useEffect(() => {
    const pill = pillBarRef.current?.querySelector(
      `[data-id="${activeId}"]`
    ) as HTMLElement | null;
    pill?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  const handlePillClick = useCallback((id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (!el) return;

    // Navbar height + pill bar height + a little breathing room
    const offset = 110;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="sticky top-[56px] xl:top-[52px] z-40 bg-[#F8F7F2] border-b border-[#E5E5E0] mb-6 -mx-4 md:-mx-8 xl:-mx-12 px-4 md:px-8 xl:px-12">
      <div
        ref={pillBarRef}
        className="flex items-center gap-2 overflow-x-auto py-3 hide-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {categories.map((group) => {
          const active = activeId === group.id;
          const colors = getCategoryColors(group.id);
          const Icon = group.iconName
            ? ((LucideIcons as any)[group.iconName] as React.ElementType)
            : LucideIcons.Layers;

          return (
            <button
              key={group.id}
              data-id={group.id}
              onClick={() => handlePillClick(group.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 min-h-[32px] transition-all duration-200 ease-out cursor-pointer select-none border
                ${
                  active
                    ? "bg-[#F55036] text-white border-[#F55036]"
                    : "bg-white border-[#E5E5E0] text-[#555555] hover:border-[#FF5A1F]/50 hover:bg-[#FFF7F3]"
                }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${active ? "text-white" : "text-[#F55036]"}`}
                strokeWidth={2}
              />
              <span className="text-[12px] font-semibold whitespace-nowrap">
                {group.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
