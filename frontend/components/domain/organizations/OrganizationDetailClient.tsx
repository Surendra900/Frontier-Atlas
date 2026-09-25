"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  FileText,
  TrendingUp,
  Cpu,
  Star,
  Quote,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { PaperCard } from "@/components/PaperFeed";
import { getModelFacets, getModels, type ModelItem } from "@/lib/models";
import { getPapers, type Paper } from "@/lib/paperApi";
import { calculateOrganizationImpactMetrics } from "@/lib/impactMetrics";
import { organizationLogoUrl } from "@/lib/organizations";
import OrganizationLogo from "./OrganizationLogo";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ORGANIZATION_WEBSITES: Record<string, string> = {
  Adobe: "https://www.adobe.com/",
  Amazon: "https://www.amazon.com/",
  "Amazon Web Services": "https://aws.amazon.com/",
  Anthropic: "https://www.anthropic.com/",
  Apple: "https://www.apple.com/",
  Cohere: "https://cohere.com/",
  DeepMind: "https://deepmind.google/",
  Google: "https://about.google/",
  "Google DeepMind": "https://deepmind.google/",
  "Hugging Face": "https://huggingface.co/",
  IBM: "https://www.ibm.com/",
  Meta: "https://ai.meta.com/",
  Microsoft: "https://www.microsoft.com/",
  "Mistral AI": "https://mistral.ai/",
  NVIDIA: "https://www.nvidia.com/",
  OpenAI: "https://openai.com/",
  Salesforce: "https://www.salesforce.com/",
  "Stability AI": "https://stability.ai/",
  xAI: "https://x.ai/",
};

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toLocaleString();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function OrganizationDetailClient({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string | undefined>();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"models" | "papers">("models");
  const [paperSort, setPaperSort] = useState<"latest" | "citations" | "stars">("latest");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getModelFacets(), getModels()])
      .then(([facets, allModels]) => {
        if (cancelled) return;

        const organization = facets.vendors.find((vendor) => toSlug(vendor.name) === slug);
        const organizationName = organization?.name ?? slug.replace(/-/g, " ");
        setName(organizationName);

        // Filter models belonging to this organization/vendor
        const vendorModels = allModels.filter(
          (m) =>
            m.vendor?.toLowerCase().trim() === organizationName.toLowerCase().trim() ||
            toSlug(m.vendor || "") === slug
        );
        setModels(vendorModels);

        const foundLogo = vendorModels.find((m) => m.vendorLogoUrl)?.vendorLogoUrl;
        setLogo(organizationLogoUrl(foundLogo));

        // Default to papers tab if no models
        if (vendorModels.length === 0) {
          setActiveTab("papers");
        }
      })
      .catch((error) => {
        if (!cancelled) console.error("Unable to load organization data:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    setPapersLoading(true);

    getPapers({ organization: name, limit: 100, sort: paperSort })
      .then((result) => {
        if (!cancelled) {
          setPapers(result.papers || []);
        }
      })
      .catch((error) => {
        if (!cancelled) console.error("Unable to load organization papers:", error);
      })
      .finally(() => {
        if (!cancelled) {
          setPapersLoading(false);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [name, paperSort]);

  // Aggregate Impact Metrics (deduplicated to avoid double-counting overlapping paper & model metrics)
  const metrics = useMemo(() => {
    return calculateOrganizationImpactMetrics(papers, models);
  }, [papers, models]);

  // Papers are sorted directly by the backend database query
  const displayedPapers = papers;

  const displayName = name.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const website = ORGANIZATION_WEBSITES[name] || ORGANIZATION_WEBSITES[displayName];

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717] pb-24">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-6">
        {/* Breadcrumbs */}
        <nav className="mb-5 flex items-center gap-2 text-xs uppercase text-[#7B766E]">
          <Link href="/" className="hover:text-[#FF5A1F] transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link href="/organizations" className="hover:text-[#FF5A1F] transition-colors">
            Organizations
          </Link>
          <span>›</span>
          <span className="font-semibold text-[#FF5A1F]">{displayName}</span>
        </nav>

        {/* Hero Banner */}
        <section className="relative mb-7 overflow-hidden rounded-2xl border border-[#E5DED5] bg-white px-6 py-7 sm:px-8 shadow-xs">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[rgba(255,90,31,0.06)] blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E4DD] bg-[#FAFAF8] p-3 text-[#FF5A1F] shadow-[0_6px_18px_rgba(24,24,20,0.06)]">
                <OrganizationLogo
                  logo={logo}
                  name={displayName}
                  fallbackText={models[0]?.name}
                  size={34}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B06A50]">
                    AI Research Lab & Organization
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-semibold text-emerald-700">
                    <ShieldCheck size={11} /> Verified Hub
                  </span>
                </div>

                <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#171717] sm:text-4xl">
                  {displayName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625E57]">
                  State-of-the-art foundation models, architectural weights, and published research
                  papers contributed to the global scientific community.
                </p>

                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5A1F] hover:underline"
                  >
                    Official Portal <ExternalLink size={12} />
                  </a>
                )}

                {/* Focus Areas */}
                {metrics.focusAreas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-4">
                    <span className="text-[11px] font-mono text-[#888888] mr-1">Focus:</span>
                    {metrics.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAFAF8] border border-[#E5E5E0] text-[#555555]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:min-w-[420px]">
              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E] block">
                  Models
                </span>
                <strong className="mt-1 block text-2xl font-black tracking-tight text-[#171717] font-mono">
                  {models.length}
                </strong>
              </div>

              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E] block">
                  Papers
                </span>
                <strong className="mt-1 block text-2xl font-black tracking-tight text-[#171717] font-mono">
                  {papers.length}
                </strong>
              </div>

              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E] block">
                  Citations
                </span>
                <strong className="mt-1 block text-2xl font-black tracking-tight text-[#171717] font-mono">
                  {formatCompactNumber(metrics.totalCitations)}
                </strong>
              </div>

              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E] block">
                  GitHub Stars
                </span>
                <strong className="mt-1 block text-2xl font-black tracking-tight text-amber-600 font-mono">
                  {formatCompactNumber(metrics.totalStars)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDAD1] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("models")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === "models"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E5E0]"
              }`}
            >
              <Cpu size={16} className={activeTab === "models" ? "text-[#FF5A1F]" : ""} />
              <span>Foundation Models</span>
              <span
                className={`text-xs px-2 py-0.2 rounded-full font-mono ${
                  activeTab === "models" ? "bg-white/20 text-white" : "bg-[#EAE9E4] text-[#444444]"
                }`}
              >
                {models.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("papers")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === "papers"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E5E0]"
              }`}
            >
              <FileText size={16} className={activeTab === "papers" ? "text-[#FF5A1F]" : ""} />
              <span>Research Papers</span>
              <span
                className={`text-xs px-2 py-0.2 rounded-full font-mono ${
                  activeTab === "papers" ? "bg-white/20 text-white" : "bg-[#EAE9E4] text-[#444444]"
                }`}
              >
                {papers.length}
              </span>
            </button>
          </div>

          {/* Paper Sort Controls (when on Papers tab) */}
          {activeTab === "papers" && (
            <div className="flex items-center gap-1 rounded-lg border border-[#DDD9D0] bg-white p-1 self-start sm:self-auto">
              <button
                onClick={() => setPaperSort("latest")}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  paperSort === "latest" ? "bg-[#171717] text-white" : "text-[#6B665F] hover:text-[#111111]"
                }`}
              >
                <TrendingUp size={13} />
                <span>Recent</span>
              </button>
              <button
                onClick={() => setPaperSort("citations")}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  paperSort === "citations" ? "bg-[#171717] text-white" : "text-[#6B665F] hover:text-[#111111]"
                }`}
              >
                <Quote size={13} />
                <span>Citations</span>
              </button>
              <button
                onClick={() => setPaperSort("stars")}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  paperSort === "stars" ? "bg-[#171717] text-white" : "text-[#6B665F] hover:text-[#111111]"
                }`}
              >
                <Star size={13} />
                <span>Stars</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-xl border border-[#E7E4DD] bg-white"
              />
            ))}
          </div>
        ) : activeTab === "models" ? (
          /* Models Tab View */
          models.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D9D5CB] bg-white p-12 text-center text-[#6B665F]">
              <Cpu size={32} className="mx-auto text-[#AAAAAA] mb-3" />
              <p className="font-semibold text-base text-[#333333]">
                No standalone models indexed directly under this vendor tag yet.
              </p>
              <p className="text-xs text-[#888888] mt-1">
                You can review the {papers.length} research papers published by {displayName} in the
                Research Papers tab.
              </p>
              <button
                onClick={() => setActiveTab("papers")}
                className="mt-4 px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                View Research Papers ({papers.length})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-[#E5E5E0] bg-white p-5 hover:border-[#FF5A1F]/40 hover:shadow-md transition-all no-underline"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                        {model.modelFamily || "Checkpoint"}
                      </span>
                      {model.opennessType && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {model.opennessType}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                      {model.name}
                    </h3>

                    {model.description && (
                      <p className="text-xs text-[#666666] line-clamp-2 mt-1.5 leading-relaxed">
                        {model.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {model.parameterCount && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-[#333333]">
                          <Cpu size={11} className="text-[#888888]" />
                          {model.parameterCount}
                        </span>
                      )}
                      {model.architecture && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-[#555555]">
                          <Layers size={11} className="text-[#888888]" />
                          {model.architecture}
                        </span>
                      )}
                      {model.contextWindow && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-[#555555]">
                          {model.contextWindow} ctx
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#F0EFEA] flex items-center justify-between text-xs text-[#777777]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(model.releaseDate)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[#FF5A1F] font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect Model</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          /* Papers Tab View */
          <div className="space-y-4">
            {papersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-xl border border-[#E7E4DD] bg-white"
                  />
                ))}
              </div>
            ) : displayedPapers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D9D5CB] bg-white p-12 text-center text-[#6B665F]">
                No papers have been associated with this organization yet.
              </div>
            ) : (
              displayedPapers.map((paper) => <PaperCard key={paper.slug} paper={paper} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
}
