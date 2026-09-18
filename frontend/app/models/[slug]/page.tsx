"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Github,
  Layers3,
  Sparkles,
} from "lucide-react";
import {
  type ModelDetail,
  type ModelItem,
  getCachedModelBySlug,
  getModelBySlug,
} from "@/lib/models";
import { getPapers, type GetPapersResult } from "@/lib/paperApi";
import PaperList from "@/components/PaperFeed";
import Navbar from "@/components/Navbar";
import TaskFilterBar from "@/components/domain/tasks/TaskFilterBar";
import PaperTabs from "@/components/PaperTabs";
import ModelLineageTree from "@/components/domain/models/ModelLineageTree";

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return [];
}

function ModelDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] pb-24">
      <Navbar />

      <div className="w-full max-w-[1370px] mx-auto px-5 md:px-10 lg:px-16 xl:px-24 pt-6 pb-12">
        <div className="h-4 w-48 rounded bg-[#EAE9E4] animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-10">
          <div className="space-y-8">
            <div className="rounded-[10px] border border-[#E5E5E0] bg-white p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-[#EAE9E4] animate-pulse mb-4" />
                  <div className="h-10 w-64 rounded bg-[#EAE9E4] animate-pulse mb-3" />
                  <div className="h-5 w-40 rounded bg-[#EAE9E4] animate-pulse mb-4" />
                  <div className="space-y-2 mb-5">
                    <div className="h-4 w-full max-w-2xl rounded bg-[#EAE9E4] animate-pulse" />
                    <div className="h-4 w-4/5 max-w-xl rounded bg-[#EAE9E4] animate-pulse" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-7 w-24 rounded-full bg-[#EAE9E4] animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[8px] border border-[#EAE9E4] bg-[#FAFAF8] p-3"
                      >
                        <div className="h-3 w-16 rounded bg-[#EAE9E4] animate-pulse mb-2" />
                        <div className="h-5 w-20 rounded bg-[#EAE9E4] animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-20 h-20 rounded-[10px] border border-[#EAE9E4] bg-[#FAFAF8] animate-pulse shrink-0" />
              </div>
            </div>

            <div className="rounded-[10px] border border-[#E5E5E0] bg-white p-6">
              <div className="h-6 w-40 rounded bg-[#EAE9E4] animate-pulse mb-5" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[8px] border border-[#EAE9E4] bg-[#FAFAF8] p-4"
                  >
                    <div className="h-4 w-32 rounded bg-[#EAE9E4] animate-pulse mb-3" />
                    <div className="h-2 w-full rounded-full bg-[#EAE9E4] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[10px] border border-[#E5E5E0] bg-white p-5"
              >
                <div className="h-5 w-28 rounded bg-[#EAE9E4] animate-pulse mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((__, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-between gap-3">
                      <div className="h-3 w-20 rounded bg-[#EAE9E4] animate-pulse" />
                      <div className="h-3 w-24 rounded bg-[#EAE9E4] animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E5E0] bg-[#FAFAF8] px-3 py-1 text-[12px] font-medium text-[#555555]">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="rounded-[8px] border border-[#E5E5E0] bg-[#FAFAF8] px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.08em] text-[#8B8B8B]">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-[#111111]">
        {value}
      </div>
    </div>
  );
}

function SidebarRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#F0F0EC] last:border-b-0">
      <dt className="text-[12px] text-[#8B8B8B]">{label}</dt>
      <dd className="text-[12px] font-medium text-[#222222] text-right">{value}</dd>
    </div>
  );
}

function ExternalResourceLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#E0DDD6] bg-transparent px-5 py-2 text-[13px] font-medium text-[#444444] no-underline transition-all hover:bg-[rgba(255,90,31,0.06)] hover:text-[#FF5A1F] hover:border-[rgba(255,90,31,0.3)] active:scale-[0.97]"
    >
      <span className="flex items-center gap-1.5">
        <span className="text-current">{icon}</span>
        <span>{label}</span>
      </span>
    </a>
  );
}

function BenchmarksIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF6F3] text-[#FF5A1F]">
      <Layers3 size={16} />
    </span>
  );
}

function ArxivIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.8423 0a1.0037 1.0037 0 0 0-.922.6078c-.1536.3687-.0438.6275.2938 1.1113l6.9185 8.3597-1.0223 1.1058a1.0393 1.0393 0 0 0 .003 1.4229l1.2292 1.3135-5.4391 6.4444c-.2803.299-.4538.823-.2971 1.1986a1.0253 1.0253 0 0 0 .9585.635.9133.9133 0 0 0 .6891-.3405l5.783-6.126 7.4902 8.0051a.8527.8527 0 0 0 .6835.2597.9575.9575 0 0 0 .8777-.6138c.1577-.377-.017-.7502-.306-1.1407l-7.0518-8.3418 1.0632-1.13a.9626.9626 0 0 0 .0089-1.3165L4.6336.4639s-.3733-.4535-.768-.463zm0 .272h.0166c.2179.0052.4874.2715.5644.3639l.005.006.0052.0055 10.169 10.9905a.6915.6915 0 0 1-.0072.945l-1.0666 1.133-1.4982-1.7724-8.5994-10.39c-.3286-.472-.352-.6183-.2592-.841a.7307.7307 0 0 1 .6704-.4401Zm14.341 1.5701a.877.877 0 0 0-.6554.2418l-5.6962 6.1584 1.6944 1.8319 5.3089-6.5138c.3251-.4335.479-.6603.3247-1.0292a1.1205 1.1205 0 0 0-.9763-.689zm-7.6557 12.2823 1.3186 1.4135-5.7864 6.1295a.6494.6494 0 0 1-.4959.26.7516.7516 0 0 1-.706-.4669c-.1119-.2682.0359-.6864.2442-.9083l.0051-.0055.0047-.0055z" />
    </svg>
  );
}

