import { getGithubTrending } from "./github.service.js";
import { getHackerNewsTrending } from "./hackernews.service.js";

function classifyTopic(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.match(/agent|autonomous|tool|workflow|crew|langchain|autogen|mcp/i)) {
    return "Agents & Automation";
  }
  if (text.match(/vision|image|video|diffusion|multimodal|segmentation|yolo|sam|ocr/i)) {
    return "Vision & Multimodal";
  }
  if (text.match(/llm|gpt|llama|deepseek|reasoning|transformer|language model|prompt|attention|eval/i)) {
    return "LLMs & Reasoning";
  }
  return "Open Source & Tooling";
}

const FALLBACK_DISCUSSIONS = [
  {
    platform: "hackernews",
    source: "Hacker News",
    time: "2 hours ago",
    title: "Show HN: Open Source DeepSeek-R1 Architecture Breakdown & Analysis",
    description: "In-depth technical review of DeepSeek-R1 reinforcement learning reasoning incentives and cold-start data recipes.",
    likes: "482",
    comments: "159",
    url: "https://news.ycombinator.com",
    category: "LLMs & Reasoning",
  },
  {
    platform: "github",
    source: "vllm-project",
    time: "4 hours ago",
    title: "vllm has recent development activity",
    description: "High-throughput and memory-efficient LLM serving engine with PagedAttention support.",
    likes: "38,400",
    comments: "5,120",
    url: "https://github.com/vllm-project/vllm",
    category: "Open Source & Tooling",
  },
  {
    platform: "hackernews",
    source: "Hacker News",
    title: "Why Multi-Agent Workflows Outperform Single Prompt Reasoning",
    description: "Discussion on iterative verification, test-time compute scaling, and autonomous coding agents.",
    time: "6 hours ago",
    likes: "315",
    comments: "94",
    url: "https://news.ycombinator.com",
    category: "Agents & Automation",
  },
  {
    platform: "github",
    source: "openai",
    time: "8 hours ago",
    title: "swarm has recent development activity",
    description: "Educational framework exploring ergonomic multi-agent orchestration and routines.",
    likes: "16,800",
    comments: "1,940",
    url: "https://github.com/openai/swarm",
    category: "Agents & Automation",
  },
  {
    platform: "hackernews",
    source: "Hacker News",
    time: "12 hours ago",
    title: "Next-Gen Diffusion Models: Scaling Latent Video Generation",
    description: "Community discussion covering state-space models and flow-matching for real-time video generation.",
    likes: "276",
    comments: "82",
    url: "https://news.ycombinator.com",
    category: "Vision & Multimodal",
  },
];

export const getDiscussions = async () => {
  const [githubResult, hackerNewsResult] = await Promise.allSettled([
    getGithubTrending(),
    getHackerNewsTrending(),
  ]);

  const github = githubResult.status === "fulfilled" ? githubResult.value : [];
  const hackernews = hackerNewsResult.status === "fulfilled" ? hackerNewsResult.value : [];

  let all = [...github, ...hackernews].map((item) => ({
    ...item,
    category: classifyTopic(item.title, item.description),
  }));

  if (all.length === 0) {
    all = FALLBACK_DISCUSSIONS;
  }

  // Interleave and randomize slightly for a dynamic feed
  all.sort(() => Math.random() - 0.5);

  return all;
};