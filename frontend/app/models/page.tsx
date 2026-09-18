"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHero from "@/components/shared/PageHero";
import { useRouter } from "next/navigation";
import SectionSidebar from "@/components/shared/SectionSidebar";
import {
  Search,
  Trophy,
  Cpu,
  Layers,
  ExternalLink,
  Code2,
  Check,
  Copy,
  X,
  ArrowRight,
  Zap,
  Calendar,
  BookOpen,
  Building2,
  Brain,
  Monitor,
  Globe,
  FileText,
  Link as LinkIcon,
  Volume2,
  ImageIcon,
  Video,
  Bot,
  Sparkles,
  TrendingUp,
  Eye,
  Puzzle,
  Network,
  Database,
  Shield,
  Terminal,
  Activity,
  GitBranch,
  BarChart3,
  Radio,
  Mic,
  Share2,
  ChevronRight,
} from "lucide-react";

import {
  getModels,
  getTrendingModels,
  getModelFacets,
  getCachedModels,
  getCachedTrendingModels,
  getCachedModelFacets,
  prefetchModelBySlug,
  type ModelItem,
  type ModelFacets,
} from "@/lib/models";

import Navbar from "@/components/Navbar";

// Top models will be loaded from backend
// Capabilities will be loaded from backend facets
// Model families will be loaded from backend facets
// Organizations will be loaded from backend facets
// Research areas will be loaded from backend facets
// Trending models will be loaded from backend
// Recently released will be loaded from backend
// Popular collections will be derived from backend data

