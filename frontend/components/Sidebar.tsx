"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Fire,
  Clock,
  Star,
  ChatCircleDots,
  Robot,
  Brain,
  ImageSquare,
  CirclesThreePlus,
  GlobeHemisphereWest,
  MagicWand,
  Waveform,
  Cpu,
  Files,
  Lightning,
  CloudFog,
  Stack,
  ChartBar,
  LinkSimple,
  MagnifyingGlass,
  PlugsConnected,
  Cube,
  Target,
  PaperPlaneTilt,
  type Icon,
} from "@phosphor-icons/react";

import { getPapers } from "@/lib/paperApi";

type SidebarProps = {
  onItemClick?: () => void;
  onItemSelect?: (label: string) => void;
  initialActive?: string;
};

type SidebarItem = {
  label: string;
  slug: string;
  icon: Icon;
  color: string;
};

// ============================================================
// SIDEBAR ITEM
// ============================================================

function SidebarItem({
  item,
  isActive,
  onClick,
  href,
  onMouseEnter,
}: {
  item: SidebarItem;
  isActive: boolean;
  onClick: () => void;
  href: string;
  onMouseEnter?: () => void;
}) {
  const IconComponent = item.icon;

  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        group
        flex
        items-center
        w-full
        h-[27px]
        px-3
        rounded-md
        no-underline
        transition-all
        duration-150
        ease-out
        ${isActive
          ? "bg-[#ECECE7] text-[#111111]"
          : "text-[#666666] hover:bg-[#EFEEE9] hover:text-[#111111]"
        }
      `}
    >
      <span
        className="
          flex
          items-center
          justify-center
          w-[21px]
          h-[21px]
          mr-2.5
          shrink-0
        "
      >
        <IconComponent
          size={17}
          weight="duotone"
          className={`
            transition-all
            duration-150
            ${isActive
              ? "opacity-100"
              : "opacity-80 group-hover:opacity-100"
            }
          `}
          style={{
            color: item.color,
          }}
        />
      </span>

      <span
        className={`
          truncate
          text-[12.5px]
          leading-none
          ${isActive
            ? "font-semibold text-[#111111]"
            : "font-medium text-[#666666] group-hover:text-[#222222]"
          }
        `}
      >
        {item.label}
      </span>
    </a>
  );
}

// ============================================================
// SECTION LABEL
// ============================================================

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-3 mb-0.5">
        <div
          className="
            text-[10px]
            uppercase
            tracking-[0.13em]
            font-semibold
            text-[#969690]
          "
        >
          {title}
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {children}
      </div>
    </div>
  );
}

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

  const discover: SidebarItem[] = [
    {
      label: "Trending Papers",
      slug: "trending",
      icon: Fire,
      color: "#E4572E",
    },
    {
      label: "Latest Papers",
      slug: "latest",
      icon: Clock,
      color: "#4B6B8A",
    },
    {
      label: "Most GitHub Stars",
      slug: "github-stars",
      icon: Star,
      color: "#C28A18",
    },
  ];

  // ============================================================
  // TASKS
  // ============================================================

  const tasks: SidebarItem[] = [
    {
      label: "Large Language Models",
      icon: ChatCircleDots,
      slug: "large-language-models",
      color: "#5271A4",
    },
    {
      label: "Agents",
      icon: Robot,
      slug: "agents",
      color: "#7656A8",
    },
    {
      label: "Reasoning",
      icon: Brain,
      slug: "reasoning-models",
      color: "#6654A6",
    },
    {
      label: "Vision-Language Models",
      icon: ImageSquare,
      slug: "vision-language-models",
      color: "#3E7C91",
    },
    {
      label: "Multimodal Models",
      icon: CirclesThreePlus,
      slug: "multimodal-models",
      color: "#497D6B",
    },
    {
      label: "World Models",
      icon: GlobeHemisphereWest,
      slug: "world-models",
      color: "#3F7F76",
    },
    {
      label: "Image Generation",
      icon: MagicWand,
      slug: "image-generation",
      color: "#9A5D91",
    },
    {
      label: "Automatic Speech Recognition",
      icon: Waveform,
      slug: "automatic-speech-recognition",
      color: "#4E7896",
    },
    {
      label: "Robotics",
      icon: Cpu,
      slug: "robotics",
      color: "#596A82",
    },
    {
      label: "All Tasks",
      icon: Files,
      slug: "",
      color: "#777777",
    },
  ];

  // ============================================================
  // METHODS
  // ============================================================

  const methods: SidebarItem[] = [
    {
      label: "Transformers",
      icon: Lightning,
      slug: "transformer",
      color: "#C07824",
    },
    {
      label: "Diffusion Models",
      icon: CloudFog,
      slug: "diffusion-models",
      color: "#66829B",
    },
    {
      label: "Mixture of Experts",
      icon: Stack,
      slug: "mixture-of-experts",
      color: "#7165A0",
    },
    {
      label: "Reinforcement Learning",
      icon: ChartBar,
      slug: "policy-learning",
      color: "#527C68",
    },
    {
      label: "Chain-of-Thought",
      icon: LinkSimple,
      slug: "chain-of-thought",
      color: "#61718C",
    },
    {
      label: "RAG",
      icon: MagnifyingGlass,
      slug: "retrieval-augmented-generation",
      color: "#4B7F91",
    },
    {
      label: "Model Context Protocol",
      icon: PlugsConnected,
      slug: "mcp",
      color: "#557A86",
    },
    {
      label: "LoRA",
      icon: Cube,
      slug: "lora",
      color: "#776C9B",
    },
    {
      label: "RLHF",
      icon: Target,
      slug: "rlhf",
      color: "#A35C59",
    },
    {
      label: "All Methods",
      icon: Files,
      slug: "",
      color: "#777777",
    },
  ];

  // ============================================================
  // ACTIVE ITEM BASED ON URL
  // ============================================================

  useEffect(() => {
    if (pathname.startsWith("/tasks/")) {
      const taskSlug = pathname.replace("/tasks/", "");

      const matched = tasks.find(
        (task) => task.slug === taskSlug
      );

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    }

    if (pathname === "/tasks") {
      setActiveItem("All Tasks");
      return;
    }

    if (pathname.startsWith("/methods/")) {
      const methodSlug = pathname.replace("/methods/", "");

      const matched = methods.find(
        (method) => method.slug === methodSlug
      );

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    }

    if (pathname === "/methods") {
      setActiveItem("All Methods");
      return;
    }

    if (pathname.startsWith("/category/")) {
      const categorySlug =
        pathname.replace("/category/", "");

      const matched = discover.find(
        (item) => item.slug === categorySlug
      );

      if (matched) {
        setActiveItem(matched.label);
        return;
      }
    }

    if (pathname === "/" || pathname === "/papers") {
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
    <aside className="flex flex-col w-full bg-transparent">

      <div className="px-2 pt-1 space-y-1">


        {/* ======================================================
            DISCOVER
            ====================================================== */}



        <SidebarSection title="Discover">
  {discover.map((item) => (
    <SidebarItem
      key={item.label}
      item={item}
      isActive={activeItem === item.label}
      onClick={() => handleItemClick(item.label)}
      href="/#all-time"
    />
  ))}
</SidebarSection>

        {/* ======================================================
            TASKS
            ====================================================== */}

        <SidebarSection title="Tasks">
          {tasks.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isActive={activeItem === item.label}
              onClick={() =>
                handleItemClick(item.label)
              }
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
                  : "/tasks"
              }
            />
          ))}
        </SidebarSection>

        {/* ======================================================
            METHODS
            ====================================================== */}

        <SidebarSection title="Methods">
          {methods.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isActive={activeItem === item.label}
              onClick={() =>
                handleItemClick(item.label)
              }
              href={
                item.slug
                  ? `/methods/${item.slug}`
                  : "/methods"
              }
            />
          ))}
        </SidebarSection>

        {/* Controlled empty space below sidebar */}
        <div className="h-[140px]" />

      </div>
    </aside>
  );
}