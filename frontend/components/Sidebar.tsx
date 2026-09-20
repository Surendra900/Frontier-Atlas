"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getPapers } from "@/lib/paperApi";
import {
  Flame,
  Clock,
  Star,
  Bot,
  Brain,
  MessageSquare,
  Globe,
  Cpu,
  Zap,
  Link as LinkIcon,
  Layers,
  FileText,
  ImageIcon,
  Volume2,
  BarChart2,
  Target,
  Plug,
  Search,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onItemClick?: () => void;
  onItemSelect?: (item: string) => void;
  initialActive?: string;
}

// ============ Sub-Components ============
const SectionLabel = ({ title }: { title: string }) => {
  return (
    <div className="px-3 mb-0.5 mt-3 first:mt-0">
      <p className="text-[11px] font-bold italic text-[#8B8B8B] uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  isActive = false,
  onClick,
  href,
  onMouseEnter,
}: {
  icon?: React.ReactNode;
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
          className={cn(
            "flex items-center justify-center shrink-0 w-4 h-4 transition-colors",
            isActive ? "text-[#F55036]" : "text-[#8B8B8B]"
          )}
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

// ============ Main Component ============
export default function Sidebar({
  onItemClick,
  onItemSelect,
  initialActive = "Trending Papers",
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState(initialActive);
  const pathname = usePathname();
  const router = useRouter();

  // Navigation Items
  const discover = [
    {
      label: "Trending Papers",
      slug: "trending",
      icon: (
        <Flame
          size={16}
          className={
            activeItem === "Trending Papers"
              ? "text-[#F55036] fill-[#F55036]"
              : ""
          }
        />
      ),
    },
    { label: "Latest Papers", icon: <Clock size={16} />, slug: "latest" },
    { label: "Most GitHub Stars", icon: <Star size={16} />, slug: "github-stars" },
    { label: "GitHub Hourly", icon: <TrendingUp size={16} />, slug: "github-hourly" },
  ];

  const tasks = [
    { label: "Large Language Models", icon: <MessageSquare size={16} />, slug: "large-language-models" },
    { label: "Agents", icon: <Bot size={16} />, slug: "agents" },
{ label: "Reasoning", icon: <Brain size={16} />, slug: "reasoning-models" },
    { label: "Vision-Language Models", icon: <ImageIcon size={16} />, slug: "vision-language-models" },
    { label: "Multimodal Models", icon: <Layers size={16} />, slug: "multimodal-models" },
    { label: "World Models", icon: <Globe size={16} />, slug: "world-models" },
    { label: "Image Generation", icon: <ImageIcon size={16} />, slug: "image-generation" },
    { label: "Automatic Speech Recognition", icon: <Volume2 size={16} />, slug: "automatic-speech-recognition" },
    { label: "Robotics", icon: <Cpu size={16} />, slug: "robotics" },
    { label: "All Tasks", icon: <FileText size={16} />, slug: "" },
  ];

  const methods = [
    { label: "Transformers", icon: <Zap size={16} />, slug: "transformer" },
    { label: "Diffusion Models", icon: <ImageIcon size={16} />, slug: "diffusion-models" },
    { label: "Mixture of Experts", icon: <Layers size={16} />, slug: "mixture-of-experts" },
    { label: "Reinforcement Learning", icon: <BarChart2 size={16} />, slug: "policy-learning" },
    { label: "Chain-of-Thought", icon: <LinkIcon size={16} />, slug: "chain-of-thought" },
    { label: "RAG", icon: <Search size={16} />, slug: "retrieval-augmented-generation" },
    { label: "Model Context Protocol", icon: <Plug size={16} />, slug: "mcp" },
    { label: "LoRA", icon: <Layers size={16} />, slug: "lora" },
    { label: "RLHF", icon: <Target size={16} />, slug: "rlhf" },
    { label: "All Methods", icon: <FileText size={16} />, slug: "" },
  ];

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

  // Prefetch primary discover routes smoothly after first paint
  useEffect(() => {
    const timer = setTimeout(() => {
      router.prefetch("/");
      router.prefetch("/category/latest");
      router.prefetch("/category/github-stars");
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    onItemSelect?.(label);
    onItemClick?.();
  };

  return (
    <aside className="flex flex-col w-full bg-transparent h-full border-r border-[#E5E5E0]">
      <div className="flex-1 px-2 pt-1 pb-2 space-y-3">
        {/* DISCOVER Section */}
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
                href={pathname === "/" ? undefined : (item.slug === "trending" ? "/" : `/category/${item.slug}`)}
              />
            ))}
          </div>
        </div>

        {/* TASKS Section */}
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
    href={item.slug ? `/tasks/${item.slug}` : `/tasks`}
  />
))}
          </div>
        </div>

        {/* METHODS Section */}
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
                href={item.slug ? `/methods/${item.slug}` : `/methods`}
              />
            ))}


          </div>
        </div>
      </div>


    </aside>
  );
}
