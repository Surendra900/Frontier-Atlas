"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, FileText, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PaperCard } from "@/components/PaperFeed";
import { getModelFacets, getModels } from "@/lib/models";
import { getPapers, type Paper } from "@/lib/paperApi";
import { OrganizationLogo } from "@/components/domain/organizations/OrganizationLogo";

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function OrganizationDetailClient({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string | undefined>();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paperCount, setPaperCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"latest" | "citations">("latest");

  useEffect(() => {
    Promise.all([getModelFacets(), getModels()]).then(([facets, models]) => {
      const organization = facets.vendors.find((vendor) => toSlug(vendor.name) === slug);
      const organizationName = organization?.name ?? slug.replace(/-/g, " ");
      setName(organizationName);

      const foundModel = models.find((model) => model.vendor?.toLowerCase() === organizationName.toLowerCase() && model.vendorLogoUrl);
      setLogo(foundModel?.vendorLogoUrl);

      return getPapers({ organization: organizationName, limit: 50, sort: "latest" });
    }).then((result) => {
      setPapers(result.papers);
      setPaperCount(typeof result.total === "number" ? result.total : result.papers.length);
    }).catch((error) => console.error("Unable to load organization papers", error)).finally(() => setLoading(false));
  }, [slug]);

  const displayedPapers = useMemo(() => [...papers].sort((a, b) => sort === "citations" ? b.citations - a.citations : new Date(b.date).getTime() - new Date(a.date).getTime()), [papers, sort]);
  const displayName = name.replace(/\b\w/g, (letter) => letter.toUpperCase());

  return <div className="min-h-screen bg-[#F8F7F2] text-[#171717]"><Navbar /><main className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-6">
    <nav className="mb-5 flex items-center gap-2 text-xs uppercase text-[#7B766E]"><Link href="/" className="hover:text-[#FF5A1F]">Home</Link><span>›</span><Link href="/organizations" className="hover:text-[#FF5A1F]">Organizations</Link><span>›</span><span className="font-medium text-[#FF5A1F]">{displayName}</span></nav>
    <section className="relative mb-7 overflow-hidden rounded-2xl border border-[#E5DED5] bg-white px-6 py-7 sm:px-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#FFF0EB] blur-3xl" />
      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E4DD] bg-white p-3 text-[#FF5A1F] shadow-[0_6px_18px_rgba(24,24,20,0.06)]"><OrganizationLogo logo={logo} name={displayName} iconSize={34} /></div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B06A50]">Organization profile</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#171717] sm:text-5xl">{displayName}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#625E57]">Research papers, models, and contribution activity tracked across the Frontier Atlas ecosystem.</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-[250px]">
          <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3"><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E]">Papers</span><strong className="mt-1 block text-2xl tracking-[-0.04em] text-[#171717]">{paperCount}</strong></div>
          <div className="rounded-xl border border-[#EEE9E1] bg-[#FCFBF8] px-4 py-3"><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8C877E]">Coverage</span><strong className="mt-1 block text-sm font-semibold text-[#171717]">Last 12 months</strong></div>
        </div>
      </div>
    </section>
    <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDAD1] pb-4"><div className="flex items-center gap-2"><FileText size={17} className="text-[#FF5A1F]" /><h2 className="text-xl font-semibold">Papers</h2><span className="text-sm text-[#7B766E]">{paperCount}</span></div><div className="flex rounded-lg border border-[#DDD9D0] bg-white p-1">{([['latest', 'Recent'], ['citations', 'Citations']] as const).map(([value, label]) => <button key={value} onClick={() => setSort(value)} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${sort === value ? "bg-[#171717] text-white" : "text-[#6B665F]"}`}>{value === 'latest' && <TrendingUp size={13} />}{label}</button>)}</div></div>
      {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-xl border border-[#E7E4DD] bg-white" />)}</div> : displayedPapers.length ? <div className="space-y-4">{displayedPapers.map((paper) => <PaperCard key={paper.slug} paper={paper} />)}</div> : <div className="rounded-xl border border-dashed border-[#D9D5CB] bg-white p-12 text-center text-[#6B665F]">No papers have been associated with this organization yet.</div>}
    </section>
  </main></div>;
}
