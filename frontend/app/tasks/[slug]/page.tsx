export const runtime = "edge";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import TaskDetailClient from "@/components/domain/tasks/TaskDetailClient";

type TaskPageProps = {
  params: Promise<{ slug: string }>;
};

// ====================== TASK DATA ======================
const tasks = [
  {
    slug: "agents",
    displayName: "Agents",
    title: "AGENTS",
    description:
      "AI agents are autonomous software systems that use artificial intelligence to achieve goals and complete tasks on behalf of users, acting independently to perceive their environment, make decisions, and take actions without constant human intervention. They use advanced capabilities like reasoning, memory, planning, and learning, often leveraging large language models (LLMs) and other AI tools to interpret information and perform complex workflows across various industries.",


  },
  {
    slug: "world-models",
    displayName: "World Models",
    title: "WORLD MODELS",
    description:
      "World models are AI systems that learn a function from a (current world state, action) pair to the next world state, letting an agent predict how its environment will evolve and simulate the outcomes of actions before taking them. The term spans two paradigms: internal world models that predict the future at a high, semantic level (cognitive sense, in the spirit of LeCun's JEPA family) and external world models that aim to simulate reality at full visual fidelity (e.g. Genie-2, GAIA-1). Both are foundational for embodied AI: agents can plan and act using internal models while learning inside external simulators.",


  },
  {
    slug: "anomaly-detection",
    displayName: "Anomaly Detection",
    title: "ANOMALY DETECTION",
    description:
      "Anomaly and out-of-distribution (OOD) detection identifies unusual, novel, or defective inputs in images, video, and other sensor data.",


  },
  {
    slug: "autonomous-driving",
    displayName: "Autonomous Driving",
    title: "AUTONOMOUS DRIVING",
    description:
      "Autonomous driving research covers perception, planning, and control for self-driving vehicles, including bird's-eye-view (BEV) perception, occupancy prediction, end-to-end driving, and ADAS.",

    sisterTasks: [
      { name: "Autonomous Driving", slug: "autonomous-driving" },
      { name: "Image Understanding", slug: "image-understanding" },
      { name: "Instruction Following", slug: "instruction-following" },
      { name: "Reasoning", slug: "reasoning" },
      { name: "Robotics", slug: "robotics" },
      { name: "Chain-of-Thought (CoT)", slug: "chain-of-thought" },
    ],
    commonMethods: [
      { name: "PPO", count: -6 },
      { name: "Deformable Attention", count: -4 },
      { name: "LLaVa", count: -3 },
      { name: "Transformer", count: -3 },
      { name: "Gaussian Splatting", count: -3 },
      { name: "Chain-of-Thought (CoT)", count: -2 },
      { name: "Few-shot prompting", count: -2 },
      { name: "GPT-3", count: -2 },
    ],
  },


  {
    slug: "deepfake-forensics",
    displayName: "Deepfake and Forensics",
    title: "DEEPFAKE AND FORENSICS",
    description:
      "Deepfake detection and media forensics identify synthetic, manipulated, or spoofed visual and audiovisual content, including anti-spoofing and security-oriented authenticity verification.",

  },
  {
    slug: "document-understanding",
    displayName: "Document Understanding",
    title: "DOCUMENT UNDERSTANDING",
    description:
      "Document understanding covers machine learning systems that interpret visually rich documents, including forms, receipts, tables, layout-aware OCR, key information extraction, entity extraction, and entity linking.",

    sisterTasks: [
      { name: "Image Understanding", slug: "image-understanding" },
      { name: "OCR", slug: "ocr" },
    ],
    commonMethods: [
      { name: "Transformer", count: -1 },
      { name: "Pre-training", count: -5 },
      { name: "Vision Transformer", count: -8 },
      { name: "Large Language model (LLM)", count: -10 },
      { name: "GRPO", count: -9 },
      { name: "Qwen3", count: -4 },
      { name: "BPE", count: -2 },
      { name: "Direct Preference Optimization (DPO)", count: -7 },
    ],
  },
  {
    slug: "embedding-models",
    displayName: "Embedding Models",
    title: "EMBEDDING MODELS",
    description:
      "Embedding models are algorithms that transform complex, high-dimensional data—like words, images, or audio—into dense, low-dimensional numerical vectors. These vectors capture the underlying meaning, context, and relationships within the data, allowing machines to understand and process it more efficiently. By representing data as points in a shared mathematical space, embedding models enable tasks such as semantic search, recommendation systems, and image recognition by placing similar items close together.",

  },
  {
    slug: "large-language-models",

    displayName: "Large Language Models",
    title: "LARGE LANGUAGE MODELS",

    description:
      "Large Language Models (LLMs) are AI models trained on massive text datasets to understand and generate human language. They are used for text generation, question answering, summarization, translation, coding assistance, reasoning, and many other natural language processing tasks.",

  },
  {
    slug: "vision-language-models",
    displayName: "Vision-Language Models",
    title: "VISION-LANGUAGE MODELS",
    description:
      "Vision-Language Models combine visual understanding and natural language processing, enabling AI systems to understand images, answer questions, generate captions, and perform multimodal reasoning.",


  },
  {
    slug: "multimodal-models",
    displayName: "Multimodal Models",
    title: "MULTIMODAL MODELS",
    description:
      "Multimodal Models process multiple types of data such as text, images, audio, and video together, allowing richer understanding and generation across different modalities.",

  },
  {
    slug: "automatic-speech-recognition",
    displayName: "Automatic Speech Recognition",
    title: "AUTOMATIC SPEECH RECOGNITION",
    description:
      "Speech AI focuses on speech recognition, speech synthesis, speaker identification, speech translation, and spoken language understanding.",

  },
  {
    slug: "image-generation",
    displayName: "Image Generation",
    title: "IMAGE GENERATION",
    description:
      "Image Generation focuses on creating realistic or artistic images from text prompts or other inputs using diffusion models and generative AI.",

  },
  {
    slug: "ocr",
    displayName: "OCR",
    title: "OCR",
    description:
      "OCR, or Optical Character Recognition, is the task of converting an image containing text into machine-readable, editable, and searchable digital text data. This involves converting scanned documents, photos, or image-only PDFs to text from their static visual format, enabling the document to be edited, searched, or used for data entry and other applications.",

  },
  {
    slug: "omni-models",
    displayName: "Omni Models",
    title: "OMNI MODELS",
    description:
      "Omni models are AI models that take multiple modalities (language, vision, audio) as input and produce multiple modalities as output. Some examples of the first omni models include Qwen2.5 Omni and BAGEL.",

  },
  {
    slug: "reasoning",
    displayName: "Reasoning",
    title: "REASONING",
    description:
      "AI reasoning is the process by which artificial intelligence systems logically derive conclusions and make informed decisions from data, rules, and prior knowledge, enabling them to move beyond simple pattern recognition to solve problems and simulate intelligent behavior. It involves systems that can 'think' by connecting information, applying rules, and performing step-by-step analyses, often using methods like deductive and inductive logic to achieve greater accuracy and adapt to complex, uncertain situations.",

  },
  {
    slug: "reinforcement-learning",
    displayName: "Reinforcement Learning",
    title: "REINFORCEMENT LEARNING",
    description:
      "Reinforcement learning (RL) is a machine learning technique where an agent learns to make optimal decisions in an environment through trial and error to maximize cumulative rewards. An agent interacts with an environment, taking actions, and receiving rewards or penalties based on those actions. Unlike other ML methods, RL doesn't have an 'answer key'; instead, it learns a strategy, called a policy, to choose actions that lead to the best long-term outcomes.",

  },
  {
    slug: "remote-sensing",
    displayName: "Remote Sensing",
    title: "REMOTE SENSING",
    description:
      "Remote sensing analyzes satellite, aerial, and drone imagery for land cover, environmental monitoring, geospatial understanding, and earth observation.",

  },
  {
    slug: "robotics",
    displayName: "Robotics",
    title: "ROBOTICS",
    description:
      "Robotics is an interdisciplinary field of study involving computer science, engineering, and technology to design, construct, operate, and utilize machines known as robots. These programmable machines are built to replicate, substitute, or assist in human actions, performing a vast array of tasks in industries from manufacturing and healthcare to exploration and entertainment.",

  },
  {
    slug: "scene-text-recognition",
    displayName: "Scene Text Recognition",
    title: "SCENE TEXT RECOGNITION",
    description:
      "Recognize textual content from cropped natural-scene word images. Standard STR benchmarks include regular datasets such as IC13, SVT, and IIIT5K, plus irregular datasets such as IC15, SVTP, and CUTE80.",

  },
  {
    slug: "small-language-models",
    displayName: "Small Language Models",
    title: "Small Language Models",
    description:
      "Small Language Models (SLMs) are compact AI models designed to deliver strong language understanding and generation while using significantly fewer parameters than large language models. They are optimized for faster inference, lower memory usage, and efficient deployment on edge devices, mobile applications, and resource-constrained environments. SLMs enable practical AI solutions for tasks such as text generation, summarization, question answering, and coding assistance with reduced computational cost.",
  },
  {
    slug: "omni-models",
    displayName: "Omni Models",
    title: "Omni Models",
    description:
      "Unified AI models that accept and generate multiple modalities within a single architecture. They provide seamless interaction across text, vision, audio, and speech.",

  },
  {
    slug: "reasoning-models",
    displayName: "Reasoning Models",
    title: "Reasoning Models",
    description:
      "AI models specialized in logical reasoning and multi-step problem solving. They improve decision-making accuracy across mathematics, coding, and complex planning tasks.",

  },
  {
    slug: "long-context-models",
    displayName: "Long Context Models",
    title: "Long Context Models",
    description:
      "Language models designed to process extremely long documents and conversations efficiently. They maintain context over extended sequences for better comprehension and retrieval.",

  },
  {
    slug: "efficient-training",
    displayName: "Efficient Training",
    title: "Efficient Training",
    description:
      "Methods that reduce computational cost while maintaining model performance during training. They include optimization, distributed learning, and parameter-efficient techniques.",

  },
  {
    slug: "model-alignment",
    displayName: "Model Alignment",
    title: "Model Alignment",
    description:
      "Techniques that align AI behavior with human intentions, values, and safety objectives. They improve reliability, helpfulness, and responsible AI deployment.",

  },
  {
    slug: "coding-agents",
    displayName: "Coding Agents",
    title: "Coding Agents",
    description:
      "AI agents specialized in software development, debugging, and code generation. They accelerate programming through intelligent assistance and automation.",

  },
  {
    slug: "computer-use-agents",
    displayName: "Computer Use Agents",
    title: "Computer Use Agents",
    description:
      "Agents that interact directly with graphical user interfaces like humans. They automate workflows across desktop applications and operating systems.",

  },
  {
    slug: "browser-agents",
    displayName: "Browser Agents",
    title: "Browser Agents",
    description:
      "AI agents that navigate websites, retrieve information, and complete online tasks autonomously. They assist with research, automation, and web-based workflows.",

  },
  {
    slug: "research-agents",
    displayName: "Research Agents",
    title: "Research Agents",
    description:
      "Agents designed to collect, analyze, and summarize information from multiple sources. They accelerate literature reviews and scientific discovery.",


  },
  {
    slug: "multi-agent-systems",
    displayName: "Multi-Agent Systems",
    title: "Multi-Agent Systems",
    description:
      "AI systems where multiple agents collaborate to solve complex problems efficiently. They improve scalability, coordination, and distributed decision-making.",

  },
  {
    slug: "tool-calling",
    displayName: "Tool Calling",
    title: "Tool Calling",
    description:
      "AI models capable of invoking external APIs, databases, and software tools. They extend model capabilities beyond text generation into real-world actions.",

  },
  {
    slug: "agent-memory",
    displayName: "Agent Memory",
    title: "Agent Memory",
    description:
      "Persistent memory systems that enable agents to retain context across interactions. They improve personalization, long-term planning, and consistency.",

  },
  {
    slug: "agent-planning",
    displayName: "Agent Planning",
    title: "Agent Planning",
    description:
      "Techniques that allow AI agents to decompose complex goals into executable steps. They enhance reasoning, scheduling, and autonomous task execution.",

  },
  {
    slug: "workflow-automation",
    displayName: "Workflow Automation",
    title: "Workflow Automation",
    description:
      "AI-powered automation of repetitive and multi-step business processes. It improves productivity by reducing manual effort and execution time.",
  },
];

