import type { Metadata } from "next";
import { resolveCardContract } from "@/lib/models-contract";
import { getModelsFromDb, getCardMetaFromDb } from "@/lib/models-db";
import ModelsListingClient from "./ModelsListingClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contract = resolveCardContract(slug);
  return {
    title: `${contract.title} - AI Model Catalog | Frontier Atlas`,
    description: contract.description,
    openGraph: {
      title: `${contract.title} - Frontier Atlas`,
      description: contract.description,
    },
  };
}

export default async function ModelsListingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const cardSlug = slug ? slug.toLowerCase().trim() : "all";
  const search = typeof sParams.q === "string" ? sParams.q : typeof sParams.search === "string" ? sParams.search : "";
  const vendor = typeof sParams.vendor === "string" ? sParams.vendor : "";
  const family = typeof sParams.family === "string" ? sParams.family : "";
  const modality = typeof sParams.modality === "string" ? sParams.modality : "";
  const openness = typeof sParams.openness === "string" ? sParams.openness : "";
  const capability = typeof sParams.capability === "string" ? sParams.capability : "";
  const minContext = parseInt(typeof sParams.context === "string" ? sParams.context : "0", 10);
  const maxPrice = parseFloat(typeof sParams.price === "string" ? sParams.price : "0");
  const sort = typeof sParams.sort === "string" ? sParams.sort : "newest";

  // Pre-fetch card metadata and models directly on server (Zero-waterfall SSR)
  const [meta, result] = await Promise.all([
    getCardMetaFromDb(cardSlug),
    getModelsFromDb({
      cardSlug,
      search,
      vendor,
      family,
      modality,
      openness,
      capability,
      minContext,
      maxPrice,
      sort,
      page: 1,
      limit: 100,
    }),
  ]);

  return (
    <ModelsListingClient
      initialSlug={cardSlug}
      initialMeta={meta}
      initialModels={result.data}
      initialTotal={result.total}
      initialFacets={result.facets}
    />
  );
}
