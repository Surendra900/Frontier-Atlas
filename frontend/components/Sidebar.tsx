"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getPapers } from "@/lib/paperApi";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onItemClick?: () => void;
  onItemSelect?: (item: string) => void;
  initialActive?: string;
}

// ============================================================
// SECTION LABEL
// ============================================================

const SectionLabel = ({ title }: { title: string }) => {
  return (
    <div className="px-3 mb-0.5 mt-3 first:mt-0">
      <p className="text-[11px] font-bold italic text-[#8B8B8B] uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
};

// ============================================================
// NAV ITEM
// ============================================================

const NavItem = ({
  icon,
  label,
  isActive = false,
  onClick,
  href,
  onMouseEnter,
}: {
  icon?: string;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  href?: string;
  onMouseEnter?: () => void;
}) => {
  const content = (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1 mx-1 cursor-pointer transition-colors rounded-md text-[13px] font-medium leading-snug",
        isActive
          ? "text-[#F55036]"
          : "text-[#555555] hover:text-[#111111]"
      )}
    >
      {icon && (
        <span
          className="flex items-center justify-center shrink-0 w-4 h-4 text-[15px] leading-none"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span className="whitespace-normal leading-tight">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
};

// ============================================================
// MAIN SIDEBAR
// ============================================================

export default function Sidebar({
  onItemClick,
  onItemSelect,
  initialActive = "Trending Papers",
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState(initialActive);

  const pathname = usePathname();
  const router = useRouter();

  // ============================================================
  // DISCOVER
  // ============================================================

  const discover = [
    {
      label: "Trending Papers",
      slug: "trending",
      icon: "🔥",
    },
    {
      label: "Latest Papers",
      slug: "latest",
      icon: "🕐",
    },
    {
      label: "Most GitHub Stars",
      slug: "github-stars",
      icon: "⭐",
    },
  ];

  // ============================================================
  // TASKS
  // ============================================================

  const tasks = [
    {
      label: "Large Language Models",
      icon: "💬",
      slug: "large-language-models",
    },
    {
      label: "Agents",
      icon: "🤖",
      slug: "agents",
    },
    {
      label: "Reasoning",
      icon: "🧠",
      slug: "reasoning-models",
    },
    {
      label: "Vision-Language Models",
      icon: "🖼️",
      slug: "vision-language-models",
    },
    {
      label: "Multimodal Models",
      icon: "🧩",
      slug: "multimodal-models",
    },
    {
      label: "World Models",
      icon: "🌍",
      slug: "world-models",
    },
    {
      label: "Image Generation",
      icon: "🎨",
      slug: "image-generation",
    },
    {
      label: "Automatic Speech Recognition",
      icon: "🔊",
      slug: "automatic-speech-recognition",
    },
    {
      label: "Robotics",
      icon: "🤖",
      slug: "robotics",
    },
    {
      label: "All Tasks",
      icon: "📄",
      slug: "",
    },
  ];

  // ============================================================
  // METHODS
  // ============================================================

  const methods = [
    {
      label: "Transformers",
      icon: "⚡",
      slug: "transformer",
    },
    {
      label: "Diffusion Models",
      icon: "🌫️",
      slug: "diffusion-models",
    },
    {
      label: "Mixture of Experts",
      icon: "🧩",
      slug: "mixture-of-experts",
    },
    {
      label: "Reinforcement Learning",
      icon: "📊",
      slug: "policy-learning",
    },
    {
      label: "Chain-of-Thought",
      icon: "🔗",
      slug: "chain-of-thought",
    },
    {
      label: "RAG",
      icon: "🔍",
      slug: "retrieval-augmented-generation",
    },
    {
      label: "Model Context Protocol",
      icon: "🔌",
      slug: "mcp",
    },
    {
      label: "LoRA",
      icon: "🧱",
      slug: "lora",
    },
    {
      label: "RLHF",
      icon: "🎯",
      slug: "rlhf",
    },
    {
      label: "All Methods",
      icon: "📄",
      slug: "",
    },
  ];

  // ============================================================
  // ACTIVE ITEM BASED ON URL
  // ============================================================

  useEffect(() => {
    if (pathname.startsWith("/tasks/")) {
      const taskSlug = pathname.replace("/tasks/", "");

      const matched = tasks.find((t) => t.slug === taskSlug);

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    } else if (pathname === "/tasks") {
      setActiveItem("All Tasks");
      return;
    } else if (pathname.startsWith("/methods/")) {
      const methodSlug = pathname.replace("/methods/", "");

      const matched = methods.find((m) => m.slug === methodSlug);

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    } else if (pathname === "/methods") {
      setActiveItem("All Methods");
      return;
    } else if (pathname.startsWith("/category/")) {
      const catSlug = pathname.replace("/category/", "");

      const matched = discover.find((d) => d.slug === catSlug);

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    } else if (pathname === "/" || pathname === "/papers") {
      if (initialActive) {
        setActiveItem(initialActive);
      } else {
        setActiveItem("Trending Papers");
      }

      return;
    }
  }, [pathname, initialActive]);

  // ============================================================
  // PREFETCH SIDEBAR ROUTES
  // ============================================================

  useEffect(() => {
    const routes = [
      "/",
      "/category/latest",
      "/category/github-stars",

      // Tasks
      "/tasks/large-language-models",
      "/tasks/agents",
      "/tasks/reasoning-models",
      "/tasks/vision-language-models",
      "/tasks/multimodal-models",
      "/tasks/world-models",
      "/tasks/image-generation",
      "/tasks/automatic-speech-recognition",
      "/tasks/robotics",
      "/tasks",

      // Methods
      "/methods/transformer",
      "/methods/diffusion-models",
      "/methods/mixture-of-experts",
      "/methods/policy-learning",
      "/methods/chain-of-thought",
      "/methods/retrieval-augmented-generation",
      "/methods/model-context-protocol-mcp",
      "/methods/lora",
      "/methods/rlhf",
      "/methods",
    ];

    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // ============================================================
  // ITEM CLICK
  // ============================================================

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    onItemSelect?.(label);
    onItemClick?.();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <aside className="flex flex-col w-full bg-transparent h-full border-r border-[#E5E5E0]">
      <div className="flex-1 px-2 pt-1 pb-2 space-y-3">

        {/* ======================================================
            DISCOVER
            ====================================================== */}

        <div>
          <SectionLabel title="Discover" />

          <div className="flex flex-col gap-0">
            {discover.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.label}
                onClick={() => handleItemClick(item.label)}
                href={
                  pathname === "/"
                    ? undefined
                    : item.slug === "trending"
                      ? "/"
                      : `/category/${item.slug}`
                }
              />
            ))}
          </div>
        </div>

        {/* ======================================================
            TASKS
            ====================================================== */}

        <div>
          <SectionLabel title="Tasks" />

          <div className="flex flex-col gap-0">
            {tasks.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.label}
                onClick={() => handleItemClick(item.label)}
                onMouseEnter={() => {
                  if (item.slug) {
                    void getPapers({
                      page: 1,
                      task: item.slug,
                      sort: "popular",
                    });
                  }
                }}
                href={
                  item.slug
                    ? `/tasks/${item.slug}`
                    : `/tasks`
                }
              />
            ))}
          </div>
        </div>

        {/* ======================================================
            METHODS
            ====================================================== */}

        <div>
          <SectionLabel title="Methods" />

          <div className="flex flex-col gap-0">
            {methods.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.label}
                onClick={() => handleItemClick(item.label)}
                href={
                  item.slug
                    ? `/methods/${item.slug}`
                    : `/methods`
                }
              />
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}