// ====================== HELPER FUNCTIONS ======================
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTaskBySlug(slug: string) {
  return tasks.find((task) => task.slug === slug);
}

function getTaskMetadata(slug: string) {
  const task = getTaskBySlug(slug);
  if (!task) {
    // Fallback for unknown slugs
    const displayName = formatSlug(slug);
    return {
      displayName,
      title: displayName.toUpperCase(),
      description: `${displayName} is an AI research task. Explore the latest papers, benchmarks, and methods related to ${displayName}.`,

      stats: {
        benchmarks: 0,
      },
      sisterTasks: [],
      commonMethods: [],
    };
  }

  return task;
}

function getMethodsUsed(commonMethods: Array<any>): string {
  const count = commonMethods.length;
  return count > 8 ? "8+" : count.toString();
}

// ====================== PAGE COMPONENT ======================
export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const metadata = getTaskMetadata(slug);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F7F2] text-[#111111]">
      <Navbar />

      <div
        id="scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden hide-scroll flex flex-col"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-10 xl:px-14 pt-6 pb-6">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] tracking-wide text-[#7B736A] uppercase mb-6">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/tasks" className="hover:text-black transition-colors">
              Tasks
            </Link>
            <span>/</span>
            <span className="text-[#0E4B8E] uppercase font-medium truncate max-w-[200px] sm:max-w-none">
              {metadata.title}
            </span>
          </nav>

          {/* Hero Section */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 items-start">
            {/* Left Content */}
            <div className="w-full max-w-[720px] min-w-0">
              {/* Task Title */}
              <div>
                <h1 className="text-[26px] font-black leading-[1.1] tracking-[-0.03em] text-[#171717] md:text-[34px] lg:text-[38px] break-words uppercase">
                  {metadata.title}
                </h1>
              </div>

              {/* Description */}
              <p className="mt-6 text-[13px] sm:text-[14px] leading-[1.65] text-[#222222]">
                {(metadata.description || `${metadata.displayName} is a key area of artificial intelligence research.`) +
                  ` ${metadata.displayName || "This task"} is a crucial area of AI research that provides developers with powerful tools to solve complex real-world problems.`}
              </p>
            </div>
          </div>
        </div>

        {/* Papers Section */}
        <div className="w-full px-3 sm:px-6 md:px-12 xl:px-16 pt-0 pb-12">
          <div className="w-full">
            <main className="w-full max-w-none min-w-0">
              <TaskDetailClient slug={slug} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================== SUB COMPONENTS ======================
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-end gap-2">
      <span className="text-[13px] font-bold text-[#111] tabular-nums">
        {value}{" "}
        <span className="uppercase tracking-[0.18em] text-[#7B736A] ml-2">
          {label}
        </span>
      </span>
    </div>
  );
}

function SisterTaskTag({
  name,
  slug,
  count,
}: {
  name: string;
  slug: string;
  count: number;
}) {
  return (
    <Link
      href={`/tasks/${slug}`}
      className="cursor-pointer inline-flex items-center rounded-full border border-[#DDD6CC] bg-white px-4 py-1 text-[13px] text-[#333] transition hover:bg-transparent hover:border-[#F55036] no-underline"
    >
      {name}
      <span className="ml-1.5 text-[#8D857B] font-medium tabular-nums">
        ({count})
      </span>
    </Link>
  );
}

