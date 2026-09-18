"use client";

import * as React from "react";

interface ExpandableDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableDescription({ text, maxLength = 250, className }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!text) return null;

  if (text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  const displayText = isExpanded ? text : `${text.slice(0, maxLength)}...`;

  return (
    <div className="flex flex-col items-start">
      <p className={className}>{displayText}</p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-brand font-medium text-sm hover:underline mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
