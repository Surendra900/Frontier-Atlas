import * as React from "react";

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function CardGrid({
  children,
  className = "",
}: CardGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </div>
  );
}