export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const cleanId = resolvedParams?.slug ? resolvedParams.slug.toLowerCase().trim() : "";

  const [model, setModel] = useState<ModelItem | ModelDetail | null>(() =>
  cleanId ? getCachedModelBySlug(cleanId) : null,
);
const [initialPapers, setInitialPapers] = useState<GetPapersResult | null>(null);
const [loading, setLoading] = useState<boolean>(() => !model);
const [logoError, setLogoError] = useState(false);
  const [paperSort, setPaperSort] = useState<"popular" | "latest" | "citations">("popular");
  const [period, setPeriod] = useState<string>("All time");
  const mappedPeriod = {
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "All time": "all",
}[period] || "all";

  useEffect(() => {
  window.scrollTo(0, 0);
  setLogoError(false);
  setInitialPapers(null);

  if (!cleanId) return;

  const cachedData = getCachedModelBySlug(cleanId);

  if (cachedData) {
    setModel(cachedData);
    setLoading(false);
  }

  Promise.allSettled([
  getModelBySlug(cleanId),
  getPapers({
    page: 1,
    model: cleanId,
    sort: "popular",
    period: "all",
  }),
]).then(([modelResult, papersResult]) => {
  if (modelResult.status === "fulfilled" && modelResult.value) {
    setModel(modelResult.value);
  }

  if (papersResult.status === "fulfilled") {
    setInitialPapers(papersResult.value);
  } else {
    console.error("Failed to load model papers:", papersResult.reason);
  }

  setLoading(false);
});
}, [cleanId]);

  const benchmarkArray = useMemo(() => {
    if (!model?.benchmarkScore) return [];
    return Object.entries(model.benchmarkScore)
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
        score: typeof value === "number" ? value.toFixed(1) : String(value),
        rank: null as number | null,
      }))
      .filter((item) => item.value > 0);
  }, [model]);

  const metaTags = useMemo(() => {
    if (!model) return [];
    return Array.from(
      new Set([
        model.accessType,
        model.opennessType,
        ...toStringArray(model.capabilities),
        ...toStringArray(model.researchAreas),
      ].filter((item): item is string => typeof item === "string" && item.trim().length > 0)),
    );
  }, [model]);

  const overviewRows = useMemo(() => {
    if (!model) return [];
    return [
      { label: "Model Family", value: model.modelFamily },
      { label: "Modality", value: model.modality },
      { label: "Category", value: model.category },
      { label: "Architecture", value: model.architecture },
      { label: "Parameters", value: model.parameterCount },
      { label: "Context Window", value: model.contextWindow },
      { label: "License", value: model.license },
    ].filter((row) => row.value);
  }, [model]);

  const externalLinks = useMemo(() => {
    const source = (model ?? {}) as Record<string, string | undefined | null>;
    return [
      {
        key: "repository",
        href: source.repositoryUrl,
        label: "Code",
        icon: <Github size={18} />,
      },
      {
        key: "paper",
        href: source.paperUrl,
        label: "arXiv",
        icon: <ArxivIcon size={18} />,
      },
      {
        key: "api",
        href: source.apiUrl,
        label: "API",
        icon: <ExternalLink size={18} />,
      },
    ].filter((item) => item.href);
  }, [model]);

  if (loading && !model) {
    return <ModelDetailSkeleton />;
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E5E5E0] rounded-[12px] p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#FFF6F3] text-[#FF5A1F] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#FFEDD5]">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-3 tracking-tight">
            Model Profile Not Found
          </h1>
          <p className="text-base text-[#555555] mb-8 leading-relaxed font-medium">
            We couldn&apos;t find an indexed AI foundation model matching{" "}
            <code className="bg-[#F8F7F2] border border-[#EAE9E4] px-2 py-1 rounded text-[#FF5A1F] text-[13px] font-bold mx-1">
              {resolvedParams.slug}
            </code>
            .
          </p>
          <Link
            href="/models"
            className="flex items-center justify-center gap-2 w-full p-3.5 bg-[#111111] hover:bg-[#222222] text-white rounded-[8px] transition-colors font-bold text-sm no-underline shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Models Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] pb-24">
      <Navbar />

      <div className="w-full max-w-[1370px] mx-auto px-5 md:px-10 lg:px-16 xl:px-24 pt-6 pb-12">
        <nav className="flex items-center gap-2 text-[13px] text-[#8B8B8B] mb-6">
          <Link href="/" className="hover:text-[#FF5A1F] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/models"
            className="hover:text-[#FF5A1F] transition-colors no-underline"
          >
            Models
          </Link>
          <span>/</span>
          <span className="text-[#555555] font-medium">{model.name}</span>
        </nav>

        <div className="space-y-8">
          <section className="rounded-[10px] border border-[#E5E5E0] bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-10 items-start">
              <div className="min-w-0">
                <div className="mb-4 text-[12px] uppercase tracking-[0.08em] text-[#8B8B8B]">
                  {model.vendor || "Model"}
                </div>

                <div className="flex items-start justify-between gap-6 mb-4">
  <div className="flex items-start gap-4 min-w-0 flex-1">
    <div className="w-16 h-16 shrink-0 rounded-[10px] border border-[#E5E5E0] bg-[#FAFAF8] flex items-center justify-center overflow-hidden">
      {model.vendorLogoUrl && !logoError ? (
        <img
          src={model.vendorLogoUrl}
          alt={model.vendor}
          onError={() => setLogoError(true)}
          className="w-full h-full object-contain p-2"
        />
      ) : (
        <span className="text-[18px] font-semibold text-[#777777]">
          {getInitials(model.name || model.vendor || "M")}
        </span>
      )}
    </div>

    <div className="min-w-0">
      <h1 className="text-[30px] md:text-[36px] leading-tight font-semibold tracking-[-0.03em] text-[#111111]">
        {model.name}
      </h1>

      <div className="mt-1 text-[15px] text-[#666666]">
        {model.vendor}
      </div>
    </div>
  </div>

  {externalLinks.length > 0 && (
    <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
      {externalLinks.map((link) => (
        <ExternalResourceLink
          key={link.key}
          href={link.href as string}
          label={link.label}
          icon={link.icon}
        />
      ))}
    </div>
  )}
