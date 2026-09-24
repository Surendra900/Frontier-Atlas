"use client";

import Link from "next/link";

const footerColumns = [
  {
    title: "PRODUCTS",
    links: [
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
      { label: "Write Blog", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "CONNECT",
    links: [
      { label: "X / Twitter", href: "#" },
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
      { label: "Graph One", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#1D2B38] text-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1900px]
          px-5
          pt-9
          sm:px-7
          sm:pt-10
          md:px-9
          lg:px-11
          xl:px-14
        "
      >
        {/* TOP SECTION */}
        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-[1.05fr_2.95fr]
            lg:gap-12
            xl:gap-16
          "
        >
          {/* BRAND */}
          <div className="min-w-0">
            <Link
              href="/"
              className="
                inline-block
                text-[26px]
                font-bold
                tracking-[-0.04em]
                text-white
                transition-opacity
                hover:opacity-80
                sm:text-[29px]
              "
            >
              FrontierAtlas
            </Link>

            <p className="mt-5 max-w-[430px] text-[18px] leading-[1.35] text-white sm:text-[20px]">
              The Home of Everything AI.
            </p>

            <p className="mt-3 max-w-[450px] text-[14px] leading-6 text-[#C1CBD4] sm:text-[15px]">
              Discover methods, benchmarks, models, organizations, and the
              latest research shaping the global AI ecosystem.
            </p>
          </div>

          {/* FOUR COLUMNS */}
          <div
            className="
              grid
              grid-cols-4
              gap-x-3
              sm:gap-x-5
              md:gap-x-7
              lg:gap-x-9
              xl:gap-x-12
            "
          >
            {footerColumns.map((column) => (
              <div key={column.title} className="min-w-0">
                <h3
                  className="
                    whitespace-nowrap
                    text-[9px]
                    font-bold
                    tracking-[0.16em]
                    text-white
                    sm:text-[11px]
                    md:text-[12px]
                    lg:text-[13px]
                  "
                >
                  {column.title}
                </h3>

                <div className="mt-3 h-px w-full bg-[#52606B]" />

                <div className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="
                        text-[10px]
                        leading-[1.3]
                        text-[#D5DCE2]
                        transition-colors
                        duration-200
                        hover:text-white
                        sm:text-[12px]
                        md:text-[13px]
                        lg:text-[15px]
                      "
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SINGLE DIVIDER */}
        <div className="mt-9 h-px w-full bg-[#52606B] sm:mt-11 md:mt-12" />

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

<div className="h-5 sm:h-6 md:h-7" />

        {/* SMALL BOTTOM SPACE */}
        <div className="h-5 sm:h-6 md:h-7" />
      </div>
    </footer>
  );
}