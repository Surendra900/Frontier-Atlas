/**
 * Frontier Atlas - Authoritative Models Contract
 * Single source of truth for:
 * 1. Card Slug -> Database Query Contract
 * 2. Faceted Taxonomy Mapping (Capabilities, Families, Categories, Modalities)
 * 3. Human-readable titles & descriptions for card landing pages
 */

export interface CardContract {
  slug: string;
  title: string;
  type: "curated" | "capability" | "family" | "vendor" | "category" | "modality" | "research_area" | "generic";
  description: string;
  // Explicit DB filter contract
  filters: {
    vendor?: string;
    family?: string;
    category?: string;
    capability?: string;
    capabilitiesAny?: string[];
    modality?: string;
    openness?: "open_weights" | "proprietary";
    sort?: "trending" | "newest" | "name" | "price_asc" | "price_desc";
    nameKeyword?: string;
  };
}

// Static registry of all known cards on the /models hub and navigation
const CARD_CONTRACTS: Record<string, CardContract> = {
  // --- Curated & System Sections ---
  all: {
    slug: "all",
    title: "All Models",
    type: "curated",
    description: "Comprehensive catalog of foundation models, fine-tunes, and specialized AI systems.",
    filters: {},
  },
  models: {
    slug: "models",
    title: "All Models",
    type: "curated",
    description: "Comprehensive catalog of foundation models, fine-tunes, and specialized AI systems.",
    filters: {},
  },
  trending: {
    slug: "trending",
    title: "Trending Models",
    type: "curated",
    description: "Most popular, actively used, and high-velocity models across research and industry.",
    filters: { sort: "trending" },
  },
  recent: {
    slug: "recent",
    title: "Recently Released Models",
    type: "curated",
    description: "Latest foundation models, architectures, and checkpoints released to the AI community.",
    filters: { sort: "newest" },
  },
  "recently-released": {
    slug: "recently-released",
    title: "Recently Released Models",
    type: "curated",
    description: "Latest foundation models, architectures, and checkpoints released to the AI community.",
    filters: { sort: "newest" },
  },
  "open-weights": {
    slug: "open-weights",
    title: "Open Weights Models",
    type: "curated",
    description: "Open-weight and community-licensed models available for download and private hosting.",
    filters: { openness: "open_weights" },
  },
  open: {
    slug: "open",
    title: "Open Weights Models",
    type: "curated",
    description: "Open-weight and community-licensed models available for download and private hosting.",
    filters: { openness: "open_weights" },
  },
  proprietary: {
    slug: "proprietary",
    title: "Proprietary Models",
    type: "curated",
    description: "Commercial API and enterprise frontier models accessible via cloud providers.",
    filters: { openness: "proprietary" },
  },

  // --- Capabilities (Matching /models Capabilities Section) ---
  "general-purpose": {
    slug: "general-purpose",
    title: "General Purpose Models",
    type: "capability",
    description: "Versatile foundation models for general reasoning, text generation, and problem solving.",
    filters: { capability: "general-purpose" },
  },
  chat: {
    slug: "chat",
    title: "Chat Models",
    type: "capability",
    description: "Conversational language models fine-tuned for multi-turn dialogue and helpful assistance.",
    filters: { capability: "chat" },
  },
  "instruction-following": {
    slug: "instruction-following",
    title: "Instruction Following Models",
    type: "capability",
    description: "Models specifically aligned to strictly follow complex, multi-step instructions.",
    filters: { capability: "instruction-following" },
  },
  reasoning: {
    slug: "reasoning",
    title: "Reasoning Models",
    type: "capability",
    description: "Advanced architectures built for deep chain-of-thought, mathematical deduction, and logic.",
    filters: { capability: "reasoning" },
  },
  coding: {
    slug: "coding",
    title: "Coding & Software Engineering Models",
    type: "capability",
    description: "Models optimized for code generation, software engineering, refactoring, and agentic coding.",
    filters: { capability: "coding" },
  },
  code: {
    slug: "code",
    title: "Coding & Software Engineering Models",
    type: "capability",
    description: "Models optimized for code generation, software engineering, refactoring, and agentic coding.",
    filters: { capability: "coding" },
  },
  multimodal: {
    slug: "multimodal",
    title: "Multimodal Models",
    type: "capability",
    description: "Models capable of processing and generating combinations of text, images, video, and audio.",
    filters: { capability: "multimodal" },
  },
  "computer-vision": {
    slug: "computer-vision",
    title: "Computer Vision Models",
    type: "capability",
    description: "Visual perception models for classification, object detection, segmentation, and captioning.",
    filters: { capability: "computer-vision" },
  },
  vision: {
    slug: "vision",
    title: "Computer Vision Models",
    type: "capability",
    description: "Visual perception models for classification, object detection, segmentation, and captioning.",
    filters: { capability: "computer-vision" },
  },
  translation: {
    slug: "translation",
    title: "Translation Models",
    type: "capability",
    description: "Multilingual models engineered for high-accuracy translation across global languages.",
    filters: { capability: "translation" },
  },
  audio: {
    slug: "audio",
    title: "Audio & Speech Models",
    type: "capability",
    description: "State-of-the-art architectures for speech-to-text transcription, audio generation, and voice synthesis.",
    filters: { capability: "audio" },
  },
  speech: {
    slug: "speech",
    title: "Audio & Speech Models",
    type: "capability",
    description: "State-of-the-art architectures for speech-to-text transcription, audio generation, and voice synthesis.",
    filters: { capability: "audio" },
  },
  "document-ai": {
    slug: "document-ai",
    title: "Document AI Models",
    type: "capability",
    description: "Specialized models for parsing, understanding, and extracting structured information from complex documents and PDFs.",
    filters: { capability: "document-ai" },
  },
  ocr: {
    slug: "ocr",
    title: "OCR & Document Text Recognition",
    type: "capability",
    description: "Optical character recognition architectures capable of reading scanned and handwriting text.",
    filters: { capability: "document-ai" },
  },
  "tool-use": {
    slug: "tool-use",
    title: "Tool Use & Function Calling Models",
    type: "capability",
    description: "Models with native support for structured outputs, function calling, and external API invocation.",
    filters: { capability: "tool-use" },
  },
  tools: {
    slug: "tools",
    title: "Tool Use & Function Calling Models",
    type: "capability",
    description: "Models with native support for structured outputs, function calling, and external API invocation.",
    filters: { capability: "tool-use" },
  },
  planning: {
    slug: "planning",
    title: "Planning & Workflow Models",
    type: "capability",
    description: "Architectures designed for multi-stage planning, scheduling, and strategic reasoning.",
    filters: { capability: "agentic-ai" },
  },
  agents: {
    slug: "agents",
    title: "Agentic AI Models",
    type: "capability",
    description: "Goal-oriented autonomous agents that execute multi-step workflows, web browsing, and computer use.",
    filters: { capability: "agentic-ai" },
  },
  "agentic-ai": {
    slug: "agentic-ai",
    title: "Agentic AI Models",
    type: "capability",
    description: "Goal-oriented autonomous agents that execute multi-step workflows, web browsing, and computer use.",
    filters: { capability: "agentic-ai" },
  },
  search: {
    slug: "search",
    title: "Search & Retrieval Models",
    type: "capability",
    description: "Dense vector embeddings, re-rankers, and models optimized for retrieval-augmented generation (RAG).",
    filters: { capability: "embeddings" },
  },
  mathematics: {
    slug: "mathematics",
    title: "Mathematics & Symbolic Reasoning",
    type: "capability",
    description: "Models trained for competitive mathematics, theorem proving, and symbolic calculation.",
    filters: { capability: "mathematics" },
  },
  math: {
    slug: "math",
    title: "Mathematics & Symbolic Reasoning",
    type: "capability",
    description: "Models trained for competitive mathematics, theorem proving, and symbolic calculation.",
    filters: { capability: "mathematics" },
  },
  embeddings: {
    slug: "embeddings",
    title: "Embedding & Representation Models",
    type: "capability",
    description: "High-dimensional embedding models for semantic similarity, clustering, and vector search.",
    filters: { capability: "embeddings" },
  },
  healthcare: {
    slug: "healthcare",
    title: "Healthcare & Medical AI",
    type: "capability",
    description: "Biomedical foundation models fine-tuned on clinical notes, medical literature, and diagnostic benchmarks.",
    filters: { capability: "healthcare" },
  },
  robotics: {
    slug: "robotics",
    title: "Robotics & Embodied AI",
    type: "capability",
    description: "Vision-Language-Action (VLA) and embodied models for physical robot manipulation and navigation.",
    filters: { capability: "robotics" },
  },
  "embodied-ai": {
    slug: "embodied-ai",
    title: "Robotics & Embodied AI",
    type: "capability",
    description: "Vision-Language-Action (VLA) and embodied models for physical robot manipulation and navigation.",
    filters: { capability: "robotics" },
  },
  "image-generation": {
    slug: "image-generation",
    title: "Image Generation Models",
    type: "capability",
    description: "Diffusion and autoregressive models specialized in text-to-image synthesis and visual rendering.",
    filters: { capability: "image-generation" },
  },
  "text-to-image": {
    slug: "text-to-image",
    title: "Image Generation Models",
    type: "capability",
    description: "Diffusion and autoregressive models specialized in text-to-image synthesis and visual rendering.",
    filters: { capability: "image-generation" },
  },

  // --- Landmark Model Families ---
  "gpt-4": {
    slug: "gpt-4",
    title: "GPT-4 Family",
    type: "family",
    description: "OpenAI's flagship multimodal foundation models including GPT-4o, GPT-4.1, and GPT-4 Turbo.",
    filters: { family: "GPT-4" },
  },
  "gpt-4o": {
    slug: "gpt-4o",
    title: "GPT-4o Series",
    type: "family",
    description: "OpenAI's omni-modal flagship models combining text, audio, and visual intelligence.",
    filters: { family: "GPT-4", nameKeyword: "4o" },
  },
  "gpt-5": {
    slug: "gpt-5",
    title: "GPT-5 Family",
    type: "family",
    description: "Next-generation frontier reasoning and language systems from OpenAI.",
    filters: { family: "GPT-5" },
  },
  claude: {
    slug: "claude",
    title: "Claude Family",
    type: "family",
    description: "Anthropic's high-intelligence Claude 3 and 3.5 models optimized for coding, vision, and enterprise safety.",
    filters: { family: "Claude" },
  },
  gemini: {
    slug: "gemini",
    title: "Gemini Family",
    type: "family",
    description: "Google DeepMind's natively multimodal foundation models spanning Nano, Flash, and Pro.",
    filters: { family: "Gemini" },
  },
  gemma: {
    slug: "gemma",
    title: "Gemma Family",
    type: "family",
    description: "Google's lightweight, open-weight foundation models built from the same research as Gemini.",
    filters: { family: "Gemma" },
  },
  "gemma-2": {
    slug: "gemma-2",
    title: "Gemma 2 Series",
    type: "family",
    description: "Google's high-efficiency open models in 2B, 9B, and 27B parameter sizes.",
    filters: { family: "Gemma" },
  },
  "gemma-3": {
    slug: "gemma-3",
    title: "Gemma 3 Series",
    type: "family",
    description: "Google's newest generation open foundation models with enhanced reasoning.",
    filters: { family: "Gemma" },
  },
  llama: {
    slug: "llama",
    title: "Llama Family",
    type: "family",
    description: "Meta's industry-standard open-weights foundation models spanning 1B to 405B parameters.",
    filters: { family: "Llama" },
  },
  "llama-3": {
    slug: "llama-3",
    title: "Llama 3 Series",
    type: "family",
    description: "Meta's flagship open models trained on over 15 trillion tokens with native tool use.",
    filters: { family: "Llama", nameKeyword: "3" },
  },
  "llama-3-1": {
    slug: "llama-3-1",
    title: "Llama 3.1 Series",
    type: "family",
    description: "Meta's extended 128k context models including the premier 405B parameter open model.",
    filters: { family: "Llama", nameKeyword: "3.1" },
  },
  "llama-3-2": {
    slug: "llama-3-2",
    title: "Llama 3.2 Series",
    type: "family",
    description: "Meta's lightweight on-device models and multimodal vision models in 11B and 90B sizes.",
    filters: { family: "Llama", nameKeyword: "3.2" },
  },
  "llama-3-3": {
    slug: "llama-3-3",
    title: "Llama 3.3 Series",
    type: "family",
    description: "Meta's refined 70B parameter model delivering near-405B quality with 8x lower latency.",
    filters: { family: "Llama", nameKeyword: "3.3" },
  },
  mistral: {
    slug: "mistral",
    title: "Mistral Family",
    type: "family",
    description: "High-efficiency open-weight and commercial foundation models from Mistral AI.",
    filters: { family: "Mistral" },
  },
  "mistral-7b": {
    slug: "mistral-7b",
    title: "Mistral 7B Series",
    type: "family",
    description: "Mistral AI's breakthrough 7B parameter architecture with sliding-window attention.",
    filters: { family: "Mistral", nameKeyword: "7B" },
  },
  "mistral-small": {
    slug: "mistral-small",
    title: "Mistral Small Series",
    type: "family",
    description: "Enterprise-grade cost-optimized models from Mistral AI for low-latency production.",
    filters: { family: "Mistral", nameKeyword: "Small" },
  },
  "mistral-large": {
    slug: "mistral-large",
    title: "Mistral Large Series",
    type: "family",
    description: "Top-tier frontier reasoning and multilingual model from Mistral AI.",
    filters: { family: "Mistral", nameKeyword: "Large" },
  },
  qwen: {
    slug: "qwen",
    title: "Qwen Family",
    type: "family",
    description: "Alibaba's extensive suite of multilingual, vision, coding, and reasoning models.",
    filters: { family: "Qwen" },
  },
  "qwen-2": {
    slug: "qwen-2",
    title: "Qwen 2 Series",
    type: "family",
    description: "Second-generation foundation models from Alibaba across dense and MoE architectures.",
    filters: { family: "Qwen", nameKeyword: "2" },
  },
  "qwen-2-5": {
    slug: "qwen-2-5",
    title: "Qwen 2.5 Series",
    type: "family",
    description: "Alibaba's top open-weights models excelling in math, code, and 128k context.",
    filters: { family: "Qwen", nameKeyword: "2.5" },
  },
  "qwen-3": {
    slug: "qwen-3",
    title: "Qwen 3 Series",
    type: "family",
    description: "Alibaba's latest foundation models with hybrid reasoning and enhanced multimodality.",
    filters: { family: "Qwen" },
  },
  deepseek: {
    slug: "deepseek",
    title: "DeepSeek Family",
    type: "family",
    description: "High-efficiency MoE architectures and reasoning models from DeepSeek AI.",
    filters: { family: "DeepSeek" },
  },
  "deepseek-r1": {
    slug: "deepseek-r1",
    title: "DeepSeek-R1 Series",
    type: "family",
    description: "Groundbreaking open-weights reasoning models trained via pure reinforcement learning.",
    filters: { family: "DeepSeek", nameKeyword: "R1" },
  },
  "deepseek-v3": {
    slug: "deepseek-v3",
    title: "DeepSeek-V3 Series",
    type: "family",
    description: "DeepSeek's 671B MoE architecture with Multi-head Latent Attention and FP8 training.",
    filters: { family: "DeepSeek", nameKeyword: "V3" },
  },
  phi: {
    slug: "phi",
    title: "Phi Family",
    type: "family",
    description: "Microsoft's small language models demonstrating frontier performance at compact parameter scales.",
    filters: { family: "Phi" },
  },
  "phi-3": {
    slug: "phi-3",
    title: "Phi-3 Series",
    type: "family",
    description: "Microsoft's 3.8B and 14B models trained on highly curated textbook-grade data.",
    filters: { family: "Phi" },
  },
  "phi-4": {
    slug: "phi-4",
    title: "Phi-4 Series",
    type: "family",
    description: "Microsoft's 14B state-of-the-art small reasoning model for complex mathematics and logic.",
    filters: { family: "Phi" },
  },
  command: {
    slug: "command",
    title: "Command Family",
    type: "family",
    description: "Cohere's enterprise models built for retrieval-augmented generation and multi-step tool use.",
    filters: { family: "Command" },
  },
  florence: {
    slug: "florence",
    title: "Florence Family",
    type: "family",
    description: "Microsoft's prompt-based vision foundation models for comprehensive visual tasks.",
    filters: { family: "Florence" },
  },
  whisper: {
    slug: "whisper",
    title: "Whisper Family",
    type: "family",
    description: "OpenAI's robust speech recognition models trained on 680,000 hours of audio data.",
    filters: { family: "Whisper" },
  },
  openvla: {
    slug: "openvla",
    title: "OpenVLA Family",
    type: "family",
    description: "Open-source vision-language-action models for robotic manipulation and physical embodiment.",
    filters: { family: "OpenVLA" },
  },
  palmyra: {
    slug: "palmyra",
    title: "Palmyra Family",
    type: "family",
    description: "Enterprise foundation models from Writer optimized for business workflows and RAG.",
    filters: { family: "Palmyra" },
  },
  o1: {
    slug: "o1",
    title: "OpenAI o1 Series",
    type: "family",
    description: "OpenAI's breakthrough reasoning models trained with reinforcement learning for complex science and math.",
    filters: { vendor: "OpenAI", nameKeyword: "o1" },
  },
  o3: {
    slug: "o3",
    title: "OpenAI o3 Series",
    type: "family",
    description: "Next-generation reasoning models from OpenAI achieving frontier competitive math and coding benchmarks.",
    filters: { vendor: "OpenAI", nameKeyword: "o3" },
  },

  // --- Top Organizations / Vendors ---
  openai: {
    slug: "openai",
    title: "OpenAI Models",
    type: "vendor",
    description: "Industry-leading models from OpenAI including the GPT series, o1/o3 reasoning models, and Whisper.",
    filters: { vendor: "OpenAI" },
  },
  google: {
    slug: "google",
    title: "Google & DeepMind Models",
    type: "vendor",
    description: "Frontier research and multimodal foundation models from Google and Google DeepMind.",
    filters: { vendor: "Google" },
  },
  anthropic: {
    slug: "anthropic",
    title: "Anthropic Models",
    type: "vendor",
    description: "Frontier language and vision models from Anthropic built with Constitutional AI safety.",
    filters: { vendor: "Anthropic" },
  },
  meta: {
    slug: "meta",
    title: "Meta AI Models",
    type: "vendor",
    description: "Open-source research and foundation models from Meta Superintelligence and FAIR.",
    filters: { vendor: "Meta" },
  },
  "mistral-ai": {
    slug: "mistral-ai",
    title: "Mistral AI Models",
    type: "vendor",
    description: "High-performance European foundation models from Mistral AI.",
    filters: { vendor: "Mistral AI" },
  },
  mistralai: {
    slug: "mistralai",
    title: "Mistral AI Models",
    type: "vendor",
    description: "High-performance European foundation models from Mistral AI.",
    filters: { vendor: "Mistral AI" },
  },
  alibaba: {
    slug: "alibaba",
    title: "Alibaba & Qwen Models",
    type: "vendor",
    description: "Leading Chinese and global foundation models developed by Alibaba Cloud and Qwen Team.",
    filters: { vendor: "Alibaba" },
  },
  qwen_org: {
    slug: "qwen",
    title: "Alibaba & Qwen Models",
    type: "vendor",
    description: "Leading Chinese and global foundation models developed by Alibaba Cloud and Qwen Team.",
    filters: { vendor: "Alibaba" },
  },
  deepseek_org: {
    slug: "deepseek",
    title: "DeepSeek AI Models",
    type: "vendor",
    description: "Pioneering reasoning and open-weights models developed by DeepSeek AI.",
    filters: { vendor: "DeepSeek" },
  },
  microsoft: {
    slug: "microsoft",
    title: "Microsoft Models",
    type: "vendor",
    description: "Foundation research, vision systems, and small language models developed by Microsoft Research.",
    filters: { vendor: "Microsoft" },
  },
  cohere: {
    slug: "cohere",
    title: "Cohere Models",
    type: "vendor",
    description: "Enterprise foundation models, embeddings, and re-rankers from Cohere.",
    filters: { vendor: "Cohere" },
  },
  amazon: {
    slug: "amazon",
    title: "Amazon Models",
    type: "vendor",
    description: "Titan, Nova, and cloud foundation models from Amazon Web Services.",
    filters: { vendor: "Amazon" },
  },
  bytedance: {
    slug: "bytedance",
    title: "ByteDance Models",
    type: "vendor",
    description: "Multimodal and generative models developed by ByteDance AI Research.",
    filters: { vendor: "ByteDance" },
  },
  huggingface: {
    slug: "huggingface",
    title: "Hugging Face Community Models",
    type: "vendor",
    description: "Community and open-source models published on the Hugging Face hub.",
    filters: { vendor: "HuggingFace" },
  },
  "zhipu-ai": {
    slug: "zhipu-ai",
    title: "Zhipu AI & GLM Models",
    type: "vendor",
    description: "Frontier GLM multimodal and language foundation models developed by Zhipu AI (Z.ai).",
    filters: { vendor: "z-ai" },
  },
  "qwen-3-5": {
    slug: "qwen-3-5",
    title: "Qwen 3.5 & Frontier Models",
    type: "family",
    description: "Latest generation foundation language and coding models from Alibaba Qwen Team.",
    filters: { family: "Qwen" },
  },
  "qwen-1-5": {
    slug: "qwen-1-5",
    title: "Qwen Series Models",
    type: "family",
    description: "High-performance foundational models from the Qwen architecture series.",
    filters: { family: "Qwen" },
  },
  bielik: {
    slug: "bielik",
    title: "Bielik Models",
    type: "family",
    description: "Polish foundation models developed by SpeakLeash and ACK Cyfronet AGH.",
    filters: { family: "Bielik" },
  },
  speakleash: {
    slug: "speakleash",
    title: "SpeakLeash Models",
    type: "vendor",
    description: "Open-source foundation models engineered by the SpeakLeash AI consortium.",
    filters: { vendor: "SpeakLeash" },
  },
  "internlm-2": {
    slug: "internlm-2",
    title: "InternLM 2 Series",
    type: "family",
    description: "Large language models with 1M context windows from Shanghai AI Laboratory.",
    filters: { family: "InternLM 2" },
  },
  internlm: {
    slug: "internlm",
    title: "InternLM Models",
    type: "family",
    description: "Open multilingual foundation models developed by Shanghai AI Laboratory.",
    filters: { family: "InternLM 2" },
  },
  "shanghai-ai-lab": {
    slug: "shanghai-ai-lab",
    title: "Shanghai AI Laboratory Models",
    type: "vendor",
    description: "Frontier open models developed by Shanghai AI Laboratory.",
    filters: { vendor: "Shanghai AI Lab" },
  },
  salesforce: {
    slug: "salesforce",
    title: "Salesforce AI Models",
    type: "vendor",
    description: "Program synthesis and enterprise AI models from Salesforce Research.",
    filters: { vendor: "Salesforce" },
  },
  hustvl: {
    slug: "hustvl",
    title: "HUSTVL Vision Models",
    type: "vendor",
    description: "Vision transformers and perception models from HUST Vision & Learning Lab.",
    filters: { vendor: "hustvl" },
  },
  pllum: {
    slug: "pllum",
    title: "PLLuM Consortium Models",
    type: "vendor",
    description: "Polish Large Language Universal Models engineered for open science.",
    filters: { vendor: "PLLuM" },
  },
  "ilessio-aiflowlab": {
    slug: "ilessio-aiflowlab",
    title: "AIFlowLab Agent Models",
    type: "vendor",
    description: "Workflow orchestration and agent models by AIFlowLab.",
    filters: { vendor: "ilessio-aiflowlab" },
  },
};

/**
 * Resolve any card slug into an authoritative contract.
 * Guarantees that every known card slug returns a valid title, description, and query filter.
 */
export function resolveCardContract(rawSlug: string): CardContract {
  const cleanSlug = (rawSlug || "all").toLowerCase().trim();

  // 1. Direct hit in authoritative dictionary
  if (CARD_CONTRACTS[cleanSlug]) {
    return CARD_CONTRACTS[cleanSlug];
  }

  // 2. Format a human-readable title from slug (e.g. "my-cool-vendor" -> "My Cool Vendor")
  const words = cleanSlug.split("-").filter(Boolean);
  const formattedTitle = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // 3. Dynamic generic fallback
  return {
    slug: cleanSlug,
    title: `${formattedTitle} Models`,
    type: "generic",
    description: `Browse foundation models, specifications, pricing, and research papers for ${formattedTitle}.`,
    filters: {
      nameKeyword: formattedTitle,
    },
  };
}
