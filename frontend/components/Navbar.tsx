"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { usePathname, useRouter } from "next/navigation";
import { useScrollThreshold } from "@/lib/useScroll";
import Sidebar from "@/components/Sidebar";
import { getOrganizationCatalog } from "@/lib/organizations";
import { fetchWithAuthRetry } from "@/lib/auth-client";
import { Bookmark, User, Plus, Search } from "lucide-react";

type CurrentUser = {
  email: string;
};

const defaultApiUrl = "https://frontieratlas-backend.morningsignal-india.workers.dev";
// Use Next's local rewrite so authentication cookies stay on localhost rather
// than being set by 127.0.0.1, which is a different cookie site.
const API_BASE = process.env.NODE_ENV === "development"
  ? ""
  : (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, "");

export default function Navbar({
  activeSort,
  onItemSelect,
}: {
  activeSort?: string;
  onItemSelect?: (item: string) => void;
} = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isScrolled = useScrollThreshold(50);
  const pathname = usePathname();
  const router = useRouter();
  const isMethodsActive = pathname.startsWith("/methods");
  const isTasksActive = pathname.startsWith("/tasks");
  const isBenchmarksActive = pathname.startsWith("/benchmarks");
  const isModelsActive = pathname.startsWith("/models");
  const isOrganizationsActive = pathname.startsWith("/organizations");

  const isHomePage = pathname === "/";
  const isCategoryPage = pathname.startsWith("/category/");
  const hasHeroSection = isHomePage || isCategoryPage;
  const usesHomepageSearchPresentation =
    isMethodsActive || isModelsActive || isBenchmarksActive || isTasksActive;
  
  const shouldShowSearch = !hasHeroSection || isScrolled;

  // Close menu on escape key
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

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetchWithAuthRetry(`${API_BASE}/api/v1/auth/me`);

        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);
      } catch {
        // A guest session is expected to have no current user.
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    window.addEventListener("authchange", loadCurrentUser);
    return () => window.removeEventListener("authchange", loadCurrentUser);
  }, []);


  useEffect(() => {
    const closeProfileOnOutsideClick = (event: MouseEvent) => {
      if (!profileRefs.current.some((profile) => profile?.contains(event.target as Node))) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeProfileOnOutsideClick);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setCurrentUser(null);
      setIsProfileOpen(false);
      setIsLoggingOut(false);
      window.dispatchEvent(new Event("authchange"));
      router.push("/");
      router.refresh();
    }
  };

  const profileControl = (index: number) => currentUser ? (
    <div ref={(element) => { profileRefs.current[index] = element; }} className="relative">
      <button
        type="button"
        onClick={() => setIsProfileOpen((open) => !open)}
        aria-label="Open profile menu"
        aria-expanded={isProfileOpen}
        className="w-8 h-8 rounded-full bg-[#F55036] text-white text-[14px] font-bold flex items-center justify-center cursor-pointer hover:bg-[#E0462D] transition-colors shadow-sm hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)] hover:-translate-y-px active:scale-95"
      >
        {currentUser.email.trim().charAt(0).toUpperCase()}
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 top-10 w-64 rounded-xl border border-[#E5E5E0] bg-[#F8F7F2] p-3 shadow-lg">
          <p className="truncate text-[13px] font-medium text-[#555555] px-2 pb-2 border-b border-[#E5E5E0] mb-2">{currentUser.email}</p>
          
          <a
            href="/profile"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] font-medium text-[#444444] hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] no-underline transition-colors"
          >
            <User size={16} />
            Profile & Settings
          </a>

          <a
            href="/saved"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] font-medium text-[#444444] hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] no-underline transition-colors"
          >
            <Bookmark size={16} />
            Saved Papers
          </a>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-2 w-full rounded-lg bg-[#F55036] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#E0462D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  ) : (
      <a
      href="/login"
      aria-label="Sign In"
      className="w-8 h-8 rounded-full bg-[#F55036] flex items-center justify-center cursor-pointer hover:bg-[#E0462D] transition-colors shadow-sm hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)] hover:-translate-y-px active:scale-95"
    > 
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </a>
  );

  return (
    <>
      <nav className="font-sans sticky top-0 h-[56px] xl:h-[52px] w-full bg-[#F8F7F2]/80 backdrop-blur-md border-b border-[#E5E5E0] flex items-center justify-between px-4 md:px-8 xl:px-12 gap-3 xl:gap-4 shrink-0 z-50 transition-all duration-300">
        {/* Mobile Left (Hamburger + Logo) */}
        <div className="flex items-center gap-1 lg:gap-0 lg:w-[200px] xl:w-[240px] min-w-0 shrink-0">
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
          <a href="/" className="flex items-center justify-center lg:justify-start cursor-pointer absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:-translate-x-0 w-[160px] sm:w-[190px] xl:w-[220px] h-12 xl:h-14">
            <img src="https://frontieratlas.pages.dev/logo.png" alt="Frontier Atlas" className="w-full h-full object-contain object-center lg:object-left" />
          </a>
        </div>

        {/* Center — Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-start xl:justify-center px-3 xl:px-6 min-w-0 transition-all">
          {shouldShowSearch && (
            <div className={`w-full flex justify-start xl:justify-center ${
              usesHomepageSearchPresentation ? "max-w-[320px]" : "max-w-[360px] xl:max-w-[440px]"
            }`}>
              <SearchBar
                variant={usesHomepageSearchPresentation ? "homepage" : "compact"}
                placeholder="Search..."
                initialQuery=""
              />
            </div>
          )}
        </div>
        {/* Right Section (Nav Links + Profile) */}
        <div className="flex items-center shrink-0">
          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-6 mr-3 xl:mr-4">
            <a
              href="/tasks"
              data-text="Tasks"
              onMouseEnter={() => { import("@/lib/tasks").then(m => m.getTaskPaperCounts()).catch(() => {}); }}
              onTouchStart={() => { import("@/lib/tasks").then(m => m.getTaskPaperCounts()).catch(() => {}); }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isTasksActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Tasks
            </a>
            <a
              href="/methods"
              data-text="Methods"
              onMouseEnter={() => { import("@/lib/methodCache").then(m => m.prefetchMethods()).catch(() => {}); }}
              onTouchStart={() => { import("@/lib/methodCache").then(m => m.prefetchMethods()).catch(() => {}); }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isMethodsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Methods
            </a>
            <a
              href="/benchmarks"
              data-text="Benchmarks"
              onMouseEnter={() => { import("@/lib/benchmarks").then(m => m.getBenchmarks()).catch(() => {}); }}
              onTouchStart={() => { import("@/lib/benchmarks").then(m => m.getBenchmarks()).catch(() => {}); }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isBenchmarksActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Benchmarks
            </a>
            <Link
              href="/models"
              data-text="Models"
              onMouseEnter={() => { import("@/lib/models").then(m => m.getModels({ limit: 50 })).catch(() => { }); }}
              onTouchStart={() => { import("@/lib/models").then(m => m.getModels({ limit: 50 })).catch(() => { }); }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${isModelsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
                }`}
            >
              Models
            </Link>
            <Link
              href="/organizations"
              data-text="Organizations"
              onMouseEnter={() => { void getOrganizationCatalog().catch(() => {}); }}
              onTouchStart={() => { void getOrganizationCatalog().catch(() => {}); }}
              className={`text-[13px] transition-colors no-underline before:content-[attr(data-text)] before:block before:font-bold before:h-0 before:overflow-hidden before:invisible before:select-none text-center flex flex-col justify-center ${
                isOrganizationsActive
                  ? "text-[#F55036] font-bold"
                  : "text-[#555555] font-medium hover:text-[#F55036]"
              }`}
            >
              Organizations
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(245,80,54,0.08)] text-[#F55036] hover:bg-[#F55036] hover:text-white text-[13px] font-semibold transition-all no-underline shadow-2xs"
            >
              <Plus size={14} />
              Submit
            </Link>
          </div>

          {/* Profile Control & Mobile Search */}
          <div className="flex items-center gap-2.5 lg:gap-4 lg:border-l lg:border-[#E5E5E0] lg:pl-4 shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="lg:hidden w-8 h-8 rounded-full bg-[#EBEBE6] hover:bg-[#E0DDD6] flex items-center justify-center text-[#444444] hover:text-[#111111] transition-colors cursor-pointer"
              aria-label="Open search palette"
              title="Search"
            >
              <Search size={15} />
            </button>
            {profileControl(0)}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[60] xl:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div 
        className={`font-sans fixed inset-y-0 left-0 w-[80vw] max-w-[300px] bg-[#F8F7F2]/90 backdrop-blur-xl z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out xl:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="h-[52px] border-b border-[#E5E5E0] flex items-center justify-between px-4 shrink-0">
          <a href="/" onClick={closeMenu} className="relative block w-[170px] h-10 cursor-pointer">
              <img
                src="https://frontieratlas.pages.dev/logo.png"
                alt="Frontier Atlas"
                className="w-full h-full object-contain object-left"
              />
          </a>
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
          <Sidebar initialActive={activeSort} onItemSelect={onItemSelect} onItemClick={closeMenu} />
        </div>
      </div>
    </>
  );
}
