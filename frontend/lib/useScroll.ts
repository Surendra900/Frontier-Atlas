"use client";

import { useState, useEffect } from "react";

export function useScrollThreshold(threshold: number = 250) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container") || window;

    const handleScroll = () => {
      const scrollY = scrollContainer === window 
        ? window.scrollY 
        : (scrollContainer as HTMLElement).scrollTop;
      setIsScrolled(scrollY > threshold);
    };
    
    // Check initial position
    handleScroll();
    
    scrollContainer.addEventListener("scroll", handleScroll as EventListener, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll as EventListener);
  }, [threshold]);

  return isScrolled;
}
