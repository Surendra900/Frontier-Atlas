"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";

interface OrganizationLogoProps {
  logo?: string | null;
  name: string;
  className?: string;
  iconSize?: number;
}

function resolveLogoUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (
    trimmed === "" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "FAILED_404"
  ) {
    return null;
  }

  // Clearbit free logo API (logo.clearbit.com) was shut down and throws net::ERR_NAME_NOT_RESOLVED.
  // Transform it directly to Google's reliable high-resolution favicon service.
  if (trimmed.includes("logo.clearbit.com")) {
    try {
      const parsed = new URL(trimmed);
      const domain = parsed.pathname.replace(/^\/+/, "").replace(/\/.*$/, "").trim();
      if (domain && domain.includes(".")) {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
      }
    } catch {
      return null;
    }
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return null;
}

function getCandidateUrls(logo: string | null | undefined, name: string): string[] {
  const candidates: string[] = [];
  const primary = resolveLogoUrl(logo);
  if (primary) {
    candidates.push(primary);
  }

  const cleanName = (name || "").trim();
  if (!cleanName) return candidates;

  // 1. If cleanName looks like an internet domain (e.g. "stanford.edu", "tsinghua.edu.cn", "bytedance.com")
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(cleanName)) {
    candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanName)}&sz=128`);
  }

  // 2. If cleanName is a standard GitHub/HuggingFace handle / organization name (alphanumeric, dashes, underscores)
  if (/^[a-zA-Z0-9_\-\.]+$/.test(cleanName)) {
    const ghUrl = `https://github.com/${encodeURIComponent(cleanName)}.png`;
    if (!candidates.includes(ghUrl)) {
      candidates.push(ghUrl);
    }

    // Many Hugging Face organizations append -HF (e.g., TMLR-Group-HF -> TMLR-Group on GitHub)
    if (/-hf$/i.test(cleanName)) {
      const withoutHf = cleanName.replace(/-hf$/i, "");
      if (withoutHf) {
        const withoutHfUrl = `https://github.com/${encodeURIComponent(withoutHf)}.png`;
        if (!candidates.includes(withoutHfUrl)) {
          candidates.push(withoutHfUrl);
        }
      }
    }
  }

  return candidates;
}

export function OrganizationLogo({
  logo,
  name,
  className = "h-full w-full object-contain",
  iconSize = 20,
}: OrganizationLogoProps) {
  const candidates = useMemo(() => getCandidateUrls(logo, name), [logo, name]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Reset candidate index when logo or name changes
  useEffect(() => {
    setCandidateIndex(0);
  }, [logo, name]);

  const currentUrl = candidates[candidateIndex];

  if (!currentUrl || candidateIndex >= candidates.length) {
    return (
      <Building2
        size={iconSize}
        className="text-[#FF5A1F]"
        aria-label={`${name} icon`}
      />
    );
  }

  return (
    <img
      src={currentUrl}
      alt={`${name} logo`}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        setCandidateIndex((prev) => prev + 1);
      }}
    />
  );
}

export default OrganizationLogo;
