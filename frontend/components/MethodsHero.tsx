"use client";

import * as React from "react";

export function MethodsHero({ taxonomy = [] }: { taxonomy?: any[] }) {
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
              {totalCategories}
            </div>
            <div className="mt-1 text-[14px] text-[#6B7280]">
              Categories
            </div>
          </div>

          <div>
            <div className="text-[20px] font-bold text-[#111111]">
              {totalMethods}
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