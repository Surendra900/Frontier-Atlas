import * as React from "react";
import SectionHeader from "./SectionHeader";

interface ContentSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  rightLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export default function ContentSection({
  id,
  title,
  subtitle,
  rightLabel,
  className = "",
  children,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-[100px] mb-10 ${className}`}
    >
      <SectionHeader
        title={title}
        subtitle={subtitle}
        rightLabel={rightLabel}
      />

      {children}
    </section>
  );
}