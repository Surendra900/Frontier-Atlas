"use client";

import * as React from "react";
import MethodCard from "@/components/MethodCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { getCategoryColors } from "@/lib/categoryColors";
import CardGrid from "@/components/shared/CardGrid";
import ContentSection from "@/components/shared/ContentSection";

export interface MethodCategory {
  id: string;
  name: string;
  iconName?: string;
  methods: {
    id: string;
    name: string;
    slug?: string;
    paperCount?: number;
    year?: number;
  }[];
}

export function CategoryRow({
  category,
}: {
  category: MethodCategory;
}) {
  const totalPapers = category.methods.reduce(
    (sum, method) => sum + (method.paperCount || 0),
    0
  );

  const colors = getCategoryColors(category.id);

  return (
    <ContentSection
  id={category.id}
  title={category.name}
  subtitle={`${category.methods.length} methods · ${totalPapers.toLocaleString()} papers`}
>
  <CardGrid>
    {category.methods.map((method) => (
      <MethodCard
        key={method.id}
        method={method}
        accentColor={colors.accent}
      />
    ))}
  </CardGrid>
</ContentSection>
  );
}