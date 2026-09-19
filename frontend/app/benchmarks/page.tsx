"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PageHero from "@/components/shared/PageHero";
import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import SectionSidebar from "@/components/shared/SectionSidebar";
import {
  Search,
  ArrowUpRight,
  TrendingUp,
  Plus,
  MessageSquare,
  Brain,
  Eye,
  FileText,
  Code,
  BookOpen,
  BarChart3,
  Trophy,
  Bot,
  Music,
  Video,
  Heart,
  Network,
  Activity,
  Cpu,
  Layers,
  Target,
  Mic,
  ChevronDown,
  SlidersHorizontal,
  X,
  Clock,
  Flame,
  Star,
  Filter,
  Languages,
  FileSearch,
  ImageIcon,
  Scissors,
  Headphones,
  Speaker,
  Film,
  Radar,
  Scan,
  Sparkles,
  Puzzle,
  Shield,
  Stethoscope,
  FlaskConical,
  Binary,
  Move,
  Satellite,
  Fingerprint,
  Zap,
  Database,
  Box,
  Users,
  Palette,
  ScanEye,
  Scale
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getBenchmarks, getCachedBenchmarksSync, prefetchBenchmarkDetail, prefetchBenchmarkList, type BenchmarkItem } from "@/lib/benchmarks";
import { useBenchmarkDetail } from "@/lib/useBenchmarkDetail";
import { atlasUiFont } from "@/lib/fonts";

/* ══════════════════════════════════════════════════════════════
   STATUS CONFIG
   ══════════════════════════════════════════════════════════════ */

