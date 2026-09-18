import Link from "next/link";
import React from "react";

interface Stat {
  value: string | number;
  label: string;
}

interface PageHeroProps {
  breadcrumb: string;
  title: string;
  highlight: string;
  description: string;
  stats: Stat[];
  action?: React.ReactNode;
  showStatDividers?: boolean;
  children?: React.ReactNode;
}

export default function PageHero({
  breadcrumb,
  title,
  highlight,
  description,
  stats,
  action,
  showStatDividers = false,
  children,
}: PageHeroProps) {
  return (
    <section className="mb-12">
  <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
    <Link
      href="/"
      className="hover:text-[#FF5A1F] transition-colors no-underline"
    >
      Home
    </Link>

    <span>/</span>

    <span className="text-[#555555] font-medium">
      {breadcrumb}
    </span>
  </nav>

  <div>
    <h1 className="text-[32px] font-black tracking-tight leading-none">
      <span className="text-[#111827]">{title} </span>
      <span className="text-[#F55036]">{highlight}</span>
    </h1>

    <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#5B6472]">
      {description}
    </p>

    <div className="mt-6 flex items-center justify-between gap-8 flex-wrap">
      <div className="flex items-center gap-10">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <div>
              <div className="text-[20px] font-bold text-[#111111]">
                {stat.value}
              </div>

              <div className="mt-1 text-[14px] text-[#6B7280]">
                {stat.label}
              </div>
            </div>

            {showStatDividers && index !== stats.length - 1 && (
              <div className="w-px h-8 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>

    {children && <div className="mt-8">{children}</div>}
  </div>
</section>
  );
}