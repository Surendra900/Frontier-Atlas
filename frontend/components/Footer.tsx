"use client";

import Link from "next/link";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa6";

const footerColumns = [
  {
    title: "PRODUCT",
    links: [
      { label: "Tasks", href: "/tasks" },
      { label: "Methods", href: "/methods" },
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "Models", href: "/models" },
      { label: "Organizations", href: "/organizations" },
    ],
  },
  {
    title: "CONNECT",
    links: [
      { label: "X", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
  {
    title: "FROM OUR WORLD",
    links: [
      { label: "Podcast", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "AI Tools", href: "#" },
      { label: "GraphOne", href: "#" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Write Blog", href: "/contact" },
      { label: "Press", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const socialLinks = [
  {
    label: "X",
    href: "#",
    icon: FaXTwitter,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    label: "YouTube",
    href: "#",
    icon: FaYoutube,
  },
  {
    label: "Discord",
    href: "#",
    icon: FaDiscord,
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white overflow-hidden">

      {/* ============================================================
          LARGE FRONTIER ATLAS WORD
          ============================================================ */}

      <div className="w-full border-b border-[#292929]">
        <div className="w-full overflow-hidden px-3 sm:px-5 md:px-7 lg:px-10">
          <div
            className="
              w-full
              text-center
              font-bold
              leading-[0.82]
              tracking-[0.035em]
              text-white
              whitespace-nowrap
            "
            style={{
              fontSize: "clamp(46px, 12.5vw, 205px)",
            }}
          >
            FrontierAtlas
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN FOOTER
          ============================================================ */}

      <div className="w-full px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1700px]">

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr_0.9fr]
              gap-x-10
              lg:gap-x-14
              xl:gap-x-16
              gap-y-12
              py-12
              md:py-14
              lg:py-16
            "
          >

            {/* ======================================================
                BRAND / LEFT SIDE
                ====================================================== */}

            <div className="min-w-0">

              {/* Brand */}
              <Link
                href="/"
                className="
                  inline-block
                  text-[28px]
                  sm:text-[31px]
                  font-bold
                  tracking-[-0.045em]
                  text-white
                  transition-opacity
                  hover:opacity-75
                "
              >
                FrontierAtlas
              </Link>

              {/* Tagline */}
              <p
                className="
                  mt-9
                  max-w-[390px]
                  text-[20px]
                  sm:text-[22px]
                  lg:text-[23px]
                  leading-[1.35]
                  text-white
                "
              >
                The Home of Everything AI.
              </p>

              {/* Description */}
              <p
                className="
                  mt-5
                  max-w-[430px]
                  text-[15px]
                  sm:text-[16px]
                  leading-[1.7]
                  text-[#9E9E9E]
                "
              >
                Discover the tools, companies, and technologies shaping the
                global AI ecosystem.
              </p>

              {/* Social icons */}
              <div className="mt-8 flex items-center gap-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="
                        text-white
                        transition-all
                        duration-200
                        hover:text-[#F55036]
                        hover:-translate-y-0.5
                      "
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ======================================================
                FOUR FOOTER COLUMNS
                ====================================================== */}

            {footerColumns.map((column) => (
              <div key={column.title} className="min-w-0">

                {/* Heading */}
                <h3
                  className="
                    text-[14px]
                    sm:text-[15px]
                    font-bold
                    tracking-[0.055em]
                    text-white
                  "
                >
                  {column.title}
                </h3>

                {/* Single divider */}
                <div className="mt-5 mb-6 h-px w-full bg-[#292929]" />

                {/* Links */}
                <ul className="space-y-5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="
                          text-[15px]
                          sm:text-[16px]
                          leading-none
                          text-[#D0D0D0]
                          transition-colors
                          duration-200
                          hover:text-white
                        "
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

              </div>
            ))}

          </div>

          {/* ==========================================================
              SINGLE BOTTOM DIVIDER
              ========================================================== */}

          <div className="h-px w-full bg-[#292929]" />

          {/* Small bottom spacing only */}
          <div className="h-8 sm:h-10" />

        </div>
      </div>
    </footer>
  );
}