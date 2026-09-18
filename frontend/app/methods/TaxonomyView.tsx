"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { CategoryRow } from "@/components/CategoryRow";
import PageHero from "@/components/shared/PageHero";
import { prefetchTaxonomyMethods } from "@/lib/methodCache";
import SectionSidebar from "@/components/shared/SectionSidebar";

export function TaxonomyView({ initialTaxonomy }: { initialTaxonomy: any[] }) {
  const [taxonomy] = useState(initialTaxonomy);
  const [search, setSearch] = useState("");

  useEffect(() => {
    prefetchTaxonomyMethods(initialTaxonomy);
  }, [initialTaxonomy]);

  const filteredTaxonomy = taxonomy
  .map((category: any) => ({
    ...category,
    methods: category.methods.filter((method: any) =>
      method.name.toLowerCase().includes(search.toLowerCase())
    ),
  }))
  .filter((category: any) => category.methods.length > 0);
  const totalMethods = taxonomy.reduce(
  (sum, category) => sum + category.methods.length,
  0
);

const totalCategories = taxonomy.length;

const totalPapers = taxonomy.reduce(
  (sum, category) =>
    sum +
    category.methods.reduce(
      (methodSum: number, method: any) =>
        methodSum + (method.paperCount || 0),
      0
    ),
  0
);
  return (
  <>
    <PageHero
  breadcrumb="Methods"
  title="All"
  highlight="Methods"
  description="Discover the complete landscape of AI methods powering modern research, grouped into categories and linked to research papers."
  stats={[
    { value: totalCategories, label: "Categories" },
    { value: totalMethods, label: "Methods" },
    { value: totalPapers.toLocaleString(), label: "Papers" },
  ]}
/>

    <main className="flex flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)] gap-6 md:gap-8 mt-6 md:mt-10">
      <SectionSidebar
  title="Methods"
  items={filteredTaxonomy.map((category: any) => ({
    label: category.name,
    href: `#${category.id}`,
  }))}
/>

      <div>
        {filteredTaxonomy.length > 0 ? (
  filteredTaxonomy.map((category: any) => (
            <CategoryRow
              key={category.id}
              category={category}
            />
          ))
        ) : (
          <div className="ds-card flex flex-col items-center justify-center py-24 px-4 text-center">
            <h3 className="text-[16px] font-bold text-[#111111]">
              No methods found
            </h3>
          </div>
        )}
      </div>
    </main>
  </>
);
}
