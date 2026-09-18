"use client";

import { useEffect, useRef } from "react";

export default function MatrixLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Configuration
    let dotSize = 4;
    let dotSpacing = 8;
    const text = "FRONTIER ATLAS";

    // Mouse interaction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || 240;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    // Setup offscreen canvas for text rendering
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

    let dots: { x: number; y: number; active: boolean; brightness: number }[] = [];

    const setupDots = () => {
      if (!offCtx) return;

      // Dynamic dot resolution: ensure enough dots to render 14 chars legibly
      if (width < 450) {
        dotSpacing = 3;
        dotSize = 1.5;
      } else if (width < 768) {
        dotSpacing = 4;
        dotSize = 2;
      } else if (width < 1024) {
        dotSpacing = 6;
        dotSize = 3;
      } else {
        dotSpacing = 8;
        dotSize = 4;
      }

      offscreen.width = width;
      offscreen.height = height;

      // Draw text to offscreen canvas
      offCtx.clearRect(0, 0, width, height);
      offCtx.fillStyle = "black";
      offCtx.textBaseline = "middle";
      offCtx.textAlign = "center";
      
      // Keep text on a single line for all screens
      const lines = [text];

      // Dynamically find the perfect font size so the longest line fits exactly on screen
      let fontSize = Math.min(width * 0.18, 240); // Start large
      offCtx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
      
      // Scale down until it perfectly fits 92% of the screen width
      let maxLineWidth = Math.max(...lines.map(line => offCtx.measureText(line).width));
      while (maxLineWidth > width * 0.92 && fontSize > 10) {
        fontSize -= 2;
        offCtx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
        maxLineWidth = Math.max(...lines.map(line => offCtx.measureText(line).width));
      }
      
      // Draw lines centered vertically
      const lineHeight = fontSize * 1.1;
      const totalHeight = lineHeight * lines.length;
      let textStartY = (height - totalHeight) / 2 + (lineHeight / 2);
      
      lines.forEach(line => {
        offCtx.fillText(line, width / 2, textStartY);
        textStartY += lineHeight;
      });

      const imageData = offCtx.getImageData(0, 0, width, height).data;
      
      dots = [];
      const rows = Math.floor(height / dotSpacing);
      const cols = Math.floor(width / dotSpacing);

      const startY = (height - rows * dotSpacing) / 2;
      const startX = (width - cols * dotSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * dotSpacing;
          const y = startY + r * dotSpacing;
          
          // Check pixel data in the center of where the dot would be
          const px = Math.floor(x);
          const py = Math.floor(y);
          const index = (py * width + px) * 4;
          
          // Alpha channel determines if text is there
          const active = imageData[index + 3] > 128;
          
          dots.push({
            x,
            y,
            active,
            brightness: active ? Math.random() * 0.5 + 0.5 : 0.05
          });
        }
      }
    };

    setupDots();
    let lastWidth = width;
    window.addEventListener("resize", () => {
      if (Math.abs(width - lastWidth) > 50) {
        lastWidth = width;
        setupDots();
      }
    });

    const draw = () => {
      // Light theme background
      ctx.fillStyle = "#F8F7F2";
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        
        // Calculate distance to mouse
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetBrightness = dot.active ? 0.7 + Math.sin(time * 2 + dot.x * 0.01 + dot.y * 0.01) * 0.3 : 0.03;
        
        // Mouse hover effect - brighten nearby dots
        if (dist < 100) {
          const intensity = 1 - dist / 100;
          targetBrightness = dot.active 
            ? Math.max(targetBrightness, intensity * 2.0) 
            : intensity * 0.8;
        }

        // Smoothly interpolate brightness
        dot.brightness += (targetBrightness - dot.brightness) * 0.1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        
        if (dot.active) {
          // Brand color for active text: #F55036 (orange)
          ctx.fillStyle = `rgba(245, 80, 54, ${dot.brightness})`;
          // Make it glow intensely
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(245, 80, 54, ${dot.brightness * 0.8})`;
        } else {
          // Background dots match the background until hovered
          // We use the brand color but tied strictly to the hover brightness
          // If not hovered, brightness is near 0 so it's invisible
          ctx.fillStyle = `rgba(245, 80, 54, ${Math.max(0, dot.brightness - 0.05)})`;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section
      aria-label="Frontier Atlas LED display"
      className="w-full bg-[#F8F7F2] border-b border-[#E5E5E0] overflow-hidden cursor-crosshair"
      style={{ aspectRatio: "8 / 1", minHeight: "60px", maxHeight: "200px" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full"></canvas>
    </section>
  );
}
