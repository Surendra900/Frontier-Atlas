export function slugifyTaxonomy(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

const SLUG_MAP: Record<string, string> = {
  "transformers": "transformer",
  "transformer": "transformer",
  "mixture of experts": "mixture-of-experts",
  "moe": "mixture-of-experts",
  "mixture-of-experts": "mixture-of-experts",
  "chain-of-thought (cot)": "chain-of-thought",
  "cot": "chain-of-thought",
  "model context protocol (mcp)": "mcp",
  "model context protocol": "mcp",
  "swe-bench": "swe-bench-verified",
  "vqa": "vqa-v2",
};

const KNOWN_MODELS = new Set([
  "gpt-4", "gpt-4o", "gpt-3-5-turbo", "claude-3-5-sonnet", "gemini-1-5-pro",
  "llama-3", "llama-2", "mistral-7b", "mixtral", "qwen-2-5", "deepseek-v3",
  "deepseek-r1", "flux-1", "stable-diffusion-3", "whisper-v3", "sora",
  "grok-2", "phi-3", "gemma", "vicuna", "alpaca", "chatglm", "yolov8", "sam-2", "clip"
]);

const KNOWN_DATASETS = new Set([
  "imagenet", "coco", "squad", "openwebtext", "c4", "pile", "wikitext",
  "sharegpt", "ultrafeedback", "lmsys-chat-1m", "commoncrawl", "laion",
  "redpajama", "fineweb"
]);

const KNOWN_BENCHMARKS = new Set([
  "mmlu", "gsm8k", "humaneval", "math", "swe-bench", "swe-bench-verified",
  "arc-challenge", "hellaswag", "truthfulqa", "winogrande", "drop",
  "big-bench", "arena-hard", "mt-bench", "bbh", "chartqa", "docvqa",
  "ocrbench", "ocrbench-v2", "omnidoc", "vqa-v2", "coco-detection"
]);

const KNOWN_METHODS = new Set([
  "transformer", "diffusion-models", "mixture-of-experts", "policy-learning",
  "chain-of-thought", "rag", "mcp", "lora", "rlhf", "dpo", "language",
  "pre-training", "fine-tuning", "instruction-tuning", "attention", "embeddings",
  "tokenization", "distillation", "mamba", "state-space-models", "autoencoders",
  "gan", "generative-adversarial-networks", "positional-encoding", "feedforward-networks",
  "activation-functions", "normalization", "residual-connections", "pooling",
  "convolution", "curriculum-learning", "multi-task-learning", "continual-learning",
  "teacher-forcing", "reward-modeling", "constitutional-ai", "ai-feedback",
  "prompting", "planning", "search", "reflection"
]);

const KNOWN_TASKS = new Set([
  "large-language-models", "small-language-models", "language-modeling",
  "agents", "reasoning", "vision-language-models", "multimodal-models",
  "world-models", "image-generation", "automatic-speech-recognition", "robotics",
  "computer-vision", "ocr", "document-understanding", "autonomous-driving",
  "anomaly-detection", "deepfake-forensics", "embedding-models", "omni-models",
  "remote-sensing", "scene-text-recognition", "reasoning-models", "long-context-models",
  "efficient-training", "model-alignment", "coding-agents", "computer-use-agents",
  "browser-agents", "research-agents", "multi-agent-systems", "tool-calling",
  "agent-memory", "agent-planning", "workflow-automation", "image-understanding",
  "instruction-following"
]);

export function getTaxonomyHref(
  label: string,
  defaultType: "task" | "method" | "model" | "dataset" | "benchmark" | "author" = "task"
): string {
  if (!label) return "/";

  const rawClean = label.trim();
  const lower = rawClean.toLowerCase();

  let slug = slugifyTaxonomy(rawClean);

  if (SLUG_MAP[lower] || SLUG_MAP[slug]) {
    slug = SLUG_MAP[lower] || SLUG_MAP[slug];
  }

  if (KNOWN_MODELS.has(slug)) return `/models/${slug}`;
  if (KNOWN_BENCHMARKS.has(slug)) return `/benchmarks/${slug}`;
  if (KNOWN_DATASETS.has(slug)) return `/datasets/${slug}`;
  if (KNOWN_METHODS.has(slug)) return `/methods/${slug}`;
  if (KNOWN_TASKS.has(slug)) return `/tasks/${slug}`;

  if (defaultType === "method") return `/methods/${slug}`;
  if (defaultType === "model") return `/models/${slug}`;
  if (defaultType === "dataset") return `/datasets/${slug}`;
  if (defaultType === "benchmark") return `/benchmarks/${slug}`;
  if (defaultType === "author") return `/authors/${slug}`;

  return `/tasks/${slug}`;
}
