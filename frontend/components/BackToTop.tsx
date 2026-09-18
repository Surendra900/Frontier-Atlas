"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (!container) return;

    const onScroll = () => {
      setVisible(container.scrollTop > 300);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("scroll-container");
    container?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E5E5E0] shadow-[0_4px_16px_rgba(0,0,0,0.10)] text-[#555555] hover:text-[#FF5A1F] hover:border-[#FF5A1F]/40 hover:shadow-[0_4px_20px_rgba(255,90,31,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${
        visible
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none translate-y-2"
      }`}
    >
      <ArrowUp size={16} strokeWidth={2.5} />
    </button>
  );
}
