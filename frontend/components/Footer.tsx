"use client";

import Link from "next/link";

const footerSections = [
  {
    title: "PRODUCTS",
    links: [
      { label: "Tasks", href: "/tasks" },
      { label: "Methods", href: "/methods" },
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "Models", href: "/models" },
      { label: "Organizations", href: "/organizations" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Press", href: "/press" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "CONNECT",
    links: [
      {
        label: "X / Twitter",
        href: "#",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/frontieratlashq",
      },
      {
        label: "Instagram",
        href: "#",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@graphoneofficial",
      },
    ],
  },
  {
    title: "FROM OUR WORLD",
    links: [
      {
        label: "Podcast",
        href: "https://www.youtube.com/@graphoneofficial",
      },
      {
        label: "Newsletter",
        href: "https://brief.graphone.co/",
      },
      {
        label: "AI Tools",
        href: "https://aiorbit.club/",
      },
      {
        label: "Graph One",
        href: "https://graphone.co/",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#0A2026] text-white">
      <div className="w-full px-6 pt-10 pb-0 sm:px-8 sm:pt-12 md:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-[1800px]">

          {/* TOP SECTION */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.25fr_3fr] md:gap-12 lg:grid-cols-[1.15fr_3fr] lg:gap-16">

            {/* BRAND / DESCRIPTION */}
            <div className="min-w-0">
              <Link
                href="/"
                className="
                  inline-block
                  text-[28px]
                  font-bold
                  tracking-[-0.045em]
                  text-white
                  transition-opacity
                  hover:opacity-80
                  sm:text-[30px]
                  md:text-[32px]
                "
              >
                FrontierAtlas
              </Link>

              <p
                className="
                  mt-6
                  max-w-[420px]
                  text-[17px]
                  leading-[1.55]
                  text-white
                  sm:text-[18px]
                  md:mt-7
                  md:text-[19px]
                "
              >
                Discover methods, benchmarks, models, organizations, and the
                latest research shaping the global AI ecosystem.
              </p>
            </div>

            {/* FOUR COLUMNS */}
            <div
              className="
                grid
                grid-cols-2
                gap-x-8
                gap-y-10
                sm:grid-cols-2
                md:grid-cols-4
                md:gap-x-7
                lg:gap-x-10
                xl:gap-x-14
              "
            >
              {footerSections.map((section) => (
                <div key={section.title} className="min-w-0">
                  {/* HEADING */}
                  <h3
                    className="
                      text-[13px]
                      font-bold
                      tracking-[0.16em]
                      text-white
                      sm:text-[14px]
                    "
                  >
                    {section.title}
                  </h3>

                  {/* DIVIDER */}
                  <div className="mt-5 h-px w-full bg-white/30" />

                  {/* LINKS */}
                  <ul className="mt-5 space-y-4">
                    {section.links.map((link) => {
                      const isExternal = link.href.startsWith("http");

                      return (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={
                              isExternal
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="
                              block
                              text-[15px]
                              leading-[1.3]
                              text-white/90
                              transition-opacity
                              duration-200
                              hover:text-white
                              hover:opacity-70
                              sm:text-[16px]
                            "
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="mt-10 h-px w-full bg-white/30 sm:mt-12 md:mt-14" />

          {/* LARGE FRONTIER ATLAS */}
          <div className="w-full overflow-hidden pt-6 sm:pt-7 md:pt-8">
            <div
              className="
                w-full
                whitespace-nowrap
                text-center
                font-bold
                leading-[0.74]
                tracking-[-0.085em]
                text-white
                select-none
              "
              style={{
                fontSize: "clamp(46px, 15vw, 290px)",
                transform: "scaleX(1.11)",
                transformOrigin: "center",
              }}
            >
              FrontierAtlas
            </div>
          </div>

          {/* BOTTOM SPACING */}
          <div className="h-5 sm:h-6 md:h-7" />
        </div>
      </div>
    </footer>
  );
}