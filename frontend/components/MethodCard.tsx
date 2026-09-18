"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Mic } from "lucide-react";
import {
  SlidersHorizontal,
  Wrench,
  MessageSquare,
  Pilcrow,
  Plug,
} from "lucide-react";
import {
  Trophy,
  Map,
  Archive,
  Wifi,
} from "lucide-react";
import {
  Clapperboard,
  Scissors,
  SearchCheck,
  Move3D,
  Hand,
  Compass,
  ScanLine,
  MapPinned,
  Dot,
  Dice5,
  Grid2x2,
  Users,
  Scale,
  HeartHandshake,
  Gauge,
  Fingerprint,
  Lightbulb,
} from "lucide-react";
import {
  GitCompareArrows,
  Ruler,
  Wind,
  MessageCircleQuestion,
  Sigma,
  Rocket,
} from "lucide-react";
import {
  Brain,
  BrainCircuit,
  Languages,
  Eye,
  Volume2,
  Video,
  Boxes,
  Bot,
  Cuboid,
  Network,
  Activity,
  Sparkles,
  Cpu,
  Search,
  Shield,
  Zap,
  Database,
  GitBranch,
  Workflow,
  ScanSearch,
  Layers3,
  Orbit,
  Radar,
  Target,
  Microscope,
  BookOpen,
  PenTool,
  FileText,
  Globe,
  Route,
  Scan,
  Swords,
  Waves,
  BarChart3,
  ChartScatter,
  Binary,
  Lock,
  Server,
  HardDrive,
  FlaskConical,
  Telescope,
  Puzzle,
  TrendingUp,
  CircleDot,
} from "lucide-react";

import { fetchMethodCached } from "@/lib/methodCache";

export interface MethodCardData {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  paperCount?: number;
  year?: number;
}


