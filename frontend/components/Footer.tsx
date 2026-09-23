"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa6";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full bg-black mt-auto shrink-0 border-t border-white/10 overflow-hidden">

      {/* ============================================================
          FOOTER MAIN CONTENT
          ============================================================ */}

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 md:px-10 lg:px-12 pt-10 pb-5 md:pt-12">

        <div className="grid grid-cols-12 gap-x-3 sm:gap-x-6 gap-y-10 lg:gap-x-8">

          {/* ==========================================================
              BRAND
              ========================================================== */}

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

            <Link
              href="/"
              className="relative block w-[210px] sm:w-[250px] h-11 sm:h-13 -ml-1"
            >
              <Image
                src="/logo.png"
                alt="Frontier Atlas"
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="(max-width: 640px) 210px, 250px"
              />
            </Link>

            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[15px] text-white font-medium">
                The Home of Everything AI.
              </p>

              <p className="text-[14px] text-white/60 leading-relaxed max-w-[340px]">
                Discover the tools, companies, and technologies shaping the
                global AI ecosystem.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-5 mt-3">

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaXTwitter size={18} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaYoutube size={18} />
              </a>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-white/60 hover:text-white transition-colors"
              >
                <FaDiscord size={18} />
              </a>

            </div>
          </div>

          {/* ==========================================================
              EXPLORE
              ========================================================== */}

          <div className="col-span-3 lg:col-span-2">

            <h4 className="font-bold text-white text-[11px] sm:text-[13px] uppercase tracking-wider mb-3 sm:mb-4">
              Explore
            </h4>

            <div className="w-full h-px bg-white/15 mb-4 sm:mb-5 max-w-[120px]" />

            <ul className="flex flex-col gap-2.5 sm:gap-3">

              <li>
                <Link
                  href="/"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Papers
                </Link>
              </li>

              <li>
                <Link
                  href="/models"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Models
                </Link>
              </li>

              <li>
                <Link
                  href="/tasks"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Tasks
                </Link>
              </li>

              <li>
                <Link
                  href="/datasets"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Datasets
                </Link>
              </li>

            </ul>
          </div>

          {/* ==========================================================
              DISCOVER
              ========================================================== */}

          <div className="col-span-3 lg:col-span-2">

            <h4 className="font-bold text-white text-[11px] sm:text-[13px] uppercase tracking-wider mb-3 sm:mb-4">
              Discover
            </h4>

            <div className="w-full h-px bg-white/15 mb-4 sm:mb-5 max-w-[120px]" />

            <ul className="flex flex-col gap-2.5 sm:gap-3">

              <li>
                <Link
                  href="/methods"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Methods
                </Link>
              </li>

              <li>
                <Link
                  href="/benchmarks"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Benchmarks
                </Link>
              </li>

              <li>
                <Link
                  href="/organizations"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Organizations
                </Link>
              </li>

              <li>
                <Link
                  href="/authors"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Authors
                </Link>
              </li>

            </ul>
          </div>

          {/* ==========================================================
              ECOSYSTEM
              ========================================================== */}

          <div className="col-span-3 lg:col-span-2">

            <h4 className="font-bold text-white text-[11px] sm:text-[13px] uppercase tracking-wider mb-3 sm:mb-4">
              Ecosystem
            </h4>

            <div className="w-full h-px bg-white/15 mb-4 sm:mb-5 max-w-[120px]" />

            <ul className="flex flex-col gap-2.5 sm:gap-3">

              <li>
                <Link
                  href="/discussions"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Discussions
                </Link>
              </li>

              <li>
                <Link
                  href="/saved"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Saved Papers
                </Link>
              </li>

              <li>
                <a
                  href="https://github.com/AtlasFrontierOrg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  API Docs
                </a>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Submit Research
                </Link>
              </li>

            </ul>
          </div>

          {/* ==========================================================
              COMPANY
              ========================================================== */}

          <div className="col-span-3 lg:col-span-2">

            <h4 className="font-bold text-white text-[11px] sm:text-[13px] uppercase tracking-wider mb-3 sm:mb-4">
              Company
            </h4>

            <div className="w-full h-px bg-white/15 mb-4 sm:mb-5 max-w-[120px]" />

            <ul className="flex flex-col gap-2.5 sm:gap-3">

              <li>
                <Link
                  href="/about"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Write
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Press
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="inline-block text-[11px] sm:text-[14px] font-medium text-white/65 hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </li>

            </ul>
          </div>
        </div>

        {/* ============================================================
            DIVIDER
            ============================================================ */}

        <div className="w-full h-px bg-white/10 mt-10 mb-5" />

        {/* ============================================================
            COPYRIGHT + BACK TO TOP
            ============================================================ */}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] sm:text-[13px] text-white/45 font-medium pb-3">

          <p suppressHydrationWarning>
            © {new Date().getFullYear()} FrontierAtlas. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="
              w-9
              h-9
              rounded-full
              border
              border-white/20
              flex
              items-center
              justify-center
              text-white/70
              hover:text-white
              hover:border-white
              transition-all
              bg-transparent
            "
          >
            <ArrowUp size={16} />
          </button>

        </div>

        {/* ============================================================
            LARGE FRONTIER ATLAS BRANDING
            ============================================================ */}

        <div className="relative w-full overflow-hidden mt-5">

          <div
            className="
              w-full
              text-center
              whitespace-nowrap
              font-bold
              leading-none
              tracking-[-0.065em]
              text-white
            "
            style={{
              fontSize: "clamp(44px, 11.5vw, 170px)",
            }}
          >
            FrontierAtlas
          </div>

        </div>

      </div>
    </footer>
  );
}