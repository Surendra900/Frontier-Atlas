"use client";

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa6";
import { ArrowUp } from "lucide-react";
import MatrixLogo from "./MatrixLogo";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#F8F7F2] mt-auto shrink-0 border-t border-[#E5E5E0]">
      <MatrixLogo />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-4 md:pt-10 md:pb-4">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12 lg:gap-x-8">
          
          {/* Brand Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="relative block w-[240px] sm:w-[280px] h-12 sm:h-14 -ml-1">
              <Image src="/logo.png" alt="Frontier Atlas" fill className="object-contain object-left" sizes="(max-width: 640px) 240px, 280px" />
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[15px] text-[#111111] font-medium">
                The Home of Everything AI.
              </p>
              <p className="text-[15px] text-[#555555] leading-relaxed max-w-[320px]">
                Discover the tools, companies, and technologies shaping the global AI ecosystem.
              </p>
            </div>
            <div className="flex items-center gap-5 mt-4">
              <a href="#" aria-label="X (Twitter)" className="text-[#555] hover:text-[#F55036] transition-colors">
                <FaXTwitter size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-[#555] hover:text-[#F55036] transition-colors">
                <FaLinkedinIn size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-[#555] hover:text-[#F55036] transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="text-[#555] hover:text-[#F55036] transition-colors">
                <FaYoutube size={20} />
              </a>
              <a href="#" aria-label="Discord" className="text-[#555] hover:text-[#F55036] transition-colors">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="col-span-6 lg:col-span-2">
            <h4 className="font-bold text-[#111111] text-[13px] uppercase tracking-wider mb-4">Explore</h4>
            <div className="w-full h-px bg-[#D1D1D1] mb-6 max-w-[120px]"></div>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Papers</Link></li>
              <li><Link href="/models" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Models</Link></li>
              <li><Link href="/tasks" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Tasks</Link></li>
              <li><Link href="/datasets" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Datasets</Link></li>
            </ul>
          </div>

          {/* Discover Column */}
          <div className="col-span-6 lg:col-span-2">
            <h4 className="font-bold text-[#111111] text-[13px] uppercase tracking-wider mb-4">Discover</h4>
            <div className="w-full h-px bg-[#D1D1D1] mb-6 max-w-[120px]"></div>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/methods" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Methods</Link></li>
              <li><Link href="/benchmarks" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Benchmarks</Link></li>
              <li><Link href="/organizations" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Organizations</Link></li>
              <li><Link href="/authors" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Authors</Link></li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="col-span-6 lg:col-span-2">
            <h4 className="font-bold text-[#111111] text-[13px] uppercase tracking-wider mb-4">Ecosystem</h4>
            <div className="w-full h-px bg-[#D1D1D1] mb-6 max-w-[120px]"></div>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/discussions" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Discussions</Link></li>
              <li><Link href="/saved" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Saved Papers</Link></li>
              <li><Link href="/api" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">API</Link></li>
              <li><Link href="/submit" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Submit Research</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-6 lg:col-span-2">
            <h4 className="font-bold text-[#111111] text-[13px] uppercase tracking-wider mb-4">Company</h4>
            <div className="w-full h-px bg-[#D1D1D1] mb-6 max-w-[120px]"></div>
            <ul className="flex flex-col gap-3.5">
              <li><Link href="/about" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">About</Link></li>
              <li><Link href="/contact" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Contact</Link></li>
              <li><Link href="/write" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Write</Link></li>
              <li><Link href="/press" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Press</Link></li>
              <li><Link href="/privacy" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="inline-block text-[14px] font-medium text-[#444] hover:text-[#F55036] transition-colors">Terms</Link></li>
            </ul>
          </div>

        </div>

        <div className="w-full h-px bg-[#E5E5E0] mt-8 mb-4"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#555] font-medium pb-2">
          <p suppressHydrationWarning>© {new Date().getFullYear()} FrontierAtlas. All rights reserved.</p>
          <button 
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-8 h-8 rounded-full border border-[#D1D1D1] flex items-center justify-center text-[#555] hover:text-[#F55036] hover:border-[#F55036] transition-all bg-transparent"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