const iconMap: Record<string, any> = {
  // Core AI
  general: Brain,
  language: Languages,
  "computer vision": Eye,
  "audio & speech": Volume2,
  video: Video,
  multimodal: Layers3,
  robotics: Bot,
  "embodied ai": Cuboid,
  "3d & spatial": Cuboid,
  "graph learning": Network,
  "time series": Activity,
  "scientific ai": FlaskConical,

  // Foundation Models
  "large language models": Languages,
  "small language models": FileText,
  "vision-language models": Eye,
  "multimodal models": Layers3,
  "omni models": Boxes,
  "embedding models": ScanSearch,
  "reasoning models": BrainCircuit,
  "world models": Globe,
  "long context models": BookOpen,
  "reinforcement learning": GitBranch,
  "model alignment": Shield,
  "efficient training": Zap,

  // Neural Architectures
  transformer: BrainCircuit,
  mamba: Waves,
  "state space models": Orbit,
  "convolutional networks": Scan,
  "recurrent networks": Workflow,
  "graph neural networks": Network,
  "mixture of experts": GitBranch,
  autoencoders: Boxes,
  "generative adversarial networks": Swords,
  "diffusion architectures": Sparkles,

  // Neural Components
attention: BrainCircuit,
embeddings: Database,
"positional encoding": Activity,
"feedforward networks": Network,
"activation functions": Zap,
normalization: CircleDot,
"residual connections": GitBranch,
pooling: Boxes,
convolution: Scan,
tokenization: FileText,

  // Training
  "pre-training": BookOpen,
  "fine-tuning": PenTool,
  "instruction tuning": FileText,
  "continued pretraining": TrendingUp,
  "self-supervised learning": Brain,
  "semi-supervised learning": BrainCircuit,
  "transfer learning": Route,
  "curriculum learning": BookOpen,
  "multi-task learning": Layers3,
  "continual learning": Activity,
  distillation: FlaskConical,
  "teacher forcing": Target,

  // Alignment
  rlhf: Shield,
  dpo: Target,
  "preference optimization": Target,
  "reward modeling": BarChart3,
  "constitutional ai": BookOpen,
  "ai feedback": BrainCircuit,

  // Prompting
  prompting: PenTool,
  "chain of thought": Workflow,
  reasoning: BrainCircuit,
  planning: Route,
  search: Search,
  reflection: Microscope,

  // Agents
  "tool use": Puzzle,
  react: Bot,
  "function calling": Cpu,
  "agent memory": Database,
  "multi-agent systems": Network,
  "workflow orchestration": Workflow,
  "model context protocol (mcp)": Server,

  // Retrieval
  "retrieval-augmented generation": Search,
  "dense retrieval": ScanSearch,
  "sparse retrieval": Search,
  "hybrid retrieval": Layers3,
  reranking: TrendingUp,
  "vector search": Database,
  "knowledge graphs": Network,

  // Adaptation
lora: SlidersHorizontal,
qlora: SlidersHorizontal,
peft: Wrench,
"prompt tuning": MessageSquare,
"prefix tuning": Pilcrow,
"adapter tuning": Plug,

  // Optimization
  optimizers: TrendingUp,
  "learning rate scheduling": Activity,
  initialization: Sparkles,
  "gradient methods": Activity,

  // Regularization
  dropout: CircleDot,
  "weight regularization": Shield,
  "label smoothing": Waves,
  "data augmentation": Boxes,

  // Efficiency
  quantization: Cpu,
  pruning: Zap,
  sparsity: Binary,
  "speculative decoding": Sparkles,
  "kv cache": Database,
  pagedattention: Layers3,
  "flashattention 2": Zap,
  "model compression": Boxes,
  "inference optimization": TrendingUp,

  // Reinforcement Learning
"value-based rl": Trophy,
"policy optimization": Target,
"model-based rl": Map,
"offline rl": Archive,
"online rl": Wifi,

// Representation Learning
"contrastive learning": GitCompareArrows,
"metric learning": Ruler,
"embedding learning": Database,
"feature learning": ScanSearch,

// Diffusion
"diffusion models": Wind,
"flow matching": Waves,
"score-based models": Sigma,
"consistency models": Rocket,

  // Vision
  "object detection": Target,
  segmentation: Scan,
  "image generation": Sparkles,
  "image classification": Eye,
  "pose estimation": Activity,
  tracking: Radar,
  "3d vision": Cuboid,

  // Language
"language modeling": BrainCircuit,
"machine translation": Languages,
"text generation": PenTool,
summarization: FileText,
"question answering": MessageCircleQuestion,
"information extraction": ScanSearch,

  // Audio
  "speech recognition": Volume2,
  "speech synthesis": Volume2,
  "speaker recognition": Mic,
  "audio generation": Sparkles,
  "music generation": Activity,

  // Video
"video understanding": Video,
"video generation": Clapperboard,
"video segmentation": Scissors,
"video retrieval": SearchCheck,

// Robotics
"motion planning": Route,
manipulation: Hand,
navigation: Compass,
"policy learning": Bot,

// 3D
nerf: Cuboid,
"gaussian splatting": Sparkles,
slam: MapPinned,
"point clouds": Dot,

// Mathematics
"optimization theory": Sigma,
probability: Dice5,
statistics: BarChart3,
"loss functions": Target,
"linear algebra": Grid2x2,

// Evaluation
metrics: BarChart3,
"human evaluation": Users,
"llm-as-a-judge": Scale,
"preference evaluation": HeartHandshake,
benchmarking: Gauge,

// Interpretability
"mechanistic interpretability": BrainCircuit,
attribution: Fingerprint,
probing: Microscope,
explainability: Lightbulb,

  // Safety
  hallucination: Brain,
  watermarking: Shield,
  "alignment safety": Lock,
  "jailbreak defense": Shield,
  robustness: Shield,
  privacy: Lock,

  // Systems
  "distributed training": Server,
  parallelism: Workflow,
  serving: Server,
  "inference systems": Cpu,
  "memory optimization": Database,

  // Hardware
  gpus: HardDrive,
  tpus: Cpu,
  npus: Cpu,
  accelerators: Zap,

  // Research Concepts
"scaling laws": TrendingUp,
emergence: Sparkles,
"in-context learning": BookOpen,
"test-time compute": Cpu,
"context engineering": Workflow,
"foundation models": Layers3,
};

