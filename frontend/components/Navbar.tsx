"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { usePathname } from "next/navigation";
import { useScrollThreshold } from "@/lib/useScroll";
import Sidebar from "@/components/Sidebar";
import { prefetchOrganizationDirectory } from "@/lib/organizations";

export default function Navbar({
  activeSort,
  onItemSelect,
}: {
  activeSort?: string;
  onItemSelect?: (item: string) => void;
} = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isScrolled = useScrollThreshold(50);
  const pathname = usePathname();

  const isMethodsActive = pathname.startsWith("/methods");
  const isTasksActive = pathname.startsWith("/tasks");
  const isBenchmarksActive = pathname.startsWith("/benchmarks");
  const isModelsActive = pathname.startsWith("/models");
  const isOrganizationsActive = pathname.startsWith("/organizations");
  const isLoginActive = pathname.startsWith("/login");
  const isHomePage = pathname === "/";
  const isCategoryPage = pathname.startsWith("/category/");

  const hasHeroSection = isHomePage || isCategoryPage;

  const usesHomepageSearchPresentation =
    isMethodsActive ||
    isModelsActive ||
    isBenchmarksActive ||
    isTasksActive;

  const shouldShowSearch = !hasHeroSection || isScrolled;

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Prefetch organizations
  useEffect(() => {
    prefetchOrganizationDirectory();
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="font-sans sticky top-0 h-[56px] xl:h-[52px] w-full bg-[#F8F7F2]/80 backdrop-blur-md border-b border-[#E5E5E0] flex items-center justify-between px-4 md:px-8 xl:px-12 gap-3 xl:gap-4 shrink-0 z-50 transition-all duration-300">

        {/* ================= LEFT SECTION ================= */}
        <div className="flex items-center gap-1 lg:gap-0 lg:flex-1 lg:max-w-[440px] xl:max-w-[470px] min-w-0 shrink-0">

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-[#EBEBE6] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <a
            href="/"
            className="flex items-center justify-center lg:justify-start cursor-pointer absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:-translate-x-0 w-[160px] sm:w-[200px] xl:w-[240px] h-12 xl:h-14"
          >
            <img
              src="https://frontieratlas.pages.dev/logo.png"
              alt="Frontier Atlas"
              className="w-full h-full object-contain object-center lg:object-left"
            />
          </a>
        </div>

        {/* ================= CENTER SEARCH ================= */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-4 min-w-0 transition-all">
          {shouldShowSearch && (
            <div
              className={`w-full flex justify-center ${
                usesHomepageSearchPresentation
                  ? "max-w-[360px]"
                  : "max-w-[400px] xl:max-w-[480px]"
              }`}
            >
              <SearchBar
                variant={
                  usesHomepageSearchPresentation
                    ? "homepage"
                    : "compact"
                }
                placeholder="Search..."
                initialQuery=""
              />
            </div>
          )}
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex items-center shrink-0">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">

            {/* Tasks */}
            <a
              href="/tasks"
              data-text="Tasks"
              onMouseEnter={() => {
                import("@/lib/tasks")
                  .then((m) => m.getTaskPaperCounts())
                  .catch(() => {});
              }}
              onTouchStart={() => {
                import("@/lib/tasks")
                  .then((m) => m.getTaskPaperCounts())
                  .catch(() => {});
              }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isTasksActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Tasks
            </a>

            {/* Methods */}
            <a
              href="/methods"
              data-text="Methods"
              onMouseEnter={() => {
                import("@/lib/methodCache")
                  .then((m) => m.prefetchMethods())
                  .catch(() => {});
              }}
              onTouchStart={() => {
                import("@/lib/methodCache")
                  .then((m) => m.prefetchMethods())
                  .catch(() => {});
              }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isMethodsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Methods
            </a>

            {/* Benchmarks */}
            <a
              href="/benchmarks"
              data-text="Benchmarks"
              onMouseEnter={() => {
                import("@/lib/benchmarks")
                  .then((m) => m.getBenchmarks())
                  .catch(() => {});
              }}
              onTouchStart={() => {
                import("@/lib/benchmarks")
                  .then((m) => m.getBenchmarks())
                  .catch(() => {});
              }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isBenchmarksActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Benchmarks
            </a>

            {/* Models */}
            <Link
              href="/models"
              data-text="Models"
              onMouseEnter={() => {
                import("@/lib/models")
                  .then((m) => m.getModels({ limit: 50 }))
                  .catch(() => {});
              }}
              onTouchStart={() => {
                import("@/lib/models")
                  .then((m) => m.getModels({ limit: 50 }))
                  .catch(() => {});
              }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isModelsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Models
            </Link>

            {/* Organizations */}
            <Link
              href="/organizations"
              data-text="Organizations"
              onMouseEnter={prefetchOrganizationDirectory}
              onTouchStart={prefetchOrganizationDirectory}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isOrganizationsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Organizations
            </Link>

                        {/* Login */}
            <Link
              href="/login"
              aria-label="Sign In"
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm hover:-translate-y-px active:scale-95 ${
                isLoginActive
                  ? "bg-[#E0462D] shadow-[0_0_0_3px_rgba(245,80,54,0.20)]"
                  : "bg-[#F55036] hover:bg-[#E0462D] hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)]"
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] xl:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`font-sans fixed inset-y-0 left-0 w-[80vw] max-w-[300px] bg-[#F8F7F2]/90 backdrop-blur-xl z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out xl:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="h-[52px] border-b border-[#E5E5E0] flex items-center justify-between px-4 shrink-0">

          {/* Mobile Logo */}
          <a
            href="/"
            onClick={closeMenu}
            className="relative block w-[170px] h-10 cursor-pointer"
          >
            <img
              src="https://frontieratlas.pages.dev/logo.png"
              alt="Frontier Atlas"
              className="w-full h-full object-contain object-left"
            />
          </a>

          {/* Close Button */}
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[#EBEBE6] transition-colors -mr-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-2">
          <Sidebar
            initialActive={activeSort}
            onItemSelect={onItemSelect}
            onItemClick={closeMenu}
          />
        </div>
      </div>
    </>
  );
}