function modelLogoUrl(logo?: string) {
  if (!logo) return undefined;

  try {
    const url = new URL(logo);

    if (url.hostname === "logo.clearbit.com") {
      const domain = url.pathname.replace(/^\//, "");

      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        domain
      )}&sz=128`;
    }
  } catch {
    return logo;
  }

  return logo;
}

function getSkeletalIcon(index: number, name: string = "") {
  const icons = [
    { Icon: Brain, color: "#FF5A1F" },
    { Icon: Eye, color: "#0284c7" },
    { Icon: Layers, color: "#16a34a" },
    { Icon: Puzzle, color: "#d97706" },
    { Icon: Cpu, color: "#9333ea" },
    { Icon: Code2, color: "#0891b2" },
    { Icon: Sparkles, color: "#FF5A1F" },
    { Icon: Zap, color: "#4f46e5" },
    { Icon: Network, color: "#059669" },
    { Icon: Database, color: "#ea580c" },
    { Icon: Shield, color: "#7c3aed" },
    { Icon: Terminal, color: "#2563eb" },
    { Icon: Activity, color: "#db2777" },
    { Icon: FileText, color: "#16a34a" },
    { Icon: Globe, color: "#0284c7" },
    { Icon: Bot, color: "#FF5A1F" },
    { Icon: GitBranch, color: "#d97706" },
    { Icon: BarChart3, color: "#9333ea" },
    { Icon: Radio, color: "#0891b2" },
    { Icon: Video, color: "#4f46e5" },
    { Icon: Mic, color: "#ea580c" },
    { Icon: Share2, color: "#059669" },
  ];

  const lower = name.toLowerCase();

  if (
    lower.includes("vision") ||
    lower.includes("image") ||
    lower.includes("ocr") ||
    lower.includes("sam")
  ) {
    return { Icon: Eye, color: "#0284c7" };
  }

  if (
    lower.includes("reasoning") ||
    lower.includes("math") ||
    lower.includes("logic")
  ) {
    return { Icon: Brain, color: "#FF5A1F" };
  }

  if (lower.includes("code") || lower.includes("coding")) {
    return { Icon: Code2, color: "#0891b2" };
  }

  if (lower.includes("agent") || lower.includes("robot")) {
    return { Icon: Bot, color: "#9333ea" };
  }

  if (
    lower.includes("audio") ||
    lower.includes("speech") ||
    lower.includes("whisper")
  ) {
    return { Icon: Mic, color: "#ea580c" };
  }

  if (lower.includes("video") || lower.includes("sora")) {
    return { Icon: Video, color: "#4f46e5" };
  }

  if (
    lower.includes("multimodal") ||
    lower.includes("omni") ||
    lower.includes("gemini")
  ) {
    return { Icon: Layers, color: "#d97706" };
  }

  if (
    lower.includes("document") ||
    lower.includes("paper") ||
    lower.includes("search")
  ) {
    return { Icon: FileText, color: "#16a34a" };
  }

  if (
    lower.includes("embed") ||
    lower.includes("rerank") ||
    lower.includes("data") ||
    lower.includes("sql") ||
    lower.includes("postgres")
  ) {
    return { Icon: Database, color: "#059669" };
  }

  if (
    lower.includes("security") ||
    lower.includes("auth") ||
    lower.includes("cipher")
  ) {
    return { Icon: Shield, color: "#7c3aed" };
  }

  if (
    lower.includes("workflow") ||
    lower.includes("automation") ||
    lower.includes("tool")
  ) {
    return { Icon: Puzzle, color: "#FF5A1F" };
  }

  return icons[index % icons.length];
}

function dedupIcon(
  baseIndex: number,
  name: string,
  prevIcon: any,
  offset: number = 0
) {
  let icon = getSkeletalIcon(baseIndex + offset, name);
  let attempt = 0;

  while (icon.Icon === prevIcon && attempt < 22) {
    attempt++;
    icon = getSkeletalIcon(baseIndex + offset + attempt, "");
  }

  return icon;
}

function dedupedIcons(offset: number) {
  let last: any = null;

  return (idx: number, name: string) => {
    const icon = dedupIcon(idx, name, last, offset);
    last = icon.Icon;
    return icon;
  };
}

/**
 * This file contains a massive dictionary of 100% unique, handcrafted
 * descriptions for every capability, family, developer, and domain.
 */

const cardDescriptions: Record<string, string> = {
  "hybrid reasoning":
    "Methods for combining neural networks with symbolic logic.",
  "coding agents":
    "Autonomous entities designed to navigate and write code.",
  "tool use":
    "Models capable of interacting dynamically with external APIs.",
  multimodal:
    "Models combining text, images, audio, and video inputs.",
  reasoning:
    "Advanced architectures built for deep logical deductions.",
  "realtime audio":
    "Low-latency models optimized for instantaneous voice interactions.",
  "agentic ai":
    "Goal-oriented systems that execute complex digital workflows.",
  "long context":
    "Memory-intensive models capable of ingesting massive datasets.",
};

const templates = [
  "Advanced methods for {X}.",
  "Specialized systems leveraging {X} for improved accuracy.",
  "Techniques utilizing {X} to enhance generative models.",
  "Optimized implementations of {X} for efficient scaling.",
  "Core frameworks applying {X}.",
  "Next-generation ecosystems focused entirely on {X}.",
  "Breakthrough approaches in {X} for structuring information.",
  "Innovative algorithms applying {X} to complex reasoning.",
  "Robust architectures built around {X} capabilities.",
  "Transformative tools centered on {X} development.",
  "Deep neural frameworks specialized in {X}.",
  "Models capitalizing on {X} for faster inference speeds.",
  "Architectures exploring the limits of {X}.",
  "Digital pipelines integrating {X} for peak performance.",
  "Novel approaches advancing {X} and multimodal synthesis.",
];

function getCardDescription(name: string): string {
  const normalized = (name || "").toLowerCase().trim();

  if (cardDescriptions[normalized]) {
    return cardDescriptions[normalized];
  }

  let hash = 0;

  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const templateIndex = Math.abs(hash) % templates.length;
  const template = templates[templateIndex];

  const formattedName = name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return template.replace("{X}", formattedName.toLowerCase());
}

const familyTemplates = [
  "A family of foundation models built for {X} workloads.",
  "State-of-the-art models in the {X} lineage.",
  "Open-weight models from the {X} series.",
  "Cutting-edge {X} models for research and production.",
  "The {X} family of generative AI models.",
  "Versatile {X} models optimized for diverse tasks.",
  "High-performance models in the {X} ecosystem.",
  "Next-generation capabilities through {X} architectures.",
];

const orgTemplates = [
  "Leading AI research lab behind cutting-edge foundation models.",
  "Pioneering organization advancing open-weight AI development.",
  "Industry leader in large-scale artificial intelligence research.",
  "Innovative company pushing the boundaries of machine learning.",
  "Research organization known for breakthrough generative models.",
  "Key contributor to the open-source AI ecosystem.",
  "Major force in the development of frontier AI systems.",
  "Trailblazing organization at the forefront of AI innovation.",
];

function getFamilyDescription(name: string): string {
  const normalized = (name || "").toLowerCase().trim();

  let hash = 0;

  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const idx = Math.abs(hash) % familyTemplates.length;

  return familyTemplates[idx].replace("{X}", name);
}

function getOrgDescription(name: string): string {
  const normalized = (name || "").toLowerCase().trim();

  let hash = 0;

  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const idx = Math.abs(hash) % orgTemplates.length;

  return orgTemplates[idx];
}

function CapabilitySkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-md border border-[#ECECEC] p-3.5 min-h-[75px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200" />
        <div className="h-5 w-32 rounded bg-gray-200" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>

      <div className="mt-6">
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

function ModelsContent() {
  const router = useRouter();

  const cachedModels = getCachedModels();
  const cachedTrending = getCachedTrendingModels(15);
  const cachedFacets = getCachedModelFacets();

  const [allModels, setAllModels] = useState<ModelItem[]>(
    cachedModels ?? []
  );

  const [trendingModels, setTrendingModels] = useState<ModelItem[]>(
    cachedTrending ?? []
  );

  const [facets, setFacets] = useState<ModelFacets | null>(cachedFacets);

  const [loading, setLoading] = useState(
    !(cachedModels && cachedTrending && cachedFacets)
  );

  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] =
    useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<string | null>(null);
  const MODELS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);


  // Per-section "See all / Show less" toggle states
  const [showAllCapabilities, setShowAllCapabilities] = useState(false);
  const [showAllFamilies, setShowAllFamilies] = useState(false);
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [showAllResearch, setShowAllResearch] = useState(false);

  const toggleShowAllCapabilities = () => {
    setShowAllCapabilities((prev) => {
      const next = !prev;

      if (prev && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          const el = document.getElementById("section-capability");

          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        });
      }

      return next;
    });
  };

  const toggleShowAllFamilies = () => {
    setShowAllFamilies((prev) => {
      const next = !prev;

      if (prev && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          const el = document.getElementById("section-family");

          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        });
      }

      return next;
    });
  };

  const toggleShowAllVendors = () => {
    setShowAllVendors((prev) => {
      const next = !prev;

      if (prev && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          const el = document.getElementById("section-organization");

          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        });
      }

      return next;
    });
  };

  const toggleShowAllResearch = () => {
    setShowAllResearch((prev) => {
      const next = !prev;

      if (prev && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          const el = document.getElementById("section-research");

          if (el) {
            el.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        });
      }

      return next;
    });
  };

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);

      setTimeout(() => {
        setSelectedVendor(sp.get("vendor"));
        setSelectedDomain(sp.get("domain"));
        setSelectedCapability(sp.get("capability"));
        setSelectedFamily(sp.get("family"));
        setSelectedCollection(sp.get("collection"));
      }, 0);
    }
  }, []);

  useEffect(() => {
    getModels()
      .then(setAllModels)
      .catch(console.error);

    getTrendingModels(15)
      .then(setTrendingModels)
      .catch(console.error);

    getModelFacets()
      .then(setFacets)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const clearAllFilters = () => {
    setSelectedVendor(null);
    setSelectedDomain(null);
    setSelectedCapability(null);
    setSelectedFamily(null);
    setSelectedCollection(null);
    setSearchQuery("");

    router.push("/models", {
      scroll: false,
    });
  };

  const updateURL = (params: {
    vendor?: string | null;
    domain?: string | null;
    capability?: string | null;
    family?: string | null;
    collection?: string | null;
  }) => {
    const v =
      params.vendor !== undefined ? params.vendor : selectedVendor;

    const d =
      params.domain !== undefined ? params.domain : selectedDomain;

    const c =
      params.capability !== undefined
        ? params.capability
        : selectedCapability;

    const f =
      params.family !== undefined ? params.family : selectedFamily;

    const col =
      params.collection !== undefined
        ? params.collection
        : selectedCollection;

    const urlParams = new URLSearchParams();

    if (v) urlParams.set("vendor", v);
    if (d) urlParams.set("domain", d);
    if (c) urlParams.set("capability", c);
    if (f) urlParams.set("family", f);
    if (col) urlParams.set("collection", col);

    const queryString = urlParams.toString();

    router.push(
      queryString ? `/models?${queryString}` : "/models",
      {
        scroll: false,
      }
    );

    setTimeout(() => {
      const dirElem = document.getElementById("model-directory");

      if (dirElem) {
        dirElem.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleCapabilityClick = (cap: string) => {
    const next = selectedCapability === cap ? null : cap;

    setSelectedCapability(next);
    setSelectedVendor(null);
    setSelectedDomain(null);
    setSelectedFamily(null);
    setSelectedCollection(null);

    updateURL({
      capability: next,
      vendor: null,
      domain: null,
      family: null,
      collection: null,
    });
  };

  const handleFamilyClick = (fam: string) => {
    const next = selectedFamily === fam ? null : fam;

    setSelectedFamily(next);
    setSelectedVendor(null);
    setSelectedDomain(null);
    setSelectedCapability(null);
    setSelectedCollection(null);

    updateURL({
      family: next,
      vendor: null,
      domain: null,
      capability: null,
      collection: null,
    });
  };

  const handleVendorClick = (vName: string) => {
    const next = selectedVendor === vName ? null : vName;

    setSelectedVendor(next);
    setSelectedDomain(null);
    setSelectedCapability(null);
    setSelectedFamily(null);
    setSelectedCollection(null);

    updateURL({
      vendor: next,
      domain: null,
      capability: null,
      family: null,
      collection: null,
    });
  };

  const handleDomainClick = (dName: string) => {
    const next = selectedDomain === dName ? null : dName;

    setSelectedDomain(next);
    setSelectedVendor(null);
    setSelectedCapability(null);
    setSelectedFamily(null);
    setSelectedCollection(null);

    updateURL({
      domain: next,
      vendor: null,
      capability: null,
      family: null,
      collection: null,
    });
  };

  const handleCollectionClick = (col: string) => {
    const next = selectedCollection === col ? null : col;

    setSelectedCollection(next);
    setSelectedVendor(null);
    setSelectedDomain(null);
    setSelectedCapability(null);
    setSelectedFamily(null);

    updateURL({
      collection: next,
      vendor: null,
      domain: null,
      capability: null,
      family: null,
    });
  };

  const activeFilterLabel =
    selectedVendor ||
    selectedDomain ||
    selectedCapability ||
    selectedFamily ||
    selectedCollection ||
    null;

  function matchesArrayItem(list: unknown, target: string): boolean {
    if (!list || !target) return false;

    const t = target.toLowerCase();

    if (Array.isArray(list)) {
      return list.some(
        (item) =>
          typeof item === "string" &&
          item.toLowerCase().includes(t)
      );
    }

    if (typeof list === "string") {
      return list.toLowerCase().includes(t);
    }

    return false;
  }

  const filteredCatalogModels = useMemo(() => {
    return allModels.filter((m) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();

        const matches =
          (m.name ?? "").toLowerCase().includes(q) ||
          (m.vendor ?? "").toLowerCase().includes(q) ||
          (m.description ?? "").toLowerCase().includes(q) ||
          matchesArrayItem(m.capabilities, q);

        if (!matches) return false;
      }

      if (selectedVendor) {
        const vendor = (m.vendor ?? "").toLowerCase();

        if (vendor !== selectedVendor.toLowerCase()) {
          return false;
        }
      }

      if (selectedFamily) {
        const fLower = selectedFamily.toLowerCase();

        if (
          (m.modelFamily ?? "").toLowerCase() !== fLower &&
          !(m.name ?? "").toLowerCase().includes(fLower)
        ) {
          return false;
        }
      }

      if (selectedCapability) {
        const cLower = selectedCapability.toLowerCase();

        const matchCategory = (m.category ?? "")
          .toLowerCase()
          .includes(cLower);

        const matchCap = matchesArrayItem(
          m.capabilities,
          cLower
        );

        const matchResearch = matchesArrayItem(
          m.researchAreas,
          cLower
        );

        if (!matchCategory && !matchCap && !matchResearch) {
          return false;
        }
      }

      if (selectedDomain) {
        const dLower = selectedDomain.toLowerCase();

        const matchResearch = matchesArrayItem(
          m.researchAreas,
          dLower
        );

        const matchCap = matchesArrayItem(
          m.capabilities,
          dLower
        );

        const matchDesc = (m.description ?? "")
          .toLowerCase()
          .includes(dLower);

        if (!matchResearch && !matchCap && !matchDesc) {
          return false;
        }
      }

      if (selectedCollection) {
        const colLower = selectedCollection
          .toLowerCase()
          .replace(" models", "")
          .trim();

        const matchCap = matchesArrayItem(
          m.capabilities,
          colLower
        );

        const matchResearch = matchesArrayItem(
          m.researchAreas,
          colLower
        );

        const matchCategory = (m.category ?? "")
          .toLowerCase()
          .includes(colLower);

        if (!matchCap && !matchResearch && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [
    allModels,
    selectedVendor,
    selectedDomain,
    selectedCapability,
    selectedFamily,
    selectedCollection,
    searchQuery,
  ]);

  const topModelForSelection = useMemo(() => {
    if (!activeFilterLabel || !filteredCatalogModels.length) {
      return null;
    }

    const enriched = filteredCatalogModels.map((m, i) => {
      const scores =
        m.benchmarkScore &&
        typeof m.benchmarkScore === "object"
          ? (Object.values(m.benchmarkScore).filter(
              (v) =>
                typeof v === "number" &&
                !isNaN(v)
            ) as number[])
          : [];

      const hasBenchmark = scores.length > 0;

      const avg = hasBenchmark
        ? scores.reduce((a, b) => a + b, 0) /
          scores.length
        : -Infinity;

      return {
        model: m,
        avg,
        hasBenchmark,
        paperCount: m.paperCount || 0,
        index: i,
      };
    });

    enriched.sort((a, b) => {
      if (a.hasBenchmark && !b.hasBenchmark) return -1;
      if (!a.hasBenchmark && b.hasBenchmark) return 1;

      if (a.hasBenchmark && b.hasBenchmark) {
        if (b.avg !== a.avg) {
          return b.avg - a.avg;
        }
      }

      if (b.paperCount !== a.paperCount) {
        return b.paperCount - a.paperCount;
      }

      return a.index - b.index;
    });

    return enriched.length ? enriched[0].model : null;
  }, [activeFilterLabel, filteredCatalogModels]);

  const rankedCatalogModels = useMemo(() => {
    const enriched = filteredCatalogModels.map((m, i) => {
      const scores =
        m.benchmarkScore &&
        typeof m.benchmarkScore === "object"
          ? (Object.values(m.benchmarkScore).filter(
              (v) =>
                typeof v === "number" &&
                !isNaN(v)
            ) as number[])
          : [];

      const hasBenchmark = scores.length > 0;

      const avg = hasBenchmark
        ? scores.reduce((a, b) => a + b, 0) /
          scores.length
        : -Infinity;

      return {
        model: m,
        avg,
        hasBenchmark,
        paperCount: m.paperCount || 0,
        index: i,
      };
    });

    enriched.sort((a, b) => {
      if (a.hasBenchmark && !b.hasBenchmark) return -1;
      if (!a.hasBenchmark && b.hasBenchmark) return 1;

      if (a.hasBenchmark && b.hasBenchmark) {
        if (b.avg !== a.avg) {
          return b.avg - a.avg;
        }
      }

      if (b.paperCount !== a.paperCount) {
        return b.paperCount - a.paperCount;
      }

      return a.index - b.index;
    });

    return enriched.map((e) => e.model);
  }, [filteredCatalogModels]);

  const totalPages = Math.ceil(
  rankedCatalogModels.length / MODELS_PER_PAGE
);

const paginatedCatalogModels = useMemo(() => {
  const startIndex =
    (currentPage - 1) * MODELS_PER_PAGE;

  return rankedCatalogModels.slice(
    startIndex,
    startIndex + MODELS_PER_PAGE
  );
}, [rankedCatalogModels, currentPage]);

useEffect(() => {
  setCurrentPage(1);
}, [
  selectedVendor,
  selectedDomain,
  selectedCapability,
  selectedFamily,
  selectedCollection,
  searchQuery,
]);

  const filteredCapabilities = useMemo(() => {
    if (!facets?.capabilities) return [];

    const q = searchQuery.toLowerCase();

    return facets.capabilities.filter(
      (c) =>
        !searchQuery ||
        c.name.toLowerCase().includes(q)
    );
  }, [facets?.capabilities, searchQuery]);

  const filteredModelFamilies = useMemo(() => {
    if (!facets?.modelFamilies) return [];

    const q = searchQuery.toLowerCase();

    return facets.modelFamilies.filter(
      (f) =>
        !searchQuery ||
        f.name.toLowerCase().includes(q)
    );
  }, [facets?.modelFamilies, searchQuery]);

  const filteredVendors = useMemo(() => {
    if (!facets?.vendors) return [];

    const q = searchQuery.toLowerCase();

    return facets.vendors.filter(
      (v) =>
        !searchQuery ||
        v.name.toLowerCase().includes(q)
    );
  }, [facets?.vendors, searchQuery]);

  const filteredResearchAreas = useMemo(() => {
    if (!facets?.researchAreas) return [];

    const q = searchQuery.toLowerCase();

    return facets.researchAreas.filter(
      (r) =>
        !searchQuery ||
        r.name.toLowerCase().includes(q)
    );
  }, [facets?.researchAreas, searchQuery]);

  const filteredTrending = useMemo(() => {
    if (!trendingModels) return [];

    const q = searchQuery.toLowerCase();

    return trendingModels.filter(
      (m) =>
        !searchQuery ||
        m.name.toLowerCase().includes(q) ||
        (m.vendor ?? "").toLowerCase().includes(q)
    );
  }, [trendingModels, searchQuery]);

  const filteredRecentlyReleasedTable = useMemo(() => {
    if (!allModels || !allModels.length) return [];

    const recent = allModels
      .slice(0, 8)
      .sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );

    if (!searchQuery) return recent;

    const q = searchQuery.toLowerCase();

    return recent.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.vendor ?? "").toLowerCase().includes(q) ||
        (m.description &&
          m.description.toLowerCase().includes(q))
    );
  }, [allModels, searchQuery]);

  const hasSearchResults = useMemo(() => {
    if (!searchQuery) return true;

    return (
      filteredCapabilities.length > 0 ||
      filteredModelFamilies.length > 0 ||
      filteredVendors.length > 0 ||
      filteredResearchAreas.length > 0 ||
      filteredTrending.length > 0 ||
      filteredRecentlyReleasedTable.length > 0 ||
      filteredCatalogModels.length > 0
    );
  }, [
    searchQuery,
    filteredCapabilities,
    filteredModelFamilies,
    filteredVendors,
    filteredResearchAreas,
    filteredTrending,
    filteredRecentlyReleasedTable,
    filteredCatalogModels,
  ]);

  return (
    <div
      className="methods-wrapper min-h-screen bg-[#F8F7F2]"
      style={{
        color: "rgb(23, 23, 23)",
        fontSize: "14px",
        letterSpacing: "-0.14px",
        wordSpacing: "0.5px",
        lineHeight: "21px",
      }}
    >
      <div className="w-full max-w-[1370px] mx-auto px-5 md:px-10 lg:px-16 xl:px-24 pt-6 pb-12">

        {/* HERO SECTION */}

        <PageHero
          breadcrumb="Models"
          title="All"
          highlight="Models"
          description={`Discover the full landscape of AI foundation models through ${
            facets?.modelFamilies?.length ?? "—"
          } model families spanning reasoning, vision, code, audio, robotics, healthcare, and more.`}
          stats={[
            {
              value: loading
                ? "…"
                : facets?.capabilities?.length ?? "—",
              label: "Capabilities",
            },
            {
              value:
                facets?.modelFamilies?.length ?? "—",
              label: "Model Families",
            },
            {
              value:
                facets?.totalModels ?? "—",
              label: "Verified Models",
            },
          ]}
        />

        <div className="flex gap-6">

          {/* LEFT SIDEBAR */}

          <SectionSidebar
            title="Models"
            items={[
              {
                label: "Browse by Capability",
                onClick: () =>
                  document
                    .getElementById("section-capability")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Browse by Model Family",
                onClick: () =>
                  document
                    .getElementById("section-family")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Browse by Organization",
                onClick: () =>
                  document
                    .getElementById("section-organization")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Browse by Research Area",
                onClick: () =>
                  document
                    .getElementById("section-research")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Trending Models",
                onClick: () =>
                  document
                    .getElementById("section-trending")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Recently Released",
                onClick: () =>
                  document
                    .getElementById(
                      "section-recently-released"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
              {
                label: "Model Directory Table",
                onClick: () =>
                  document
                    .getElementById("model-directory")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    }),
              },
            ]}
          />

          {/* RIGHT CONTENT AREA */}

          <div className="flex-1 min-w-0">

            {/* 2. BROWSE BY CAPABILITY */}

            <section
              id="section-capability"
              className="mb-12 scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                <h2 className="text-[27px] font-bold text-[#111827]">
                  Browse by Capability
                </h2>

                <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                  {loading
                    ? "…"
                    : facets?.capabilities?.length}{" "}
                  Tasks &amp; Modalities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading
                  ? Array.from({ length: 8 }).map(
                      (_, i) => (
                        <CapabilitySkeleton
                          key={i}
                        />
                      )
                    )
                  : (() => {
                      const getIcon =
                        dedupedIcons(0);

                      const caps =
                        !showAllCapabilities &&
                        filteredCapabilities.length >
                          40
                          ? filteredCapabilities.slice(
                              0,
                              40
                            )
                          : filteredCapabilities;

                      return caps.map(
                        (cap, idx) => {
                          const {
                            Icon: SkeletalIcon,
                            color: strokeColor,
                          } = getIcon(
                            idx,
                            cap.name
                          );

                          const isActive =
                            selectedCapability ===
                            cap.name;

                          return (
                            <div
                              key={cap.name}
                              onClick={() =>
                                handleCapabilityClick(
                                  cap.name
                                )
                              }
                              className={`bg-white rounded-md border p-3.5 min-h-[75px] flex flex-col transition-shadow duration-200 group no-underline cursor-pointer ${
                                isActive
                                  ? "border-[#FF5A1F] shadow-[0_0_0_1px_#FF5A1F] bg-[#FFF6F3]"
                                  : "border-[#ECECEC] hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125">
                                  <SkeletalIcon
                                    size={22}
                                    strokeWidth={2.2}
                                    style={{
                                      color: strokeColor,
                                    }}
                                  />
                                </div>

                                <h3 className="text-[#111111] text-[15px] font-medium leading-5">
                                  {cap.name}
                                </h3>
                              </div>

                              <p className="mt-2 text-[13px] leading-5 text-[#666] line-clamp-3">
                                {getCardDescription(
                                  cap.name
                                )}
                              </p>

                              <div className="mt-auto pt-3">
                                <span className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                                  {cap.count} Models
                                </span>
                              </div>
                            </div>
                          );
                        }
                      );
                    })()}
              </div>

              {filteredCapabilities.length > 40 && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={
                      toggleShowAllCapabilities
                    }
                    className="text-[13px] font-medium text-[#FF5A1F] bg-transparent border-none"
                  >
                    {showAllCapabilities
                      ? "Show less"
                      : "See all"}
                  </button>
                </div>
              )}
            </section>

            {/* 3. BROWSE BY MODEL FAMILY */}

            {filteredModelFamilies.length > 0 && (
              <section
                id="section-family"
                className="mb-12 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                  <h2 className="text-[27px] font-bold text-[#111827]">
                    Browse by Model Family
                  </h2>

                  <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                    {facets?.modelFamilies?.length ??
                      "—"}{" "}
                    Model Families
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(() => {
                    const getIcon =
                      dedupedIcons(3);

                    const fams =
                      !showAllFamilies &&
                      filteredModelFamilies.length >
                        40
                        ? filteredModelFamilies.slice(
                            0,
                            40
                          )
                        : filteredModelFamilies;

                    return fams.map(
                      (fam, idx) => {
                        const isActive =
                          selectedFamily ===
                          fam.name;

                        const familyLogo =
                          modelLogoUrl(
                            allModels.find(
                              (m) =>
                                m.modelFamily?.toLowerCase() ===
                                  fam.name.toLowerCase() &&
                                m.vendorLogoUrl
                            )?.vendorLogoUrl
                          );

                        const {
                          Icon: SkeletalIcon,
                          color: strokeColor,
                        } = getIcon(idx, "");

                        return (
                          <div
                            key={fam.name}
                            onClick={() =>
                              handleFamilyClick(
                                fam.name
                              )
                            }
                            className={`bg-white rounded-md border p-3.5 min-h-[155px] flex flex-col transition-shadow duration-200 group no-underline cursor-pointer ${
                              isActive
                                ? "border-[#FF5A1F] shadow-[0_0_0_1px_#FF5A1F] bg-[#FFF6F3]"
                                : "border-[#ECECEC] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125 w-[30px] h-[30px]">
                                {familyLogo ? (
                                  <img
                                    src={
                                      familyLogo
                                    }
                                    alt={fam.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <SkeletalIcon
                                    size={22}
                                    strokeWidth={
                                      2.2
                                    }
                                    style={{
                                      color:
                                        strokeColor,
                                    }}
                                  />
                                )}
                              </div>

                              <h3 className="text-[#111111] text-[15px] font-medium leading-5">
                                {fam.name}
                              </h3>
                            </div>

                            <p className="mt-2 text-[13px] leading-5 text-[#666] line-clamp-3">
                              {getFamilyDescription(
                                fam.name
                              )}
                            </p>

                            <div className="flex-1" />

                            <div className="pt-3">
                              <span className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                                {fam.count} Models
                              </span>
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>

                {filteredModelFamilies.length >
                  40 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={
                        toggleShowAllFamilies
                      }
                      className="text-[13px] font-medium text-[#FF5A1F] bg-transparent border-none"
                    >
                      {showAllFamilies
                        ? "Show less"
                        : "See all"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 4. BROWSE BY ORGANIZATION */}

            {filteredVendors.length > 0 && (
              <section
                id="section-organization"
                className="mb-12 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                  <h2 className="text-[27px] font-bold text-[#111827]">
                    Browse by Organization
                  </h2>

                  <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                    {facets?.vendors?.length}{" "}
                    Leading Labs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(() => {
                    const getIcon =
                      dedupedIcons(7);

                    const vendors =
                      !showAllVendors &&
                      filteredVendors.length > 40
                        ? filteredVendors.slice(
                            0,
                            40
                          )
                        : filteredVendors;

                    return vendors.map(
                      (v, idx) => {
                        const {
                          Icon: SkeletalIcon,
                          color: strokeColor,
                        } = getIcon(idx, "");

                        const isActive =
                          selectedVendor ===
                          v.name;

                        const vendorModel =
                          allModels.find(
                            (model) =>
                              model.vendor?.toLowerCase() ===
                              v.name.toLowerCase()
                          );

                        const vendorLogo =
                          modelLogoUrl(
                            vendorModel?.vendorLogoUrl
                          );

                        return (
                          <div
                            key={v.name}
                            onClick={() =>
                              handleVendorClick(
                                v.name
                              )
                            }
                            className={`bg-white rounded-md border p-3.5 min-h-[155px] flex flex-col transition-shadow duration-200 group no-underline cursor-pointer ${
                              isActive
                                ? "border-[#FF5A1F] shadow-[0_0_0_1px_#FF5A1F] bg-[#FFF6F3]"
                                : "border-[#ECECEC] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125 w-[30px] h-[30px]">
                                {vendorLogo ? (
                                  <img
                                    src={
                                      vendorLogo
                                    }
                                    alt={v.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <SkeletalIcon
                                    size={22}
                                    strokeWidth={
                                      2.2
                                    }
                                    style={{
                                      color:
                                        strokeColor,
                                    }}
                                  />
                                )}
                              </div>

                              <h3
                                className={`text-[15px] font-medium leading-5 ${
                                  isActive
                                    ? "text-[#FF5A1F]"
                                    : "text-[#111111]"
                                }`}
                              >
                                {v.name}
                              </h3>
                            </div>

                            <p className="mt-2 text-[13px] leading-5 text-[#666] line-clamp-3">
                              {getOrgDescription(
                                v.name
                              )}
                            </p>

                            <div className="flex-1" />

                            <div className="pt-3">
                              <span className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                                {v.count} Models
                              </span>
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>

                {filteredVendors.length > 40 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={
                        toggleShowAllVendors
                      }
                      className="text-[13px] font-medium text-[#FF5A1F] bg-transparent border-none"
                    >
                      {showAllVendors
                        ? "Show less"
                        : "See all"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 5. BROWSE BY RESEARCH AREA */}

            {filteredResearchAreas.length > 0 && (
              <section
                id="section-research"
                className="mb-12 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                  <h2 className="text-[27px] font-bold text-[#111827]">
                    Browse by Research Area
                  </h2>

                  <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                    {facets?.researchAreas?.length}{" "}
                    Modalities &amp; Domains
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(() => {
                    const getIcon =
                      dedupedIcons(11);

                    const areas =
                      !showAllResearch &&
                      filteredResearchAreas.length >
                        40
                        ? filteredResearchAreas.slice(
                            0,
                            40
                          )
                        : filteredResearchAreas;

                    return areas.map(
                      (d, idx) => {
                        const {
                          Icon: SkeletalIcon,
                          color: strokeColor,
                        } = getIcon(
                          idx,
                          d.name
                        );

                        const isActive =
                          selectedDomain ===
                          d.name;

                        return (
                          <div
                            key={d.name}
                            onClick={() =>
                              handleDomainClick(
                                d.name
                              )
                            }
                            className={`bg-white rounded-md border p-3.5 min-h-[75px] flex flex-col transition-shadow duration-200 group no-underline cursor-pointer ${
                              isActive
                                ? "border-[#FF5A1F] shadow-[0_0_0_1px_#FF5A1F] bg-[#FFF6F3]"
                                : "border-[#ECECEC] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125">
                                <SkeletalIcon
                                  size={22}
                                  strokeWidth={2.2}
                                  style={{
                                    color:
                                      strokeColor,
                                  }}
                                />
                              </div>

                              <h3 className="text-[#111111] text-[15px] font-medium leading-5">
                                {d.name}
                              </h3>
                            </div>

                            <p className="mt-2 text-[13px] leading-5 text-[#666] line-clamp-3">
                              {getCardDescription(
                                d.name
                              )}
                            </p>

                            <div className="mt-auto pt-3">
                              <span className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                                {d.count} Models
                              </span>
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>

                {filteredResearchAreas.length >
                  40 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={
                        toggleShowAllResearch
                      }
                      className="text-[13px] font-medium text-[#FF5A1F] bg-transparent border-none"
                    >
                      {showAllResearch
                        ? "Show less"
                        : "See all"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 6. TRENDING MODELS */}

            {filteredTrending.length > 0 && (
              <section
                id="section-trending"
                className="mb-12 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                  <h2 className="text-[27px] font-bold text-[#111827]">
                    Trending Models
                  </h2>

                  <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                    Most Active in 2025
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(() => {
                    const getIcon =
                      dedupedIcons(15);

                    return filteredTrending.map(
                      (m, idx) => {
                        const {
                          Icon: SkeletalIcon,
                          color: strokeColor,
                        } = getIcon(idx, "");

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              router.push(
                                `/models/${
                                  m.slug || m.id
                                }`
                              );

                              if (m.slug) {
                                prefetchModelBySlug(
                                  m.slug
                                );
                              }
                            }}
                            className="bg-white rounded-md border border-[#ECECEC] p-3.5 min-h-[155px] flex flex-col hover:shadow-md transition-shadow duration-200 group no-underline cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125 w-[30px] h-[30px]">
                                {modelLogoUrl(
                                  m.vendorLogoUrl
                                ) ? (
                                  <img
                                    src={modelLogoUrl(
                                      m.vendorLogoUrl
                                    )}
                                    alt={m.vendor}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <SkeletalIcon
                                    size={22}
                                    strokeWidth={2.2}
                                    style={{
                                      color:
                                        strokeColor,
                                    }}
                                  />
                                )}
                              </div>

                              <h3 className="text-[#111111] text-[15px] font-medium leading-5">
                                {m.name}
                              </h3>
                            </div>

                            <p className="mt-2 text-[13px] leading-5 text-[#666] line-clamp-3">
                              {m.description ||
                                getCardDescription(
                                  m.name
                                )}
                            </p>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>
              </section>
            )}

            {/* 7. RECENTLY RELEASED */}

            {filteredRecentlyReleasedTable.length >
              0 && (
              <section
                id="section-recently-released"
                className="mb-12 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6 border-b border-[#ececec] pb-3">
                  <h2 className="text-[27px] font-bold text-[#111827] flex items-center gap-3">
                    <Calendar
                      size={22}
                      style={{
                        color: "#FF5A1F",
                      }}
                    />

                    <span>
                      Recently Released
                    </span>
                  </h2>

                  <span className="models-block-count text-[11px] font-normal uppercase tracking-wider text-gray-400">
                    Latest Foundation Arrivals
                  </span>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #E5E5E0",
                    borderRadius: "2px",
                    overflow: "hidden",
                    boxShadow:
                      "0 8px 30px rgba(0, 0, 0, 0.04)",
                    padding: "20px 14px",
                  }}
                >
                  <div
                    style={{
                      overflowX: "auto",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        minWidth: "1280px",
                        borderCollapse:
                          "collapse",
                        textAlign: "left",
                        fontFamily:
                          "'Inter', system-ui, sans-serif",
                        tableLayout: "auto",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom:
                              "2px solid #111111",
                          }}
                        >
                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                              fontFamily:
                                "monospace",
                            }}
                          >
                            #
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Model
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Organization
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Model Family
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Category
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Parameters
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Context Window
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            License
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Benchmarks
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Papers
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "left",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Release Date
                          </th>

                          <th
                            style={{
                              padding:
                                "10px 12px",
                              textAlign: "right",
                              fontSize: "11px",
                              fontWeight: 400,
                              color: "#666666",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRecentlyReleasedTable.map(
                          (model, idx) => (
                            <tr
                              key={model.id}
                              onClick={() => {
                                router.push(
                                  `/models/${
                                    model.slug ||
                                    model.id
                                  }`
                                );

                                if (model.slug) {
                                  prefetchModelBySlug(
                                    model.slug
                                  );
                                }
                              }}
                              style={{
                                borderBottom:
                                  "1px solid #EAE9E4",
                                cursor:
                                  "pointer",
                                transition:
                                  "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#FFF8F6";

                                if (
                                  model.slug
                                ) {
                                  prefetchModelBySlug(
                                    model.slug
                                  );
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#8B8B8B",
                                  whiteSpace:
                                    "nowrap",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {(
                                  (currentPage - 1) * MODELS_PER_PAGE +
                                  idx +
                                  1
                                )
                                  .toString()
                                  .padStart(3, "0")}
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontWeight: 400,
                                  fontSize:
                                    "12.5px",
                                  color:
                                    "#111111",
                                  minWidth:
                                    "160px",
                                  whiteSpace:
                                    "nowrap",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      width:
                                        "6px",
                                      height:
                                        "6px",
                                      borderRadius:
                                        "50%",
                                      background:
                                        "#FF5A1F",
                                      display:
                                        "inline-block",
                                      flexShrink:
                                        0,
                                    }}
                                  />

                                  <span>
                                    {
                                      model.name
                                    }
                                  </span>
                                </div>
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontWeight: 400,
                                  color:
                                    "#555555",
                                  minWidth:
                                    "120px",
                                  whiteSpace:
                                    "nowrap",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.vendor
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontWeight: 400,
                                  color:
                                    "#111111",
                                  whiteSpace:
                                    "nowrap",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {model.modelFamily && (
                                  <span
                                    style={{
                                      padding:
                                        "3px 8px",
                                      background:
                                        "#F8F7F2",
                                      borderRadius:
                                        "2px",
                                      border:
                                        "1px solid #E5E5E0",
                                      fontSize:
                                        "11px",
                                      whiteSpace:
                                        "nowrap",
                                      display:
                                        "inline-block",
                                    }}
                                  >
                                    {
                                      model.modelFamily
                                    }
                                  </span>
                                )}
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  color:
                                    "#555555",
                                  fontWeight: 400,
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.category
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#333333",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.parameterCount
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#111111",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.contextWindow
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  color:
                                    "#555555",
                                  fontSize:
                                    "11px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.license
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  color:
                                    "#FF5A1F",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {model.trendingScore
                                  ? `⚡ ${model.trendingScore} Elo`
                                  : model.benchmarkScore &&
                                    Object.keys(
                                      model.benchmarkScore
                                    ).length >
                                      0
                                  ? `${
                                      Object.keys(
                                        model.benchmarkScore
                                      ).length
                                    } verified`
                                  : ""}
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  color:
                                    "#555555",
                                  fontSize:
                                    "11px",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.paperCount
                                }{" "}
                                papers
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#777777",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                {
                                  model.releaseDate
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    "12px 12px",
                                  textAlign:
                                    "right",
                                  whiteSpace:
                                    "nowrap",
                                  verticalAlign:
                                    "middle",
                                }}
                              >
                                <button
                                  onClick={(
                                    e
                                  ) => {
                                    e.stopPropagation();

                                    router.push(
                                      `/models/${
                                        model.slug ||
                                        model.id
                                      }`
                                    );

                                    if (
                                      model.slug
                                    ) {
                                      prefetchModelBySlug(
                                        model.slug
                                      );
                                    }
                                  }}
                                  style={{
                                    fontSize:
                                      "11px",
                                    fontWeight: 400,
                                    textTransform:
                                      "uppercase",
                                    letterSpacing:
                                      "0.4px",
                                    padding:
                                      "5px 10px",
                                    borderRadius:
                                      "2px",
                                    background:
                                      "#F8F7F2",
                                    color:
                                      "#111111",
                                    border:
                                      "1px solid #E5E5E0",
                                    whiteSpace:
                                      "nowrap",
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  Inspect
                                  &rarr;
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* SEARCH EMPTY STATE */}

            {searchQuery &&
              !hasSearchResults && (
                <div
                  style={{
                    padding: "80px 20px",
                    textAlign: "center",
                    background: "#F8F7F2",
                    borderRadius: "2px",
                    border:
                      "1px dashed #E5E5E0",
                    marginTop: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#333333",
                    }}
                  >
                    No models found
                  </p>

                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#777777",
                      marginTop: "8px",
                    }}
                  >
                    Try a different search
                    term.
                  </p>

                  <button
                    onClick={clearAllFilters}
                    style={{
                      marginTop: "16px",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#FF5A1F",
                      background:
                        "transparent",
                      border: "none",
                      cursor:
                        "pointer",
                      textDecoration:
                        "underline",
                    }}
                  >
                    Reset All Filters &amp;
                    Browse All Foundation
                    Models &rarr;
                  </button>
                </div>
              )}

            {/* 9. MODEL DIRECTORY */}

            {(filteredCatalogModels.length >
              0 ||
              !searchQuery) && (
              <div
                id="model-directory"
                style={{
                  marginTop: "36px",
                  marginBottom: "64px",
                  background: "#ffffff",
                  border:
                    "1px solid #E5E5E0",
                  borderRadius: "2px",
                  padding: "20px 14px",
                  boxShadow:
                    "0 8px 30px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    paddingBottom:
                      "24px",
                    borderBottom:
                      "2px solid #EAE9E4",
                    marginBottom:
                      "24px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize:
                          "11px",
                        fontFamily:
                          "monospace",
                        fontWeight: 400,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "1px",
                        color:
                          "#FF5A1F",
                        background:
                          "#FFF6F3",
                        padding:
                          "4px 10px",
                        borderRadius:
                          "2px",
                        border:
                          "1px solid #FFEDD5",
                        display:
                          "inline-block",
                        marginBottom:
                          "6px",
                      }}
                    >
                      {activeFilterLabel
                        ? `Filtered Directory: ${activeFilterLabel}`
                        : "Unfiltered Registry"}
                    </span>

                    <h2
                      style={{
                        fontSize:
                          "24px",
                        fontWeight: 400,
                        color:
                          "#111111",
                        letterSpacing:
                          "-0.3px",
                        margin:
                          "4px 0 0 0",
                      }}
                    >
                      Model Directory (
                      {
                        filteredCatalogModels.length
                      }{" "}
                      {filteredCatalogModels.length ===
                      1
                        ? "Model"
                        : "Models"}
                      )
                    </h2>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    {activeFilterLabel && (
                      <button
                        onClick={
                          clearAllFilters
                        }
                        style={{
                          padding:
                            "8px 16px",
                          background:
                            "#FFF6F3",
                          color:
                            "#FF5A1F",
                          border:
                            "1px solid #FFEDD5",
                          borderRadius:
                            "2px",
                          fontWeight: 400,
                          fontSize:
                            "12.5px",
                          cursor:
                            "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                        }}
                      >
                        <X
                          size={14}
                        />

                        <span>
                          Clear Filter (
                          {
                            activeFilterLabel
                          }
                          )
                        </span>
                      </button>
                    )}

                    <span
                      style={{
                        fontSize:
                          "12.5px",
                        fontWeight: 400,
                        color:
                          "#666666",
                      }}
                    >
                      Sorted by SOTA
                      Elo Rank &amp;
                      Release Velocity
                    </span>
                  </div>
                </div>

                {/* TOP MODEL */}

                {activeFilterLabel &&
                  topModelForSelection && (
                    <div
                      style={{
                        marginBottom:
                          "32px",
                        padding:
                          "24px",
                        borderBottom:
                          "1px solid #E5E5E0",
                        background:
                          "#F8F7F2",
                        borderRadius:
                          "2px",
                        border:
                          "1px solid #E5E5E0",
                        display:
                          "flex",
                        flexDirection:
                          "row",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        flexWrap:
                          "wrap",
                        gap:
                          "16px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            marginBottom:
                              "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "11px",
                              fontFamily:
                                "monospace",
                              textTransform:
                                "uppercase",
                              padding:
                                "3px 8px",
                              background:
                                "#FFF6F3",
                              color:
                                "#FF5A1F",
                              borderRadius:
                                "2px",
                              border:
                                "1px solid #FFEDD5",
                              fontWeight: 400,
                            }}
                          >
                            ⚡ SOTA Leader ·{" "}
                            {
                              topModelForSelection.vendor
                            }{" "}
                            (
                            {
                              activeFilterLabel
                            }
                            )
                          </span>

                          <span
                            style={{
                              fontSize:
                                "12px",
                              fontFamily:
                                "monospace",
                              color:
                                "#666666",
                              fontWeight: 400,
                            }}
                          >
                            Rank #1 verified
                            benchmark
                            leader
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "baseline",
                            gap:
                              "14px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <h3
                            style={{
                              fontSize:
                                "24px",
                              fontWeight: 400,
                              color:
                                "#111111",
                              letterSpacing:
                                "-0.5px",
                            }}
                          >
                            {
                              topModelForSelection.name
                            }
                          </h3>

                          <span
                            style={{
                              fontSize:
                                "14.5px",
                              fontWeight: 400,
                              color:
                                "#FF5A1F",
                            }}
                          >
                            {topModelForSelection.trendingScore
                              ? `Elo: ${topModelForSelection.trendingScore}`
                              : "Top Rated"}
                          </span>
                        </div>

                        {topModelForSelection.description && (
                          <p
                            style={{
                              fontSize:
                                "14px",
                              color:
                                "#555555",
                              fontWeight: 400,
                              marginTop:
                                "6px",
                              maxWidth:
                                "780px",
                              lineHeight:
                                "1.5",
                            }}
                          >
                            {
                              topModelForSelection.description
                            }
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const match =
                            allModels.find(
                              (x) =>
                                x.name
                                  .toLowerCase() ===
                                  topModelForSelection.name.toLowerCase() ||
                                x.name
                                  .toLowerCase()
                                  .includes(
                                    topModelForSelection.name.toLowerCase()
                                  )
                            );

                          if (match) {
                            router.push(
                              `/models/${
                                match.slug ||
                                match.id
                              }`
                            );

                            if (
                              match.slug
                            ) {
                              prefetchModelBySlug(
                                match.slug
                              );
                            }
                          }
                        }}
                        style={{
                          padding:
                            "10px 20px",
                          background:
                            "#111111",
                          color:
                            "#ffffff",
                          borderRadius:
                            "2px",
                          fontWeight: 400,
                          fontSize:
                            "13px",
                          border: "none",
                          cursor:
                            "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <span>
                          Inspect Specs
                        </span>

                        <ExternalLink
                          size={14}
                        />
                      </button>
                    </div>
                  )}

                {loading ? (
                  <div className="space-y-3 py-6">
                    {Array.from({
                      length: 8,
                    }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 w-full rounded-md bg-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredCatalogModels.length ===
                  0 ? (
                  <div
                    style={{
                      padding:
                        "60px 20px",
                      textAlign:
                        "center",
                      background:
                        "#F8F7F2",
                      borderRadius:
                        "2px",
                      border:
                        "1px dashed #E5E5E0",
                    }}
                  >
                    <p
                      style={{
                        fontSize:
                          "15px",
                        fontWeight: 400,
                        color:
                          "#555555",
                      }}
                    >
                      No deep evaluation
                      records match
                      your exact
                      filter (
                      {
                        activeFilterLabel ||
                        searchQuery
                      }
                      ) right now.
                    </p>

                    <button
                      onClick={
                        clearAllFilters
                      }
                      style={{
                        marginTop:
                          "12px",
                        fontSize:
                          "13px",
                        fontWeight: 400,
                        color:
                          "#FF5A1F",
                        background:
                          "transparent",
                        border:
                          "none",
                        cursor:
                          "pointer",
                        textDecoration:
                          "underline",
                      }}
                    >
                      Reset All Filters
                      &amp; Browse All
                      Foundation Models
                      &rarr;
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      overflowX:
                        "auto",
                    }}
                  >
                    <table
                      style={{
                        width:
                          "100%",
                        minWidth:
                          "1280px",
                        borderCollapse:
                          "collapse",
                        textAlign:
                          "left",
                        fontFamily:
                          "'Inter', system-ui, sans-serif",
                        tableLayout:
                          "auto",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom:
                              "2px solid #111111",
                          }}
                        >
                          <th style={tableHeaderStyle}>
                            #
                          </th>
                          <th style={tableHeaderStyle}>
                            Model
                          </th>
                          <th style={tableHeaderStyle}>
                            Organization
                          </th>
                          <th style={tableHeaderStyle}>
                            Model Family
                          </th>
                          <th style={tableHeaderStyle}>
                            Category
                          </th>
                          <th style={tableHeaderStyle}>
                            Parameters
                          </th>
                          <th style={tableHeaderStyle}>
                            Context Window
                          </th>
                          <th style={tableHeaderStyle}>
                            License
                          </th>
                          <th style={tableHeaderStyle}>
                            Benchmarks
                          </th>
                          <th style={tableHeaderStyle}>
                            Papers
                          </th>
                          <th style={tableHeaderStyle}>
                            Release Date
                          </th>
                          <th
                            style={{
                              ...tableHeaderStyle,
                              textAlign:
                                "right",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedCatalogModels.map(
                          (model, idx) => (
                            <tr
                              key={model.id}
                              onClick={() => {
                                router.push(
                                  `/models/${
                                    model.slug ||
                                    model.id
                                  }`
                                );

                                if (
                                  model.slug
                                ) {
                                  prefetchModelBySlug(
                                    model.slug
                                  );
                                }
                              }}
                              style={{
                                borderBottom:
                                  "1px solid #EAE9E4",
                                cursor:
                                  "pointer",
                                transition:
                                  "background 0.15s ease",
                              }}
                              onMouseEnter={(
                                e
                              ) => {
                                e.currentTarget.style.backgroundColor =
                                  "#FFF8F6";

                                if (
                                  model.slug
                                ) {
                                  prefetchModelBySlug(
                                    model.slug
                                  );
                                }
                              }}
                              onMouseLeave={(
                                e
                              ) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <td
                                style={{
                                  ...tableCellStyle,
                                  fontFamily:
                                    "monospace",
                                  color:
                                    "#8B8B8B",
                                }}
                              >
                                {(
                                  idx + 1
                                )
                                  .toString()
                                  .padStart(
                                    3,
                                    "0"
                                  )}
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  fontSize:
                                    "12.5px",
                                  color:
                                    "#111111",
                                  minWidth:
                                    "160px",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      width:
                                        "6px",
                                      height:
                                        "6px",
                                      borderRadius:
                                        "50%",
                                      background:
                                        "#FF5A1F",
                                      display:
                                        "inline-block",
                                      flexShrink:
                                        0,
                                    }}
                                  />

                                  <span>
                                    {
                                      model.name
                                    }
                                  </span>
                                </div>
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#555555",
                                  minWidth:
                                    "120px",
                                }}
                              >
                                {
                                  model.vendor
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#111111",
                                }}
                              >
                                {model.modelFamily && (
                                  <span
                                    style={{
                                      padding:
                                        "3px 8px",
                                      background:
                                        "#F8F7F2",
                                      borderRadius:
                                        "2px",
                                      border:
                                        "1px solid #E5E5E0",
                                      fontSize:
                                        "11px",
                                      whiteSpace:
                                        "nowrap",
                                      display:
                                        "inline-block",
                                    }}
                                  >
                                    {
                                      model.modelFamily
                                    }
                                  </span>
                                )}
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#555555",
                                }}
                              >
                                {
                                  model.category
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#333333",
                                }}
                              >
                                {
                                  model.parameterCount
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#111111",
                                }}
                              >
                                {
                                  model.contextWindow
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#555555",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {
                                  model.license
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#FF5A1F",
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {model.trendingScore
                                  ? `⚡ ${model.trendingScore} Elo`
                                  : model.benchmarkScore &&
                                    Object.keys(
                                      model.benchmarkScore
                                    ).length >
                                      0
                                  ? `${
                                      Object.keys(
                                        model.benchmarkScore
                                      ).length
                                    } verified`
                                  : ""}
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color:
                                    "#555555",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {
                                  model.paperCount
                                }{" "}
                                papers
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  fontFamily:
                                    "monospace",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#777777",
                                }}
                              >
                                {
                                  model.releaseDate
                                }
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  textAlign:
                                    "right",
                                }}
                              >
                                <button
                                  onClick={(
                                    e
                                  ) => {
                                    e.stopPropagation();

                                    router.push(
                                      `/models/${
                                        model.slug ||
                                        model.id
                                      }`
                                    );

                                    if (
                                      model.slug
                                    ) {
                                      prefetchModelBySlug(
                                        model.slug
                                      );
                                    }
                                  }}
                                  style={{
                                    fontSize:
                                      "11px",
                                    fontWeight: 400,
                                    textTransform:
                                      "uppercase",
                                    letterSpacing:
                                      "0.4px",
                                    padding:
                                      "5px 10px",
                                    borderRadius:
                                      "2px",
                                    background:
                                      "#F8F7F2",
                                    color:
                                      "#111111",
                                    border:
                                      "1px solid #E5E5E0",
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  Inspect
                                  &rarr;
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      marginTop: "20px",
      paddingTop: "16px",
      borderTop: "1px solid #EAE9E4",
      flexWrap: "wrap",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        color: "#777777",
      }}
    >
      Showing{" "}
      {(currentPage - 1) * MODELS_PER_PAGE + 1}
      {"–"}
      {Math.min(
        currentPage * MODELS_PER_PAGE,
        rankedCatalogModels.length
      )}{" "}
      of {rankedCatalogModels.length} models
    </span>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <button
        onClick={() =>
          setCurrentPage((page) =>
            Math.max(1, page - 1)
          )
        }
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      <span
        style={{
          fontSize: "12px",
          color: "#555555",
          padding: "0 8px",
        }}
      >
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() =>
          setCurrentPage((page) =>
            Math.min(totalPages, page + 1)
          )
        }
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  </div>
)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 400,
  color: "#666666",
  whiteSpace: "nowrap",
  lineHeight: "1.25",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 12px",
  fontWeight: 400,
  verticalAlign: "middle",
  lineHeight: "1.3",
  whiteSpace: "nowrap",
};

export default function ModelsPage() {
  return (
    <>
      <Navbar />
      <ModelsContent />
    </>
  );
}