"use client";

import * as React from "react";

export interface TaxonomyCategory {
  name?: string;
  methods?: Array<{
    id?: string;
    name?: string;
    slug?: string;
    paperCount?: number;
  }>;
}

export function MethodsHero({ taxonomy = [] }: { taxonomy?: TaxonomyCategory[] }) {
  const safeTaxonomy = Array.isArray(taxonomy) ? taxonomy : [];

  const totalCategories = safeTaxonomy.length;

  const totalMethods = safeTaxonomy.reduce((sum, category) => {
    const methods = Array.isArray(category?.methods) ? category.methods : [];
    return sum + methods.length;
  }, 0);

  const totalPapers = safeTaxonomy.reduce((sum, category) => {
    const methods = Array.isArray(category?.methods) ? category.methods : [];
    const categoryPaperSum = methods.reduce((methodSum, method) => {
      const rawCount = Number(method?.paperCount);
      const count = !isNaN(rawCount) && rawCount > 0 ? rawCount : 0;
      return methodSum + count;
    }, 0);
    return sum + categoryPaperSum;
  }, 0);

  return (
    <section className="mb-12">
      <div className="max-w-[560px]">
        <h1 className="text-[32px] font-black tracking-tight text-[#111827] leading-none">
          All <span className="text-[#F55036]">Methods</span>
        </h1>

        <p className="mt-4 text-[14px] leading-6 text-[#5B6472]">
          Discover the complete landscape of AI methods powering modern
          research, grouped into categories and linked to research papers.
        </p>

        <div className="flex items-start gap-10 mt-5">
          <div>
            <div className="text-[20px] font-bold text-[#111111]">
              {totalCategories.toLocaleString()}
            </div>
            <div className="mt-1 text-[14px] text-[#6B7280]">
              Categories
            </div>
          </div>

          <div>
            <div className="text-[20px] font-bold text-[#111111]">
              {totalMethods.toLocaleString()}
            </div>
            <div className="mt-1 text-[14px] text-[#6B7280]">
              Methods
            </div>
          </div>

          <div>
            <div className="text-[20px] font-bold text-[#111111]">
              {totalPapers.toLocaleString()}
            </div>
            <div className="mt-1 text-[14px] text-[#6B7280]">
              Papers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}