</div>

                {model.description && (
                  <p className="max-w-3xl text-[15px] leading-7 text-[#4B5563] mb-5">
                    {model.description}
                  </p>
                )}

                {metaTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {metaTags.map((tag, index) => (
                      <Tag key={`${tag}-${index}`}>{tag}</Tag>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Stat label="Papers" value={formatNumber(model.paperCount) ?? "0"} />
                  <Stat
                    label="Citations"
                    value={formatNumber(model.citationCount) ?? "0"}
                  />
                  <Stat
                    label="GitHub Stars"
                    value={formatNumber(model.githubStars) ?? "0"}
                  />
                  <Stat
                    label="Benchmarks"
                    value={benchmarkArray.length > 0 ? benchmarkArray.length : null}
                  />
                  <Stat label="Release Date" value={formatDate(model.releaseDate)} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="space-y-4">

                  {overviewRows.length > 0 && (
                    <section className="rounded-[10px] border border-[#E5E5E0] bg-white p-5">
                      <h2 className="text-[14px] font-semibold text-[#111111] mb-2">
                        Model Overview
                      </h2>
                      <dl>
                        {overviewRows.map((row) => (
                          <SidebarRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </dl>
                    </section>
                  )}

                </div>
              </div>
            </div>
          </section>
 
          {/* Model Lineage & Evolution Tree */}
          <ModelLineageTree
            currentModel={model}
            familyModels={(model as ModelDetail).familyModels}
          />

          {benchmarkArray.length > 0 && (
            <section className="rounded-[10px] border border-[#E5E5E0] bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <BenchmarksIcon />
                <h2 className="text-[18px] font-semibold tracking-tight text-[#111111]">
                  Benchmarks
                </h2>
              </div>

              <div className="overflow-hidden rounded-[8px] border border-[#E5E5E0]">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#FAFAF8]">
                    <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-[#8B8B8B]">
                      <th className="px-4 py-3 font-medium">Benchmark</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EC] bg-white">
                    {benchmarkArray.map((benchmark) => (
                      <tr key={benchmark.name} className="text-[14px] text-[#222222]">
                        <td className="px-4 py-3 font-medium">{benchmark.name}</td>
                        <td className="px-4 py-3">{benchmark.score}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-[10px] border border-[#E5E5E0] bg-white p-6 md:p-7 w-full">
            <div className="mb-6">
  <div className="flex items-center gap-2">
    <BookOpen size={18} className="text-[#FF5A1F]" />

    <h2 className="text-[18px] font-semibold tracking-tight text-[#111111]">
      Papers
    </h2>
  </div>

  <p className="text-[13px] text-[#666666] ml-7">
    Research papers citing, evaluating, or comparing {model.name}.
  </p>
</div>

            {model.paperCount === 0 ? (
              <div className="rounded-[8px] border border-dashed border-[#E5E5E0] bg-[#FAFAF8] p-10 text-center">
                <h3 className="text-[18px] font-semibold text-[#111111] mb-2">
                  No indexed papers yet
                </h3>
                <p className="text-[14px] text-[#666666]">
                  There are currently no research papers associated with{" "}
                  <strong>{model.name}</strong>.
                </p>
              </div>
            ) : (
              <>
                <TaskFilterBar
  selectedSort={paperSort}
  onSortChange={setPaperSort}
/>

<PaperTabs
  selectedPeriod={period}
  onPeriodSelect={setPeriod}
/>

<PaperList
  filterParams={{
    model: resolvedParams.slug.toLowerCase().trim(),
    sort: paperSort,
  }}
  period={mappedPeriod}
  initialPapers={initialPapers}
/>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