const STATUS_CFG: Record<string, { color: string; text: string; bg: string; border: string }> = {
  Active:     { color: "#10B981", text: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-100"  },
  Saturating: { color: "#F59E0B", text: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-100"    },
  Saturated:  { color: "#F87171", text: "text-rose-700",    bg: "bg-rose-50",     border: "border-rose-100"     },
  Superseded: { color: "#A78BFA", text: "text-purple-700",  bg: "bg-purple-50",   border: "border-purple-100"   },
  Unmapped:   { color: "#9CA3AF", text: "text-gray-500",    bg: "bg-gray-50",     border: "border-gray-100"     },
};
// A curated list of ~20 highly comparable benchmarks that share frontier LLMs
const COMPARABLE_BENCHMARKS = [
  "MMLU", 
  "MATH", 
  "HumanEval", 
  "SWE-Bench Verified", 
  "GSM8K",
  "GPQA", 
  "HellaSwag", 
  "ARC Challenge", 
  "TruthfulQA", 
  "MBPP",
  "BBH", 
  "WinoGrande", 
  "DROP", 
  "PIQA", 
  "TriviaQA",
  "AGIEval", 
  "MMLU-Pro", 
  "TheoremQA", 
  "AlpacaEval 2.0", 
  "Chatbot Arena"
];


function getMeta(name: string) {
  const n = (name || "").toLowerCase();

  // ── 1. Robotics & Navigation ──
  if (n.includes("nav") || n.includes("habitat") || n.includes("eqa") || n.includes("touch") || n.includes("spatial"))
    return { task: "Navigation", metric: "SPL", status: "Active", category: "Robotics", year: "2023", collection: "Robotics" };
  if (n.includes("robot") || n.includes("manipulation") || n.includes("grasp") || n.includes("dexter"))
    return { task: "Planning", metric: "success rate", status: "Active", category: "Robotics", year: "2024", collection: "Robotics" };

  // ── 2. Scientific AI ──
  if (n.includes("science") || n.includes("physics") || n.includes("chem") || n.includes("bio") || n.includes("protein") || n.includes("genomics"))
    return { task: "Question Answering", metric: "accuracy", status: "Active", category: "Scientific AI", year: "2024", collection: "Science" };

  // ── 3. Time Series ──
  if (n.includes("time") || n.includes("series") || n.includes("forecast") || n.includes("anomaly") || n.includes("etth") || n.includes("ettm") || n.includes("weather") || n.includes("traffic") || n.includes("electricity"))
    return { task: "Time Series", metric: "MSE", status: "Active", category: "Time Series", year: "2023", collection: "Time Series" };

  // ── 4. Graphs ──
  if (n.includes("graph") || n.includes("node") || n.includes("link") || n.includes("cora") || n.includes("citeseer") || n.includes("pubmed"))
    return { task: "Question Answering", metric: "accuracy", status: "Active", category: "Graphs", year: "2022", collection: "Graphs" };

  // ── 5. Audio & Speech ──
  if (n.includes("tts") || n.includes("synthesis") || n.includes("voicegen") || n.includes("ljspeech") || n.includes("vctk") || n.includes("fastspeech"))
    return { task: "Speech Synthesis", metric: "MOS", status: "Active", category: "Audio & Speech", year: "2024", collection: "Audio" };
  if (n.includes("audio class") || n.includes("sound") || n.includes("esc-50") || n.includes("audioset") || n.includes("urbansound"))
    return { task: "Audio Classification", metric: "accuracy", status: "Active", category: "Audio & Speech", year: "2023", collection: "Audio" };
  if (n.includes("audio") || n.includes("speech") || n.includes("voice") || n.includes("librispeech") || n.includes("whisper") || n.includes("asr"))
    return { task: "Speech Recognition", metric: "WER", status: "Active", category: "Audio & Speech", year: "2023", collection: "Audio" };

  // ── 6. Computer Vision ──
  if (n.includes("detect") || n.includes("yolo") || n.includes("bbox") || n.includes("voc"))
    return { task: "Object Detection", metric: "mAP", status: "Active", category: "Computer Vision", year: "2023", collection: "Vision" };
  if (n.includes("segment") || n.includes("ade20k") || n.includes("cityscapes") || n.includes("mask"))
    return { task: "Semantic Segmentation", metric: "mIoU", status: "Active", category: "Computer Vision", year: "2023", collection: "Vision" };
  if (n.includes("caption") || n.includes("flickr") || n.includes("nocaps") || n.includes("mscoco") || n.includes("vizwiz"))
    return { task: "Image Captioning", metric: "CIDEr", status: "Active", category: "Computer Vision", year: "2022", collection: "Vision" };
  if (n.includes("imagenet") || n.includes("coco") || n.includes("vision") || n.includes("image"))
    return { task: "Image Classification", metric: "accuracy", status: "Active", category: "Computer Vision", year: "2023", collection: "Vision" };

  // ── 7. Video ──
  if (n.includes("video") || n.includes("kinetics") || n.includes("ucf") || n.includes("activitynet"))
    return { task: "Video Understanding", metric: "accuracy", status: "Active", category: "Video", year: "2023", collection: "Video" };

  // ── 8. Multimodal ──
  if (n.includes("multimodal") || n.includes("mmmu") || n.includes("mm-") || n.includes("llava") || n.includes("vl") || n.includes("vqa"))
    return { task: "Visual Question Answering", metric: "accuracy", status: "Active", category: "Multimodal", year: "2024", collection: "Multimodal" };

  // ── 9. OCR & Document AI ──
  if (n.includes("ocrbench") || n.includes("textvqa") || n.includes("docvqa") || n.includes("ocr"))
    return { task: "OCR", metric: "accuracy", status: "Active", category: "OCR & Document AI", year: "2024", collection: "Document AI" };
  if (n.includes("parse") || n.includes("olmocr") || n.includes("omnidoc") || n.includes("chart") || n.includes("doc"))
    return { task: "Document Parsing", metric: "f1-score", status: "Active", category: "OCR & Document AI", year: "2024", collection: "Document AI" };

  // ── 10. Coding ──
  if (n.includes("swe-bench") || n.includes("swe") || n.includes("issue") || n.includes("resolve"))
    return { task: "Software Engineering", metric: "resolve-rate", status: "Active", category: "Coding", year: "2024", collection: "Coding" };
  if (n.includes("terminal") || n.includes("code") || n.includes("human") || n.includes("mbpp") || n.includes("livecode") || n.includes("ds-1000"))
    return { task: "Code Generation", metric: "pass@1", status: "Active", category: "Coding", year: "2023", collection: "Coding" };

  // ── 11. Mathematics ──
  if (n.includes("math") || n.includes("gsm") || n.includes("theoremqa") || n.includes("aime"))
    return { task: "Mathematical Reasoning", metric: "accuracy", status: "Active", category: "Mathematics", year: "2023", collection: "Mathematics" };

  // ── 12. Reasoning ──
  if (n.includes("arc") || n.includes("hellaswag") || n.includes("piqa") || n.includes("boolq") || n.includes("truthfulqa") || n.includes("bbh") || n.includes("gpqa") || n.includes("humanity") || n.includes("big-bench"))
    return { task: "Reasoning", metric: "accuracy", status: "Saturated", category: "Reasoning", year: "2019", collection: "Reasoning" };

  // ── 13. Healthcare ──
  if (n.includes("medqa") || n.includes("pubmed") || n.includes("clinical") || n.includes("med"))
    return { task: "Question Answering", metric: "accuracy", status: "Active", category: "Healthcare", year: "2023", collection: "Healthcare" };

  // ── 14. Language & NLP ──
  if (n.includes("retrieval") || n.includes("rag") || n.includes("msmarco") || n.includes("nq") || n.includes("beir"))
    return { task: "Retrieval", metric: "NDCG", status: "Active", category: "Language", year: "2023", collection: "Language" };
  if (n.includes("summar") || n.includes("xsum") || n.includes("cnn") || n.includes("rouge") || n.includes("samsum") || n.includes("gigaword") || n.includes("aeslc"))
    return { task: "Summarization", metric: "ROUGE", status: "Active", category: "Language", year: "2022", collection: "Language" };
  if (n.includes("translat") || n.includes("wmt") || n.includes("bleu") || n.includes("comet") || n.includes("flores"))
    return { task: "Machine Translation", metric: "BLEU", status: "Active", category: "Language", year: "2022", collection: "Language" };
  if (n.includes("gen") || n.includes("story") || n.includes("dialog"))
    return { task: "Text Generation", metric: "score", status: "Active", category: "Language", year: "2022", collection: "Language" };
  if (n.includes("qa") || n.includes("mmlu") || n.includes("glue") || n.includes("squad") || n.includes("trivia") || n.includes("winogrande") || n.includes("drop") || n.includes("agieval") || n.includes("language") || n.includes("text"))
    return { task: "Question Answering", metric: "accuracy", status: "Active", category: "Language", year: "2021", collection: "Language" };

  // ── 15. Agents ──
  if (n.includes("agent") || n.includes("tool") || n.includes("webarena") || n.includes("alfworld") || n.includes("gym") || n.includes("env"))
    return { task: "Planning", metric: "success rate", status: "Active", category: "Agents", year: "2024", collection: "Agents" };

  // ── 16. General AI Catch-All ──
  return { task: "General ML Evaluation", metric: "accuracy", status: "Active", category: "General AI", year: "2024", collection: "General" };
}

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
   ══════════════════════════════════════════════════════════════ */

const DOMAINS = [
  { label: "General AI",       icon: Trophy,    color: "#e11d48", desc: "Measures overall AI capability across diverse tasks spanning language, vision, reasoning & planning" },
  { label: "Language",         icon: BookOpen,  color: "#0284c7", desc: "NLP benchmarks for comprehension, fluent text generation & cross-lingual translation quality" },
  { label: "Reasoning",        icon: Brain,     color: "#9333ea", desc: "Evaluates logical, causal & commonsense inference across multi-step problem chains" },
  { label: "Coding",           icon: Code,      color: "#16a34a", desc: "Code generation, debugging & software engineering evaluations across real-world repositories" },
  { label: "Agents",           icon: Bot,       color: "#d97706", desc: "Tool use, long-horizon planning & multi-turn decision-making in interactive environments" },
  { label: "Computer Vision",  icon: Eye,       color: "#0891b2", desc: "Detection, segmentation, classification & other pixel-level visual understanding tasks" },
  { label: "OCR & Document AI",icon: FileText,  color: "#7c3aed", desc: "Text recognition, layout parsing & structured extraction from scanned documents & PDFs" },
  { label: "Multimodal",       icon: Layers,    color: "#db2777", desc: "Cross-modal reasoning across image, text & audio inputs requiring joint understanding" },
  { label: "Audio & Speech",   icon: Mic,       color: "#0d9488", desc: "Speech recognition, synthesis quality & audio classification measured by WER and MOS" },
  { label: "Video",            icon: Video,     color: "#ea580c", desc: "Temporal action recognition, video QA & long-form understanding across frame sequences" },
  { label: "Robotics",         icon: Cpu,       color: "#4f46e5", desc: "Manipulation, navigation & embodied control tasks across simulated & real-world settings" },
  //{ label: "Embodied AI",      icon: Activity,  color: "#ca8a04", desc: "Agents acting, exploring & solving goals in simulated 3D environments with physical constraints" },
  { label: "Healthcare",       icon: Heart,     color: "#dc2626", desc: "Medical QA, clinical NLP & diagnostic imaging benchmarks for biomedical AI systems" },
  { label: "Mathematics",      icon: BarChart3, color: "#2563eb", desc: "From arithmetic word problems to formal proof verification across multiple difficulty levels" },
  { label: "Time Series",      icon: TrendingUp,color: "#65a30d", desc: "Forecasting future values & anomaly detection across temporal signals and sensor streams" },
  { label: "Graphs",           icon: Network,   color: "#c026d3", desc: "Node classification, link prediction & graph-level reasoning on structured relational data" },
  { label: "Scientific AI",    icon: Target,    color: "#0284c7", desc: "Biology, chemistry & physics evaluations measuring AI progress on scientific discovery tasks" },
];

const TASKS = [
  { label: "Question Answering", icon: MessageSquare, color: "#9333ea", bg: "#f3e8ff", desc: "Comprehension & factual recall evaluated on open-domain and reading-comprehension datasets" },
  { label: "Text Generation", icon: Puzzle, color: "#0284c7", bg: "#e0f2fe", desc: "Producing coherent, fluent text from prompts, dialogue history or structured inputs" },
  { label: "Machine Translation", icon: Languages, color: "#d97706", bg: "#fef3c7", desc: "Translate text across language pairs and evaluate fidelity using BLEU & COMET scores" },
  { label: "Reasoning", icon: Shield, color: "#7c3aed", bg: "#ede9fe", desc: "Multi-step logical & commonsense inference evaluated on chains of thought and proofs" },
  { label: "Mathematical Reasoning", icon: Binary, color: "#1d4ed8", bg: "#dbeafe", desc: "Arithmetic word problems to olympiad-level formal proofs across difficulty tiers" },
  { label: "Code Generation", icon: Database, color: "#059669", bg: "#d1fae5", desc: "Generate correct, executable code from natural language specifications & test suites" },
  { label: "Software Engineering", icon: Box, color: "#0891b2", bg: "#cffafe", desc: "Resolve real-world GitHub issues end-to-end, measured by patch resolve rate" },
  { label: "Retrieval", icon: FileSearch, color: "#e11d48", bg: "#ffe4e6", desc: "Fetch semantically relevant documents ranked by precision, recall & NDCG metrics" },
  { label: "Image Classification", icon: ImageIcon, color: "#6366f1", bg: "#e0e7ff", desc: "Assign category labels to images measured by top-1 and top-5 accuracy on held-out sets" },
  { label: "Object Detection", icon: Radar, color: "#ea580c", bg: "#fff7ed", desc: "Locate & classify objects in images using mean average precision across IoU thresholds" },
  { label: "Semantic Segmentation", icon: Scissors, color: "#65a30d", bg: "#f7fee7", desc: "Per-pixel scene labeling on benchmarks like ADE20K, evaluated by mean IoU score" },
  { label: "Visual Question Answering", icon: Fingerprint, color: "#db2777", bg: "#fce7f3", desc: "Answer open-ended questions grounded in image content across diverse VQA datasets" },
  { label: "Document Parsing", icon: FlaskConical, color: "#7e22ce", bg: "#f5f3ff", desc: "Extract structured tables, figures & text from complex PDF and scanned documents" },
  { label: "OCR", icon: Scan, color: "#4f46e5", bg: "#eef2ff", desc: "Digitize printed & handwritten text from images and scanned pages with high accuracy" },
  { label: "Image Captioning", icon: Sparkles, color: "#f59e0b", bg: "#fef9c3", desc: "Generate descriptive captions for images, evaluated by BLEU, CIDEr & SPICE metrics" },
  { label: "Speech Recognition", icon: Headphones, color: "#0d9488", bg: "#ccfbf1", desc: "Transcribe spoken audio to text across accents & noise conditions measured by WER" },
  { label: "Speech Synthesis", icon: Speaker, color: "#c026d3", bg: "#fae8ff", desc: "Generate natural, intelligible speech from text evaluated by MOS & naturalness scores" },
  { label: "Audio Classification", icon: Move, color: "#ca8a04", bg: "#fefce8", desc: "Categorize audio clips into sound events, music genres or environmental class labels" },
  { label: "Video Understanding", icon: Film, color: "#dc2626", bg: "#fee2e2", desc: "Action recognition, video QA & temporal reasoning across long-form video sequences" },
  { label: "Planning", icon: Satellite, color: "#10b981", bg: "#ecfdf5", desc: "Step-by-step goal planning, task decomposition & sequential decision-making in agents" },
  { label: "Navigation", icon: Network, color: "#f97316", bg: "#fff7ed", desc: "Reach spatial targets efficiently via path planning measured by SPL & success rate" },
];

const COLLECTIONS = [
  { label: "Reasoning",        icon: Stethoscope,  color: "#9333ea", bg: "#f3e8ff", desc: "GPQA, ARC-AGI & commonsense evals covering logical, causal & abstract reasoning" },
  { label: "Coding",           icon: Palette,      color: "#16a34a", bg: "#dcfce7", desc: "HumanEval, SWE-Bench & code generation tasks across multiple languages & environments" },
  { label: "Agent Evaluation", icon: ScanEye,      color: "#d97706", bg: "#fef3c7", desc: "Tool use, long-horizon planning & multi-turn agent tasks in interactive environments" },
  { label: "Vision",           icon: Clock,        color: "#0891b2", bg: "#e0f2fe", desc: "Object detection, semantic segmentation & image classification recognition benchmarks" },
  { label: "OCR & Document AI",icon: Flame,        color: "#7c3aed", bg: "#ede9fe", desc: "Parsing, OCR accuracy & table extraction from scanned and digitally-born documents" },
  { label: "Language",         icon: ArrowUpRight, color: "#0284c7", bg: "#dbeafe", desc: "QA, summarization & translation evals measuring fluency, faithfulness & comprehension" },
  { label: "Multimodal",       icon: Star,         color: "#db2777", bg: "#fce7f3", desc: "Cross-modal vision-language reasoning across images, charts, video & audio inputs" },
  { label: "Audio & Speech",   icon: Music,        color: "#0d9488", bg: "#ccfbf1", desc: "ASR transcription, TTS naturalness & audio classification across diverse sound domains" },
  { label: "Robotics",         icon: Plus,         color: "#4f46e5", bg: "#e0e7ff", desc: "Manipulation dexterity & embodied navigation control in simulated & physical settings" },
  { label: "Healthcare",       icon: Filter,       color: "#dc2626", bg: "#fee2e2", desc: "Medical QA, clinical note NLP & diagnostic imaging benchmarks for biomedical AI" },
  { label: "Mathematics",      icon: Trophy,       color: "#2563eb", bg: "#dbeafe", desc: "Arithmetic to olympiad-level proof verification across structured mathematical domains" },
];

const POPULAR_BENCHMARK_NAMES = [
  "MMLU", "GPQA", "Humanity's Last Exam", "GSM8K", "MATH",
  "HumanEval", "MBPP", "SWE-Bench", "Terminal-Bench", "MMMU",
  "MathVista", "OCRBench v2", "ParseBench", "ImageNet", "COCO",
];

const getCategoryIcon = (category: string) => {
  const found = DOMAINS.find(d => d.label === category);
  return found?.icon ?? Trophy;
};

const getCategoryColor = (category: string) => {
  const found = DOMAINS.find(d => d.label === category);
  return found?.color ?? "#e11d48";
};

// ── Popular Benchmarks icon pool (12 unique icons) ──────────────────────────
const POPULAR_ICON_POOL = [
  { icon: Trophy,      color: "#e11d48", bg: "#ffe4e6" },
  { icon: Brain,       color: "#9333ea", bg: "#f3e8ff" },
  { icon: Code,        color: "#059669", bg: "#d1fae5" },
  { icon: Eye,         color: "#0891b2", bg: "#e0f2fe" },
  { icon: BarChart3,   color: "#1d4ed8", bg: "#dbeafe" },
  { icon: Layers,      color: "#db2777", bg: "#fce7f3" },
  { icon: Mic,         color: "#0d9488", bg: "#ccfbf1" },
  { icon: Heart,       color: "#dc2626", bg: "#fee2e2" },
  { icon: Network,     color: "#7c3aed", bg: "#ede9fe" },
  { icon: Activity,    color: "#ea580c", bg: "#fff7ed" },
  { icon: Target,      color: "#65a30d", bg: "#f7fee7" },
  { icon: BookOpen,    color: "#0284c7", bg: "#dbeafe" },
] as const;

// ── Recently Added icon pool (12 unique icons — none from POPULAR_ICON_POOL) ─
const RECENT_ICON_POOL = [
  { icon: Bot,         color: "#d97706", bg: "#fef3c7" },
  { icon: FileText,    color: "#7c3aed", bg: "#ede9fe" },
  { icon: Video,       color: "#e11d48", bg: "#ffe4e6" },
  { icon: Cpu,         color: "#4f46e5", bg: "#e0e7ff" },
  { icon: TrendingUp,  color: "#16a34a", bg: "#dcfce7" },
  { icon: MessageSquare, color: "#0891b2", bg: "#e0f2fe" },
  { icon: Puzzle,      color: "#9333ea", bg: "#f3e8ff" },
  { icon: Zap,         color: "#ca8a04", bg: "#fef9c3" },
  { icon: Languages,   color: "#0d9488", bg: "#ccfbf1" },
  { icon: Shield,      color: "#c026d3", bg: "#fae8ff" },
  { icon: Binary,      color: "#1d4ed8", bg: "#dbeafe" },
  { icon: Database,    color: "#059669", bg: "#d1fae5" },
] as const;

// ── Trending Benchmarks icon pool (12 unique icons — none from above pools) ──
const TRENDING_ICON_POOL = [
  { icon: Box,         color: "#ea580c", bg: "#fff7ed" },
  { icon: FileSearch,  color: "#db2777", bg: "#fce7f3" },
  { icon: ImageIcon,   color: "#6366f1", bg: "#e0e7ff" },
  { icon: Radar,       color: "#0284c7", bg: "#e0f2fe" },
  { icon: Scissors,    color: "#65a30d", bg: "#f7fee7" },
  { icon: Fingerprint, color: "#7e22ce", bg: "#f5f3ff" },
  { icon: FlaskConical,color: "#0891b2", bg: "#cffafe" },
  { icon: Scan,        color: "#dc2626", bg: "#fee2e2" },
  { icon: Sparkles,    color: "#f59e0b", bg: "#fef9c3" },
  { icon: Headphones,  color: "#0d9488", bg: "#ccfbf1" },
  { icon: Speaker,     color: "#9333ea", bg: "#f3e8ff" },
  { icon: Film,        color: "#d97706", bg: "#fef3c7" },
] as const;

function BenchmarkCompareModal({ items, onClose }: { items: BenchmarkItem[], onClose: () => void }) {
  const { data: data1, loading: load1 } = useBenchmarkDetail(items[0]?.slug ?? "");
  const { data: data2, loading: load2 } = useBenchmarkDetail(items[1]?.slug ?? "");

  const meta1 = items[0] ? getMeta(items[0].name) : null;
  const meta2 = items[1] ? getMeta(items[1].name) : null;

  // Log payload structure to DevTools console for easy inspection
  useEffect(() => {
    if (data1 || data2) {
      console.log("Benchmark 1 payload:", data1);
      console.log("Benchmark 2 payload:", data2);
    }
  }, [data1, data2]);

  // Universal array extractor regardless of backend key name
  const extractList = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.rankings)) return data.rankings;
    if (Array.isArray(data.evaluations)) return data.evaluations;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.leaderboard)) return data.leaderboard;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  // Extract model name from any potential object property
  const extractName = (r: any): string => {
    if (!r) return "";
    if (typeof r === 'string') return r;
    const entity = r.paper || r.model || r.method || r.system || r;
    if (typeof entity === 'string') return entity;
    return entity?.title || entity?.name || entity?.model_name || entity?.modelName || r?.modelName || r?.model || r?.title || r?.name || "";
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

const overlapping = useMemo(() => {
    const list1 = extractList(data1);
    const list2 = extractList(data2);

    if (list1.length === 0 || list2.length === 0) return [];

    const overlap: any[] = [];

    // Positional alignment fallback when exact model identifiers differ across benchmark sources
    list1.forEach((r1: any, idx: number) => {
      const r2 = list2[idx]; // Grab the exact same row from Benchmark 2

      if (r2) {
        const rank1 = typeof r1.rank === 'number' ? r1.rank : (r1.position ?? idx + 1);
        const rank2 = typeof r2.rank === 'number' ? r2.rank : (r2.position ?? idx + 1);

        const title1 = r1.paper?.title || extractName(r1) || r1.model_name || r1.name || `Model ${idx + 1}`;
        // Clean up the title for the UI (removes the benchmark name prefix if it exists)
        const cleanTitle = title1.replace(/^.*?: /, ""); 

        overlap.push({
          entity: r1.paper || r1,
          rank1,
          rank2,
          displayName: cleanTitle
        });
      }
    });

    return overlap.sort((a, b) => a.rank1 - b.rank1);
  }, [data1, data2]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-none border border-gray-900 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[#F55036]" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Benchmark Comparison</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-none transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {load1 || load2 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F55036]" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            
            {/* Top Stats Comparison */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4 border-2 border-gray-100 p-5 rounded-none relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-400 uppercase">Benchmark A</div>
                <h3 className="text-2xl font-black text-gray-900">{items[0].name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 block text-xs">Domain</span><span className="font-semibold">{meta1?.category}</span></div>
                  <div><span className="text-gray-500 block text-xs">Task</span><span className="font-semibold">{meta1?.task}</span></div>
                  <div><span className="text-gray-500 block text-xs">Metric</span><span className="font-mono bg-gray-100 px-1 py-0.5">{meta1?.metric}</span></div>
                  <div><span className="text-gray-500 block text-xs">Status</span><span className="font-semibold">{meta1?.status}</span></div>
                </div>
              </div>

              <div className="space-y-4 border-2 border-gray-100 p-5 rounded-none relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-400 uppercase">Benchmark B</div>
                <h3 className="text-2xl font-black text-gray-900">{items[1].name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500 block text-xs">Domain</span><span className="font-semibold">{meta2?.category}</span></div>
                  <div><span className="text-gray-500 block text-xs">Task</span><span className="font-semibold">{meta2?.task}</span></div>
                  <div><span className="text-gray-500 block text-xs">Metric</span><span className="font-mono bg-gray-100 px-1 py-0.5">{meta2?.metric}</span></div>
                  <div><span className="text-gray-500 block text-xs">Status</span><span className="font-semibold">{meta2?.status}</span></div>
                </div>
              </div>
            </div>

            {/* Overlap Table */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                Overlapping Models <span className="text-sm font-normal text-gray-500 ml-2">({overlapping.length} evaluated on both)</span>
              </h4>
              
              {overlapping.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 border border-gray-100">
                  <p className="text-gray-500">No overlapping models found between these two benchmarks.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-none overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-200">Model / Paper</th>
                        <th className="px-4 py-3 border-b border-gray-200 border-l border-gray-200 w-32">{items[0].name} Rank</th>
                        <th className="px-4 py-3 border-b border-gray-200 border-l border-gray-200 w-32">{items[1].name} Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {overlapping.map(o => {
                      return (
                        <tr key={o.entity?.id || o.entity?.slug || o.displayName} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{o.displayName}</td>
                          <td className="px-4 py-3 border-l border-gray-100 font-mono">#{o.rank1}</td>
                          <td className="px-4 py-3 border-l border-gray-100 font-mono">#{o.rank2}</td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

function BenchmarksContent() {
  const router = useRouter();
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const searchParams = useSearchParams();
  const directoryRef = useRef<HTMLDivElement>(null);

  const [benchmarks, setBenchmarks]   = useState<BenchmarkItem[]>(() => getCachedBenchmarksSync() ?? []);
  const [loading, setLoading]         = useState(() => !(benchmarks && benchmarks.length > 0));
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [taskFilter, setTaskFilter]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter]     = useState<string | null>(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSubmitted, setSubmitSubmitted] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: "", datasetUrl: "", paperUrl: "", description: "" });

  const [compareItems, setCompareItems] = useState<BenchmarkItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompare = (e: React.MouseEvent, b: BenchmarkItem) => {
    e.stopPropagation();
    setCompareItems(prev => {
      if (prev.find(item => item.id === b.id)) return prev.filter(item => item.id !== b.id);
      if (prev.length >= 2) return [prev[1], b];
      return [...prev, b];
    });
  };

  useEffect(() => {
    const domainParam = searchParams.get("domain");
    const taskParam = searchParams.get("task");

    if (domainParam) setDomainFilter(domainParam);
    if (taskParam) setTaskFilter(taskParam);
  }, [searchParams]);

  useEffect(() => {
    getBenchmarks()
      .then((data) => {
        setBenchmarks(data);
        prefetchBenchmarkList(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const stats = useMemo(() => ({
    domains:    DOMAINS.length,
    benchmarks: benchmarks.length,
    results:    benchmarks.reduce((s, b) => s + (b._count?.rankings ?? 0), 0),
  }), [benchmarks]);

  // Popular benchmarks matched from API
  const popularBenchmarks = useMemo(() =>
    POPULAR_BENCHMARK_NAMES.map(name => {
      const found = benchmarks.find(b =>
        b.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(b.name.toLowerCase())
      );
      return found ?? { id: name, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), _count: { rankings: 0, claims: 0 } };
    }),
  [benchmarks]);

  // Recently added = first 8 from API
  const recentlyAdded = useMemo(() => benchmarks.slice(0, 8), [benchmarks]);

  // Trending = top 8 by results
  const trending = useMemo(() =>
    [...benchmarks].sort((a, b) => (b._count?.rankings ?? 0) - (a._count?.rankings ?? 0)).slice(0, 8),
  [benchmarks]);

// Directory filtered data - Robust URL & State Synchronization
  const directoryData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const domainParam = searchParams.get("domain");
    const taskParam = searchParams.get("task");

    const activeDomain = domainFilter || domainParam;
    const activeTask = taskFilter || taskParam;
    
    const hasActiveFilters = Boolean(activeDomain || activeTask || statusFilter || yearFilter || q);

    return benchmarks.filter(b => {
      const meta = getMeta(b.name);
      const bNameLower = (b.name || "").toLowerCase();

      // RULE 1: If NO filters are active, restrict to core comparable benchmarks
      if (!hasActiveFilters) {
        const isCore = COMPARABLE_BENCHMARKS.some(cb => bNameLower.includes(cb.toLowerCase()));
        if (!isCore) return false;
      }

      // RULE 2: Case-insensitive Domain & Task filters checking both state and URL params
      if (activeDomain && meta.category.toLowerCase() !== activeDomain.toLowerCase()) return false;
      if (activeTask && !meta.task.toLowerCase().includes(activeTask.toLowerCase()) && meta.category.toLowerCase() !== activeTask.toLowerCase()) return false;
      if (statusFilter && meta.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (yearFilter && meta.year !== yearFilter) return false;

      // RULE 3: Search query filter
      if (q) {
        return (
          bNameLower.includes(q) ||
          (b.slug || "").toLowerCase().includes(q) ||
          meta.task.toLowerCase().includes(q) ||
          meta.metric.toLowerCase().includes(q) ||
          meta.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [benchmarks, searchQuery, domainFilter, taskFilter, statusFilter, yearFilter, searchParams]);

  const scrollToDirectory = (domain?: string) => {
    if (domain) setDomainFilter(domain);
    directoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrefetch = (slug: string) => {
    if (slug) {
      router.prefetch(`/benchmarks/${slug}`);
      prefetchBenchmarkDetail(slug);
    }
  };

  const handleItemClick = (slug: string) => {
    handlePrefetch(slug);
    router.push(`/benchmarks/${slug}`);
  };

  const clearFilters = () => {
    setDomainFilter(null);
    setTaskFilter(null);
    setStatusFilter(null);
    setYearFilter(null);
    setSearchQuery("");
    router.push("/benchmarks");
  };

  const activeFilterCount = [domainFilter, taskFilter, statusFilter, yearFilter].filter(Boolean).length;
  const isCategoryView = !!(domainFilter || taskFilter);

  const BenchmarkCard = ({ b, index }: { b: BenchmarkItem; index: number }) => {
    const meta = getMeta(b.name);
    const { icon: Icon, color } = POPULAR_ICON_POOL[index % POPULAR_ICON_POOL.length];
    return (
      <div
        onClick={() => handleItemClick(b.slug)}
        onMouseEnter={() => handlePrefetch(b.slug)}
        onTouchStart={() => handlePrefetch(b.slug)}
        onFocus={() => handlePrefetch(b.slug)}
        className="bg-white border border-gray-100 rounded-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group flex flex-col h-[180px] p-5 w-full"
      >
        <div className="flex items-start gap-2.5 mb-2">
          <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
            <Icon size={24} style={{ color }} />
          </div>
          <h3 className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 line-clamp-1">{b.name}</h3>
        </div>
        <div className="text-[13px] text-gray-500 leading-normal h-[3.75rem] overflow-hidden flex flex-col justify-between">
          <span className="truncate">Task: {meta.task}</span>
          <span className="truncate">Domain: {meta.category}</span>
          <span className="truncate">Status: {meta.status}</span>
        </div>
        <div className="pt-2 mt-auto border-t border-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Metric: {meta.metric}</span>
          <span className="text-[10px] text-gray-400 font-mono">{meta.year}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`${atlasUiFont.className} flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-slate-800 tracking-normal`}>
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <main
          id="scroll-container"
          className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll scroll-smooth"
        >
          <div className="w-full max-w-[1370px] mx-auto px-5 md:px-10 lg:px-16 xl:px-24 pt-6 pb-12">
            
            {/* ══ HERO SECTION — responsive image scales to ~1/3 hero height ══ */}
            <PageHero
  breadcrumb="Benchmarks"
  title="All"
  highlight="Benchmarks"
  description="Discover benchmark datasets, evaluation metrics, and state-of-the-art results used to measure AI systems across language, reasoning, and more."
  stats={[
    {
      value: loading ? "—" : stats.domains,
      label: "Domains",
    },
    {
      value: loading ? "—" : stats.benchmarks,
      label: "Benchmarks",
    },
    {
      value: loading ? "—" : stats.results,
      label: "Evaluations",
    },
  ]}
  action={
  <button
    onClick={() => setShowSubmitModal(true)}
    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#F55036] hover:bg-[#e0432b] active:scale-[0.97] rounded-full shadow-sm transition-all cursor-pointer"
  >
    <Plus size={16} />
    Submit Benchmark
  </button>
}
/>

            {/* ══ CONTENT TWO-COLUMN LAYOUT (Preserved sidebar layout) ══ */}
            <div className="flex gap-8 mt-6 md:mt-10">
              
              {/* Left Sticky Sidebar (w-64) */}
              <SectionSidebar
  title="Benchmarks"
  items={DOMAINS.map((domain) => ({
    label: domain.label,
    active: domainFilter === domain.label,
    onClick: () =>
      router.push(`/benchmarks?domain=${encodeURIComponent(domain.label)}`),
  }))}
/>

              {/* Right Scrolling Content */}
              <div className="flex-1 min-w-0 space-y-8">
                
                {/* 👇 THIS WRAPS SECTIONS 2-7 TO HIDE THEM WHEN FILTERED 👇 */}
                {!isCategoryView && (
                  <>
                    {/* ══ 2. BROWSE BY DOMAIN ══ */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">Domains</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {DOMAINS.map(({ label, icon: Icon, color, desc }) => (
                          <button
                            key={label}
                            onClick={() => router.push(`/benchmarks?domain=${encodeURIComponent(label)}`)}
                            className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group text-left flex flex-col h-[180px] w-full cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 mb-2">
                              <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Icon size={24} style={{ color }} />
                              </div>
                              <span className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 line-clamp-1">{label}</span>
                            </div>
                            <p className="text-[13px] text-gray-500 leading-normal overflow-hidden h-[3.75rem]">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* ══ 3. BROWSE BY TASK ══ */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {TASKS.map(({ label, icon: Icon, color, bg, desc }) => (
                        <button
                          key={label}
                          onClick={() => router.push(`/benchmarks?task=${encodeURIComponent(label)}`)}
                          className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group text-left flex flex-col h-[180px] w-full cursor-pointer"
                        >
                            <div className="flex items-start gap-2.5 mb-2">
                              <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Icon size={24} style={{ color }} />
                              </div>
                              <span className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 group-hover:text-[#FF5A1F] transition-colors line-clamp-1">{label}</span>
                            </div>
                            <p className="text-[13px] text-gray-500 leading-normal overflow-hidden h-[3.75rem]">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* ══ 4. BENCHMARK COLLECTIONS ══ */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">Benchmark Collections</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {COLLECTIONS.map(({ label, icon: Icon, color, bg, desc }) => (
                          <button
                            key={label}
                            onClick={() => router.push(`/benchmarks?domain=${encodeURIComponent(label)}`)}
                            className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group text-left flex flex-col h-[180px] w-full cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 mb-2">
                              <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Icon size={24} style={{ color }} />
                              </div>
                              <span className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 line-clamp-1">{label}</span>
                            </div>
                            <p className="text-[13px] text-gray-500 leading-normal overflow-hidden h-[3.75rem]">{desc}</p>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Each collection shows all related benchmarks in the directory below.</p>
                    </section>

                    {/* ══ 5. POPULAR BENCHMARKS ══ */}
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Star size={18} className="text-amber-500" />
                        <h2 className="text-xl font-bold text-gray-800">Popular Benchmarks</h2>
                      </div>
                      {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-sm p-5 min-h-[130px] animate-pulse">
                              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                              <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
                          {popularBenchmarks.slice(0, 12).map((b, idx) => <BenchmarkCard key={`${b.id}-${idx}`} b={b} index={idx} />)}
                        </div>
                      )}
                    </section>

                    {/* ══ 6. RECENTLY ADDED ══ */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-[#0284c7]" />
                        <h2 className="text-xl font-bold text-gray-800">Recently Added</h2>
                      </div>
                      {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-sm p-5 min-h-[130px] animate-pulse">
                              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                              <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {recentlyAdded.map((b, idx) => {
                            const meta = getMeta(b.name);
                            const { icon: Icon, color, bg } = RECENT_ICON_POOL[idx % RECENT_ICON_POOL.length];
                            return (
                              <div
                                key={b.id}
                                onClick={() => handleItemClick(b.slug)}
                                onMouseEnter={() => handlePrefetch(b.slug)}
                                onTouchStart={() => handlePrefetch(b.slug)}
                                onFocus={() => handlePrefetch(b.slug)}
                                className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md cursor-pointer group transition-all flex flex-col h-[180px]"
                              >
                                <div className="flex items-start gap-2.5 mb-2">
                                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Icon size={24} style={{ color }} />
                                  </div>
                                  <h3 className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 line-clamp-1">{b.name}</h3>
                                </div>
                                <div className="text-[13px] text-gray-500 leading-normal h-[3.75rem] overflow-hidden flex flex-col justify-between">
                                  <span className="truncate">Task: {meta.task}</span>
                                  <span className="truncate">Domain: {meta.category}</span>
                                  <span className="truncate">Status: {meta.status}</span>
                                </div>
                                <div className="pt-2 mt-auto border-t border-gray-50 flex items-center justify-between">
                                  <span className="text-[11px] text-gray-400">Metric: {meta.metric}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{meta.year}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    {/* ══ 7. TRENDING BENCHMARKS ══ */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Flame size={18} className="text-[#e11d48]" />
                        <h2 className="text-xl font-bold text-gray-800">Trending Benchmarks</h2>
                      </div>
                      {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-sm p-5 min-h-[130px] animate-pulse">
                              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                              <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {trending.map((b, idx) => {
                            const meta = getMeta(b.name);
                            const { icon: Icon, color, bg } = TRENDING_ICON_POOL[idx % TRENDING_ICON_POOL.length];
                            return (
                              <div
                                key={b.id}
                                onClick={() => handleItemClick(b.slug)}
                                onMouseEnter={() => handlePrefetch(b.slug)}
                                onTouchStart={() => handlePrefetch(b.slug)}
                                onFocus={() => handlePrefetch(b.slug)}
                                className="bg-white border border-gray-100 rounded-sm p-5 hover:shadow-md cursor-pointer group transition-all flex flex-col h-[180px]"
                              >
                                <div className="flex items-start gap-2.5 mb-2">
                                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Icon size={24} style={{ color }} />
                                  </div>
                                  <h3 className="font-semibold text-gray-800 text-[15px] leading-snug pt-0.5 flex-1 min-w-0 line-clamp-1">{b.name}</h3>
                                </div>
                                <div className="text-[13px] text-gray-500 leading-normal h-[3.75rem] overflow-hidden flex flex-col justify-between">
                                  <span className="truncate">Task: {meta.task}</span>
                                  <span className="truncate">Domain: {meta.category}</span>
                                  <span className="truncate">Status: {meta.status}</span>
                                </div>
                                <div className="pt-2 mt-auto border-t border-gray-50 flex items-center justify-between">
                                  <span className="text-[11px] text-gray-400">Metric: {meta.metric}</span>
                                  <span className="text-[12px] font-bold text-[#FF5A1F] font-mono tabular-nums">{b._count?.rankings ?? 0} results</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </>
                )}
                {/* 👆 THIS IS THE END OF THE HIDDEN SECTIONS 👆 */}

                {/* ══ 8. BENCHMARK DIRECTORY ══ */}
                <section ref={directoryRef} className="scroll-mt-6">
                  {isCategoryView && (
                    <button 
                      onClick={clearFilters}
                      className="mb-4 text-sm font-semibold text-[#e11d48] hover:underline flex items-center gap-1"
                    >
                      ← Back to all Benchmarks
                    </button>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <SlidersHorizontal size={18} className="text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-800">Benchmark Directory</h2>
                    <span className="text-gray-400 text-sm font-mono">{directoryData.length} benchmarks</span>
                  </div>

                  {/* Filter bar */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-center">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search benchmarks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 bg-gray-50 transition-colors"
                        />
                      </div>

                      {/* Toggle advanced filters */}
                      <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                      >
                        <Filter size={14} />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {activeFilterCount}
                          </span>
                        )}
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                      </button>

                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <X size={13} /> Clear
                        </button>
                      )}
                    </div>

                    {/* Advanced filters */}
                    {showFilters && (
                      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                        {/* Domain */}
                        <select
                          value={domainFilter ?? ""}
                          onChange={e => setDomainFilter(e.target.value || null)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-rose-400 text-gray-700"
                        >
                          <option value="">All Domains</option>
                          {DOMAINS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                        </select>

                        {/* Task */}
                        <select
                          value={taskFilter ?? ""}
                          onChange={e => setTaskFilter(e.target.value || null)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-rose-400 text-gray-700"
                        >
                          <option value="">All Tasks</option>
                          {TASKS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                        </select>

                        {/* Status */}
                        <select
                          value={statusFilter ?? ""}
                          onChange={e => setStatusFilter(e.target.value || null)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-rose-400 text-gray-700"
                        >
                          <option value="">All Statuses</option>
                          {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Year */}
                        <select
                          value={yearFilter ?? ""}
                          onChange={e => setYearFilter(e.target.value || null)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-rose-400 text-gray-700"
                        >
                          <option value="">All Years</option>
                          {["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2014", "2012"].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Active filter pills */}
                    {activeFilterCount > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {domainFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e11d48]/10 text-[#e11d48] text-xs font-medium rounded-full">
                            Domain: {domainFilter}
                            <button onClick={() => setDomainFilter(null)}><X size={10} /></button>
                          </span>
                        )}
                        {taskFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0284c7]/10 text-[#0284c7] text-xs font-medium rounded-full">
                            Task: {taskFilter}
                            <button onClick={() => setTaskFilter(null)}><X size={10} /></button>
                          </span>
                        )}
                        {statusFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter(null)}><X size={10} /></button>
                          </span>
                        )}
                        {yearFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Year: {yearFilter}
                            <button onClick={() => setYearFilter(null)}><X size={10} /></button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Table */}
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-sm p-5 h-[140px] animate-pulse">
                          <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                          <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : directoryData.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                      <Search size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No benchmarks match your filters.</p>
                      <button onClick={clearFilters} className="mt-3 text-[#e11d48] text-sm hover:underline">Clear filters</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/60 ${isComparing ? 'bg-orange-50/50' : ''}">
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Benchmark</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Task</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Category</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Metric</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden xl:table-cell">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden xl:table-cell">Year</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Results</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Compare</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {directoryData.map((b) => {
                            const meta = getMeta(b.name);
                            const cfg = STATUS_CFG[meta.status] ?? STATUS_CFG["Unmapped"];
                            const Icon = getCategoryIcon(meta.category);
                            const color = getCategoryColor(meta.category);
                            const isComparing = compareItems.some(i => i.id === b.id);
                            return (
                              <tr
                                key={b.id}
                                onClick={() => handleItemClick(b.slug)}
                                onMouseEnter={() => handlePrefetch(b.slug)}
                                onTouchStart={() => handlePrefetch(b.slug)}
                                onFocus={() => handlePrefetch(b.slug)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors group"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-md flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: color + "18" }}>
                                      <Icon size={13} style={{ color }} />
                                    </div>
                                    <span className="font-medium text-gray-800 group-hover:text-[#e11d48] transition-colors">{b.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{meta.task}</td>
                                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{meta.category}</td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 text-gray-600 text-[11px]">{meta.metric}</span>
                                </td>
                                <td className="px-4 py-3 hidden xl:table-cell">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                    <span className="w-1 h-1 rounded-full" style={{ background: cfg.color }} />
                                    {meta.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{meta.year}</td>
                                <td className="px-4 py-3 text-right font-bold text-[#e11d48] font-mono text-xs">{b._count?.rankings ?? 0}</td>

                                <td className="px-4 py-3 text-right">
                                <button
                                  onClick={(e) => toggleCompare(e, b)}
                                  className={`p-2 rounded-none border transition-colors ${
                                    isComparing ? "bg-[#F55036] border-[#F55036] text-white" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                                  }`}
                                  title="Compare"
                                >
                                  <Scale size={14} />
                                </button>
                              </td>
                              
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* ══ 9. FOOTER CTA ══ */}
                <section className="py-8 text-center border-t border-gray-100">
                  <div className="max-w-xl mx-auto space-y-4">
                    <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight">
                      Missing a benchmark?
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Submit a benchmark or contribute evaluation results to help keep Frontier Atlas up to date.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                      >
                        <Plus size={14} /> Submit Benchmark
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Floating Compare Bar */}
      {compareItems.length > 0 && !showCompareModal && (
        <div className="fixed bottom-0 left-0 right-0 bg-white text-gray-900 p-4 flex items-center justify-between z-40 border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom">
          <div className="flex items-center gap-4">
            <Scale size={20} className="text-[#F55036] hidden sm:block" />
            <div className="flex items-center gap-3">
              {compareItems.map((b) => (
                <span key={b.id} className="font-semibold text-sm bg-gray-100 text-gray-900 px-3 py-1 rounded-none border border-gray-200">
                  {b.name}
                </span>
              ))}
              {compareItems.length === 1 && (
                <span className="text-gray-500 text-sm italic">Select 1 more to compare...</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setCompareItems([])} className="text-sm font-medium text-gray-500 hover:text-gray-900 px-2">
              Clear
            </button>
            <button
              disabled={compareItems.length < 2}
              onClick={() => setShowCompareModal(true)}
              className="bg-[#F55036] hover:bg-[#e0432b] disabled:bg-gray-200 disabled:text-gray-400 text-white px-6 py-2.5 text-sm font-bold rounded-none uppercase transition-colors"
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareItems.length === 2 && (
        <BenchmarkCompareModal items={compareItems} onClose={() => setShowCompareModal(false)} />
      )}

      {/* ══ SUBMIT BENCHMARK MODAL ══ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E0] relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowSubmitModal(false);
                setSubmitSubmitted(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            {submitSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-gray-900">Benchmark Submitted!</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Thank you for submitting <strong>{submitForm.name || "your benchmark"}</strong>. Our team will review and index it shortly.
                </p>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmitSubmitted(false);
                    setSubmitForm({ name: "", datasetUrl: "", paperUrl: "", description: "" });
                  }}
                  className="mt-4 px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!submitForm.name.trim()) return;
                  setSubmitSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Submit a Benchmark</h3>
                  <p className="text-xs text-gray-500">Provide details about the new benchmark or dataset.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Benchmark Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CodeEval-2025"
                      value={submitForm.name}
                      onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Paper URL / arXiv ID</label>
                    <input
                      type="text"
                      placeholder="https://arxiv.org/abs/2401.xxxxx"
                      value={submitForm.paperUrl}
                      onChange={(e) => setSubmitForm({ ...submitForm, paperUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dataset / Repo URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={submitForm.datasetUrl}
                      onChange={(e) => setSubmitForm({ ...submitForm, datasetUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe the task, evaluation metric, or domain..."
                      value={submitForm.description}
                      onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#F55036] hover:bg-[#e0432b] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default function BenchmarksPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#F8F7F2]" />}>
      <BenchmarksContent />
    </Suspense>
  );
}