const colorMap: Record<string, string> = {
  // Core AI
  general: "#EF4444",
  language: "#F97316",
  "computer vision": "#16A34A",
  "audio & speech": "#EA580C",
  video: "#DC2626",
  multimodal: "#D97706",
  robotics: "#F97316",
  "embodied ai": "#FB923C",
  "3d & spatial": "#6366F1",
  "graph learning": "#2563EB",
  "time series": "#F43F5E",
  "scientific ai": "#8B5CF6",

  // Foundation Models
  "large language models": "#E11D48",
  "small language models": "#0284C7",
  "vision-language models": "#16A34A",
  "multimodal models": "#EA580C",
  "omni models": "#9333EA",
  "embedding models": "#0891B2",
  "reasoning models": "#7C3AED",
  "world models": "#EC4899",
  "long context models": "#0F766E",
  "reinforcement learning": "#F97316",
  "model alignment": "#4F46E5",
  "efficient training": "#D97706",

  // Neural Architectures
  transformer: "#2563EB",
  mamba: "#3B82F6",
  "state space models": "#4F46E5",
  "convolutional networks": "#2563EB",
  "recurrent networks": "#7C3AED",
  "graph neural networks": "#2563EB",
  "mixture of experts": "#0891B2",
  autoencoders: "#3B82F6",
  "generative adversarial networks": "#9333EA",
  "diffusion architectures": "#EC4899",

  // Neural Components
attention: "#7C3AED",
embeddings: "#0891B2",
"positional encoding": "#6366F1",
"feedforward networks": "#2563EB",
"activation functions": "#F97316",
normalization: "#14B8A6",
"residual connections": "#EC4899",
pooling: "#0EA5E9",
convolution: "#16A34A",
tokenization: "#DC2626",

  // Training
  "pre-training": "#0F766E",
  "fine-tuning": "#F97316",
  "instruction tuning": "#2563EB",
  "continued pretraining": "#F59E0B",
  "self-supervised learning": "#16A34A",
  "semi-supervised learning": "#0EA5E9",
  "transfer learning": "#6366F1",
  "curriculum learning": "#0891B2",
  "multi-task learning": "#9333EA",
  "continual learning": "#14B8A6",
  distillation: "#8B5CF6",
  "teacher forcing": "#DC2626",

  // Alignment
  rlhf: "#4F46E5",
  dpo: "#F97316",
  "preference optimization": "#EC4899",
  "reward modeling": "#2563EB",
  "constitutional ai": "#0F766E",
  "ai feedback": "#6366F1",

  // Prompting
  prompting: "#F97316",
  "chain of thought": "#8B5CF6",
  reasoning: "#7C3AED",
  planning: "#0891B2",
  search: "#2563EB",
  reflection: "#0F766E",

  // Agents
  "tool use": "#2563EB",
  react: "#9333EA",
  "function calling": "#0891B2",
  "agent memory": "#14B8A6",
  "multi-agent systems": "#6366F1",
  "workflow orchestration": "#F59E0B",
  "model context protocol (mcp)": "#6B7280",

  // Retrieval
  "retrieval-augmented generation": "#0284C7",
  "dense retrieval": "#0891B2",
  "sparse retrieval": "#2563EB",
  "hybrid retrieval": "#7C3AED",
  reranking: "#F97316",
  "vector search": "#14B8A6",
  "knowledge graphs": "#6366F1",

  // Adaptation
lora: "#8B5CF6",            // Violet
qlora: "#3B82F6",           // Blue
peft: "#0EA5E9",            // Sky
"prompt tuning": "#F97316", // Orange
"prefix tuning": "#14B8A6", // Teal
"adapter tuning": "#EC4899", // Pink

  // Optimization
  optimizers: "#F97316",
  "learning rate scheduling": "#F59E0B",
  initialization: "#8B5CF6",
  "gradient methods": "#2563EB",

  // Vision
  "object detection": "#16A34A",
  segmentation: "#14B8A6",
  "image generation": "#EC4899",
  "image classification": "#0F766E",
  "pose estimation": "#F97316",
  tracking: "#2563EB",
  "3d vision": "#6366F1",

  // Audio
  "speech recognition": "#EA580C",
  "speech synthesis": "#F97316",
  "speaker recognition": "#DC2626",
  "audio generation": "#EC4899",
  "music generation": "#8B5CF6",

  // Video
"video understanding": "#2563EB", // Blue
"video generation": "#EC4899",    // Pink
"video segmentation": "#F97316",  // Orange
"video retrieval": "#16A34A",     // Green

// Robotics
"motion planning": "#2563EB",  // Blue
manipulation: "#F97316",       // Orange
navigation: "#16A34A",         // Green
"policy learning": "#8B5CF6",  // Purple

// 3D
nerf: "#6366F1",                // Indigo
"gaussian splatting": "#EC4899",// Pink
slam: "#2563EB",                // Blue
"point clouds": "#84CC16",      // Lime
// Mathematics
"optimization theory": "#2563EB", // Blue
probability: "#16A34A",           // Green
statistics: "#F97316",            // Orange
"loss functions": "#EC4899",      // Pink
"linear algebra": "#7C3AED",      // Purple

// Evaluation
metrics: "#2563EB",               // Blue
"human evaluation": "#F97316",    // Orange
"llm-as-a-judge": "#8B5CF6",       // Violet
"preference evaluation": "#EC4899",// Pink
benchmarking: "#16A34A",          // Green

// Interpretability
"mechanistic interpretability": "#7C3AED", // Purple
attribution: "#F97316",                   // Orange
probing: "#2563EB",                       // Blue
explainability: "#F59E0B",                // Amber

  // Efficiency
quantization: "#2563EB",           // Blue
pruning: "#F97316",                // Orange
sparsity: "#7C3AED",               // Purple
"speculative decoding": "#EC4899", // Pink
"kv cache": "#16A34A",             // Green
pagedattention: "#0891B2",         // Cyan
"flashattention 2": "#EAB308",     // Amber
"model compression": "#9333EA",    // Violet
"inference optimization": "#DC2626", // Red

// Reinforcement Learning
"value-based rl": "#2563EB",      // Blue
"policy optimization": "#F97316", // Orange
"model-based rl": "#16A34A",      // Green
"offline rl": "#7C3AED",          // Purple
"online rl": "#EC4899",           // Pink

// Representation Learning
"contrastive learning": "#2563EB", // Blue
"metric learning": "#F97316",      // Orange
"embedding learning": "#14B8A6",   // Teal
"feature learning": "#7C3AED",     // Purple

// Diffusion
"diffusion models": "#EC4899",   // Pink
"flow matching": "#06B6D4",      // Cyan
"score-based models": "#8B5CF6", // Violet
"consistency models": "#F59E0B", // Amber

// Safety
hallucination: "#EF4444",         // Red
watermarking: "#0EA5E9",          // Sky
"alignment safety": "#8B5CF6",    // Violet
"jailbreak defense": "#F97316",   // Orange
robustness: "#16A34A",            // Green
privacy: "#EC4899",               // Pink

// Systems
"distributed training": "#2563EB", // Blue
parallelism: "#14B8A6",            // Teal
serving: "#F97316",                // Orange
"inference systems": "#8B5CF6",    // Violet
"memory optimization": "#16A34A",  // Green

// Hardware
gpus: "#16A34A",                  // Green
tpus: "#2563EB",                  // Blue
npus: "#8B5CF6",                  // Violet
accelerators: "#F97316",          // Orange

// Research Concepts
"scaling laws": "#2563EB",        // Blue
emergence: "#EC4899",             // Pink
"in-context learning": "#16A34A", // Green
"test-time compute": "#F97316",   // Orange
"context engineering": "#14B8A6", // Teal       
"foundation models": "#DC2626",   // Red
};

