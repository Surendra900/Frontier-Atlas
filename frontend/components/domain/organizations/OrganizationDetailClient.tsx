"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PaperCard } from "@/components/PaperFeed";
import { getModelFacets, getModels } from "@/lib/models";
import { getPapers, type Paper } from "@/lib/paperApi";

const toSlug = (value: string) =>
  typeof value === "string"
    ? value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "";

function organizationLogoUrl(logo?: string) {
  if (!logo) return undefined;

  try {
    const url = new URL(logo);
    if (url.hostname === "logo.clearbit.com") {
      const domain = url.pathname.replace(/^\//, "");
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    }
  } catch {
    return logo;
  }

  return logo;
}

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

export default function OrganizationDetailClient({ slug }: { slug: string }) {
  const safeSlug = typeof slug === "string" ? slug.trim() : "";
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string | undefined>();
  const [imageError, setImageError] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"latest" | "citations">("latest");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;
    setImageError(false);

    if (!safeSlug) {
      setLoading(false);
      return;
    }

    Promise.all([
      getModelFacets().catch(() => ({ vendors: [] })),
      getModels().catch(() => []),
    ])
      .then(([facets, models]) => {
        if (!mounted) return;

        const safeVendors = Array.isArray(facets?.vendors) ? facets.vendors : [];
        const safeModels = Array.isArray(models) ? models : [];

        const organization = safeVendors.find(
          (vendor) => vendor && vendor.name && toSlug(vendor.name) === safeSlug
        );
        const organizationName = organization?.name ?? safeSlug.replace(/-/g, " ");

        setName(organizationName);

        const matchedModel = safeModels.find(
          (model) => model && model.vendor === organizationName && model.vendorLogoUrl
        );

        setLogo(organizationLogoUrl(matchedModel?.vendorLogoUrl));

        return getPapers({ organization: organizationName, limit: 50, sort: "latest" });
      })
      .then((result) => {
        if (mounted && result && Array.isArray(result.papers)) {
          setPapers(result.papers);
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error("Unable to load organization papers:", error);
          setPapers([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [safeSlug]);

  const displayedPapers = useMemo(() => {
    return [...papers].sort((a, b) => {
      if (sort === "citations") {
        const citationsA = typeof a.citations === "number" ? a.citations : 0;
        const citationsB = typeof b.citations === "number" ? b.citations : 0;
        return citationsB - citationsA;
      }

      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [papers, sort]);

  const displayName = name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Organization";
  const website = name ? ORGANIZATION_WEBSITES[name] : undefined;
  const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : "O";

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-6">
        <nav className="mb-5 flex items-center gap-2 text-xs uppercase text-[#7B766E]">
          <Link href="/" className="hover:text-[#FF5A1F]">
            Home
          </Link>
          <span>›</span>
          <Link href="/organizations" className="hover:text-[#FF5A1F]">
            Organizations
          </Link>
          <span>›</span>
          <span className="font-medium text-[#FF5A1F]">{displayName}</span>
        </nav>

        <section className="relative mb-7 overflow-hidden rounded-2xl border border-[#E5DED5] bg-white px-6 py-7 sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#FFF0EB] blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E4DD] bg-white p-3 text-[#FF5A1F] shadow-[0_6px_18px_rgba(24,24,20,0.06)]">
                {logo && !imageError ? (
                  <img
                    src={logo}
                    alt={`${displayName} logo`}
                    className="h-full w-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-3xl font-bold uppercase text-[#FF5A1F] select-none">
                    {initial}
                  </span>
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B06A50]">
                  Organization profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#171717] sm:text-5xl">
                  {displayName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625E57]">
                  Research papers, models, and contribution activity tracked across the Frontier Atlas ecosystem.
                </p>
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E74B1D] hover:underline"
                  >
                    Visit website <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[250px]">
              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E]">
                  Papers
                </span>
                <strong className="mt-1 block text-2xl tracking-[-0.04em] text-[#171717]">
                  {isMounted ? papers.length : "..."}
                </strong>
              </div>
              <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E]">
                  Coverage
                </span>
                <strong className="mt-1 block text-sm font-semibold text-[#171717]">
                  Last 12 months
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDAD1] pb-4">
            <div className="flex items-center gap-2">
              <FileText size={17} className="text-[#FF5A1F]" />
              <h2 className="text-xl font-semibold">Papers</h2>
              <span className="text-sm text-[#7B766E]">{isMounted ? papers.length : "..."}</span>
            </div>
            <div className="flex rounded-lg border border-[#DDD9D0] bg-white p-1" role="radiogroup" aria-label="Sort papers">
              {(
                [
                  ["latest", "Recent"],
                  ["citations", "Citations"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={sort === value}
                  onClick={() => setSort(value)}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === value ? "bg-[#171717] text-white" : "text-[#6B665F] hover:text-[#171717]"
                  }`}
                >
                  {value === "latest" && <TrendingUp size={13} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-xl border border-[#E7E4DD] bg-white"
                />
              ))}
            </div>
          ) : displayedPapers.length ? (
            <div className="space-y-4">
              {displayedPapers.map((paper) => (
                <PaperCard key={paper.slug || paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D9D5CB] bg-white p-12 text-center text-[#6B665F]">
              No papers have been associated with this organization yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}