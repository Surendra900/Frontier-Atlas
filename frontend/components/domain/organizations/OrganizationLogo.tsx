"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { organizationLogoUrl } from "../../../lib/organizations";

export interface OrganizationLogoProps {
  logo?: string | null;
  name: string;
  size?: number;
  className?: string;
  iconClassName?: string;
}

export default function OrganizationLogo({
  logo,
  name,
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
