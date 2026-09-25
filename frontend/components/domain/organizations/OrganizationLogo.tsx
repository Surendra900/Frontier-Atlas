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

const KNOWN_ORGANIZATION_LOGOS: Record<string, string> = {
  alibaba: "https://github.com/alibaba.png",
  alibabagroup: "https://github.com/alibaba.png",
  alibabacloud: "https://github.com/alibaba.png",
  qwen: "https://github.com/QwenLM.png",
  bytedance: "https://github.com/bytedance.png",
  bytedanceseed: "https://github.com/bytedance.png",
  zhipu: "https://github.com/THUDM.png",
  zhipuai: "https://github.com/THUDM.png",
  thudm: "https://github.com/THUDM.png",
  thuml: "https://github.com/THUDM.png",
  internlm: "https://github.com/InternLM.png",
  shanghaiailab: "https://github.com/InternLM.png",
  shanghaiailaboratory: "https://github.com/InternLM.png",
  deepseek: "https://github.com/deepseek-ai.png",
  deepseekai: "https://github.com/deepseek-ai.png",
  moonshot: "https://github.com/MoonshotAI.png",
  moonshotai: "https://github.com/MoonshotAI.png",
  minimax: "https://github.com/MiniMax-AI.png",
  baichuan: "https://github.com/baichuan-inc.png",
  baichuanai: "https://github.com/baichuan-inc.png",
  "01ai": "https://github.com/01-ai.png",
  stepfun: "https://github.com/stepfun-ai.png",
  mistral: "https://github.com/mistralai.png",
  mistralai: "https://github.com/mistralai.png",
  anthropic: "https://github.com/anthropics.png",
  openai: "https://github.com/openai.png",
  meta: "https://github.com/facebookresearch.png",
  google: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  microsoft: "https://github.com/microsoft.png",
  microsoftresearch: "https://github.com/microsoft.png",
  xai: "https://github.com/xai-org.png",
  nvidia: "https://github.com/NVIDIA.png",
  salesforce: "https://github.com/salesforce.png",
  baidu: "https://github.com/PaddlePaddle.png",
  tencent: "https://github.com/Tencent.png",
  amazon: "https://github.com/aws.png",
  aws: "https://github.com/aws.png",
  allenai: "https://github.com/allenai.png",
  ai2: "https://github.com/allenai.png",
  baai: "https://github.com/FlagOpen.png",
  cohere: "https://github.com/cohere-ai.png",
  cohereforai: "https://github.com/cohere-ai.png",
  eleutherai: "https://github.com/EleutherAI.png",
  stabilityai: "https://github.com/Stability-AI.png",
  huggingface: "https://github.com/huggingface.png",
  together: "https://github.com/togethercomputer.png",
  togetherai: "https://github.com/togethercomputer.png",
  groq: "https://github.com/groq.png",
  apple: "https://github.com/apple.png",
  ibmgranite: "https://github.com/ibm-granite.png",
  ibm: "https://github.com/IBM.png",
  speakleash: "https://github.com/speakleash.png",
  reka: "https://github.com/reka-ai.png",
  lmsys: "https://github.com/lm-sys.png",
  stanford: "https://github.com/stanfordnlp.png",
  berkeley: "https://github.com/berkeley-nest.png",
};

function getCandidateUrls(logo: string | null | undefined, name: string): string[] {
  const candidates: string[] = [];
  const cleanName = (name || "").trim();
  const normalizedKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Check verified organization logos first
  if (normalizedKey && KNOWN_ORGANIZATION_LOGOS[normalizedKey]) {
    candidates.push(KNOWN_ORGANIZATION_LOGOS[normalizedKey]);
  }

  // 2. Direct custom logo URL if provided and not a clearbit/google favicon URL
  const primary = resolveLogoUrl(logo);
  const isClearbitOrFavicon =
    (logo && logo.includes("logo.clearbit.com")) ||
    (primary && primary.includes("google.com/s2/favicons"));

  if (primary && !isClearbitOrFavicon && !candidates.includes(primary)) {
    candidates.push(primary);
  }

  // 3. GitHub avatar candidate
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

  // 4. Primary if it was a favicon/clearbit
  if (primary && isClearbitOrFavicon && !candidates.includes(primary)) {
    candidates.push(primary);
  }

  // 5. If cleanName looks like an internet domain
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(cleanName)) {
    const domainFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanName)}&sz=128`;
    if (!candidates.includes(domainFavicon)) {
      candidates.push(domainFavicon);
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
      onLoad={(e) => {
        const img = e.currentTarget;
        // Google's favicon service returns a 16x16 default globe when it has no favicon for a domain.
        // If that happens, advance to the next candidate instead of showing the generic globe.
        if (
          currentUrl.includes("google.com/s2/favicons") &&
          img.naturalWidth <= 16 &&
          img.naturalHeight <= 16
        ) {
          setCandidateIndex((prev) => prev + 1);
        }
      }}
      onError={() => {
        setCandidateIndex((prev) => prev + 1);
      }}
    />
  );
}

export default OrganizationLogo;
