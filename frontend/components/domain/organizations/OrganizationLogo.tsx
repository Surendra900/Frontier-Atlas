"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { organizationLogoUrl } from "../../../lib/organizations";

export interface OrganizationLogoProps {
  logo?: string | null;
  name: string;
  fallbackText?: string;
  size?: number;
  className?: string;
  iconClassName?: string;
}

export function getInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function OrganizationLogo({
  logo,
  name,
  fallbackText,
  size = 20,
  className = "h-full w-full object-contain",
  iconClassName = "text-[#FF5A1F]",
}: OrganizationLogoProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = organizationLogoUrl(logo);

  // Reset error state if logo prop changes
  useEffect(() => {
    setHasError(false);
  }, [logo]);

  if (!resolvedUrl || hasError) {
    if (fallbackText) {
      const initials = getInitials(fallbackText);
      if (initials) {
        return (
          <span
            className="font-semibold text-[#777777] select-none leading-none tracking-tight"
            style={{ fontSize: Math.max(11, Math.round(size * 0.6)) }}
            aria-label={`${name} avatar initials`}
          >
            {initials}
          </span>
        );
      }
    }

    return (
      <Building2
        size={size}
        className={iconClassName}
        aria-label={`${name} fallback icon`}
      />
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={`${name} logo`}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
