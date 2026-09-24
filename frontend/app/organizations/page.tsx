"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  getCachedModelFacets,
  getCachedModels,
  type ModelFacets,
  type ModelItem,
} from "@/lib/models";
import {
  getOrganizationCatalog,
  getOrganizationDirectory,
  organizationLogoUrl,
  sortOrganizations,
  type SortMode,
} from "@/lib/organizations";
import OrganizationLogo from "@/components/domain/organizations/OrganizationLogo";

const descriptions = [
  "A leading organization shaping the frontier of AI research and production.",
  "Building foundation models and tools for the next generation of intelligent systems.",
  "A research-driven team contributing to the rapidly evolving AI ecosystem.",
  "Developing practical machine learning systems for researchers and builders.",
];

function organizationDescription(name: string) {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return descriptions[hash % descriptions.length];
}

function organizationSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function OrganizationCard({
  name,
  count,
  rank,
  logo,
  featuredModel,
  paperCount,
}: {
  name: string;
  count: number;
  rank: number;
  logo?: string;
  featuredModel?: ModelItem;
  paperCount: number;
}) {
  return (
    <Link
      href={`/organizations/${organizationSlug(name)}`}
      className="group flex h-[224px] flex-col overflow-hidden rounded-md border border-[#E7E4DD] bg-white no-underline shadow-[0_2px_12px_rgba(24,24,20,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FFB098] hover:shadow-[0_12px_30px_rgba(255,90,31,0.1)]"
    >
      <div className="flex items-start gap-2.5 border-b border-[#EEECE6] bg-[#FBFAF7] p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2DED5] bg-gradient-to-br from-white to-[#FFF8F4] p-1.5 shadow-[0_2px_5px_rgba(24,24,20,0.07)] ring-1 ring-white transition-all duration-200 group-hover:scale-105 group-hover:border-[#FFB098] group-hover:shadow-[0_4px_10px_rgba(255,90,31,0.14)]">
          <OrganizationLogo
            logo={logo}
            name={name}
            fallbackText={featuredModel?.name}
            size={20}
            iconClassName="text-[#FF5A1F]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#171717]">{name}</h2>
            <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[#B7B3AA] transition-colors group-hover:text-[#FF5A1F]" />
          </div>
          <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.13em] text-[#969188]">Organization</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-[11px] leading-4 text-[#69645C]">{organizationDescription(name)}</p>
        <div className="mt-2 flex items-end justify-between border-t border-[#F0EEE9] pt-2">
          <div>
            <span className="block text-[20px] font-semibold leading-none tracking-[-0.04em] text-[#171717]">{paperCount}</span>
            <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.1em] text-[#8C877E]">Papers</span>
          </div>
          <span className="rounded-full bg-[#FFF0EB] px-2 py-0.5 font-mono text-[9px] font-medium text-[#E74B1D]">#{rank}</span>
        </div>
        <div className="mt-2 border-t border-[#F0EEE9] pt-2">
          <span className="block font-mono text-[8px] uppercase tracking-[0.12em] text-[#969188]">Featured model</span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-[#393631]">{featuredModel?.name ?? "Explore organization models"}</span>
        </div>
      </div>
    </Link>
  );
}

export default function OrganizationsPage() {
  const cachedModels = getCachedModels();
  const cachedFacets = getCachedModelFacets();
  const [models, setModels] = useState<ModelItem[]>(cachedModels ?? []);
  const [facets, setFacets] = useState<ModelFacets | null>(cachedFacets);
  const [paperCounts, setPaperCounts] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<SortMode>("trending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Load fast catalog immediately for instant rendering
    getOrganizationCatalog()
      .then((catalog) => {
        if (cancelled) return;
        setModels(catalog.models);
        setFacets(catalog.facets);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Unable to load organization catalog", error);
      });

    // Load directory with paper counts
    getOrganizationDirectory()
      .then((directory) => {
        if (cancelled) return;
        setModels(directory.models);
        setFacets(directory.facets);
        setPaperCounts(directory.paperCounts);
      })
      .catch((error) => console.error("Unable to load organization directory counts", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const organizations = useMemo(() => {
    const normalizeKey = (val: string) => val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
    const grouped = new Map<string, ModelItem[]>();

    models.forEach((model) => {
      if (!model.vendor) return;
      const exactKey = model.vendor;
      const normKey = normalizeKey(model.vendor);

      const previousExact = grouped.get(exactKey) ?? [];
      previousExact.push(model);
      grouped.set(exactKey, previousExact);

      if (normKey && normKey !== exactKey) {
        const previousNorm = grouped.get(normKey) ?? [];
        previousNorm.push(model);
        grouped.set(normKey, previousNorm);
      }
    });

    const source = facets?.vendors?.length
      ? facets.vendors.map((vendor) => ({ name: vendor.name, count: vendor.count }))
      : [...grouped.entries()].map(([name, entries]) => ({ name, count: entries.length }));

    const mapped = source.map((organization) => {
      const normOrg = normalizeKey(organization.name);
      const organizationModels = grouped.get(organization.name) ?? grouped.get(normOrg) ?? [];
      return {
        ...organization,
        logo: organizationLogoUrl(organizationModels.find((model) => model.vendorLogoUrl)?.vendorLogoUrl),
        featuredModel: [...organizationModels].sort(
          (a, b) => (b.trendingScore || 0) - (a.trendingScore || 0) || b.paperCount - a.paperCount
        )[0],
        paperCount: paperCounts[organization.name] ?? 0,
        momentum: organizationModels.reduce((total, model) => total + (model.trendingScore || 0), 0),
      };
    });

    return sortOrganizations(mapped, sort);
  }, [facets?.vendors, models, paperCounts, sort]);

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717]">
      <Navbar />
      <main className="mx-auto w-full max-w-[1370px] px-5 pb-16 pt-10 md:px-10 lg:px-16 xl:px-24">
        <section className="border-b border-[#DEDAD1] pb-9">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF5A1F]">
            <Sparkles size={13} />
            Frontier Atlas directory
          </div>
          <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.045em] text-[#171717] sm:text-[50px]">
            AI <span className="text-[#FF5A1F]">Organizations</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#625E57]">
            Explore the labs, companies, and research groups building the models tracked across Frontier Atlas.
          </p>
        </section>

        <section className="pt-8" aria-labelledby="organizations-heading">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8C877E]">Model ecosystem</p>
              <h2 id="organizations-heading" className="mt-2 text-[25px] font-semibold tracking-[-0.03em]">{facets?.vendors?.length ?? organizations.length} organizations</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-md border border-[#DDD9D0] bg-white p-1">
                {([['trending', 'Trending'], ['models', 'Most models'], ['az', 'A–Z']] as const).map(([value, label]) => (
                  <button key={value} onClick={() => setSort(value)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${sort === value ? "bg-[#171717] text-white" : "text-[#6B665F] hover:bg-[#F4F1EB]"}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid max-w-[1140px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[224px] animate-pulse rounded-md border border-[#E7E4DD] bg-white" />)}
            </div>
          ) : organizations.length ? (
            <div className="mt-6 grid max-w-[1140px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {organizations.map((organization, index) => <OrganizationCard key={organization.name} {...organization} rank={index + 1} />)}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