export default function MethodCard({
  method,
  accentColor,
}: {
  method: MethodCardData;
  accentColor?: string;
}) {
  const router = useRouter();
  const paperCount = method.paperCount || 0;
  const slug = method.slug ?? method.id;

  const handlePrefetch = useCallback(() => {
    if (slug) {
      router.prefetch(`/methods/${slug}`);
      fetchMethodCached(slug).catch(() => {});
    }
  }, [router, slug]);

  const Icon =
    iconMap[method.name.toLowerCase()] ||
    iconMap[method.slug?.replace(/-/g, " ").toLowerCase() || ""] ||
    Brain;
  const iconColor =
    colorMap[method.name.toLowerCase()] ||
    colorMap[method.slug?.replace(/-/g, " ").toLowerCase() || ""] ||
    accentColor ||
    "#2563EB";
  return (
    <Link
      href={`/methods/${slug}`}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      onFocus={handlePrefetch}
      className="bg-white rounded-md border border-[#ECECEC] p-5 min-h-[150px] flex flex-col hover:shadow-md transition-shadow duration-200 group no-underline"
    >
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-125">
  <Icon
    size={22}
    strokeWidth={2.2}
    style={{ color: iconColor }}
  />
</div>

      <h3 className="text-[#111111] text-[15px] font-medium leading-5">
        {method.name}
      </h3>
    </div>

    <p className="mt-3 text-[13px] leading-5 text-[#666] line-clamp-3">
  {method.description}
</p>

    <div className="mt-auto pt-5">
  {paperCount > 0 && (
    <span className="inline-flex items-center rounded-full border border-[#D9D9D9] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
  {paperCount.toLocaleString()} papers
</span>
  )}
</div>
  </Link>
  
);
}
