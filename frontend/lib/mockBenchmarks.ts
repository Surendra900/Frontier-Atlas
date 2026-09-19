/**
 * Mock benchmark data used as a fallback when the API is unavailable
 * (e.g. Neon free-tier data transfer quota exceeded).
 * 
 * Remove / replace with real data once the backend is back online.
 */

import type { BenchmarkItem, BenchmarkDetail } from './benchmarks';

export const MOCK_BENCHMARKS: BenchmarkItem[] = [
  { id: 'b1', name: 'ImageNet', slug: 'imagenet', _count: { rankings: 120, claims: 45 } },
  { id: 'b2', name: 'COCO Detection', slug: 'coco-detection', _count: { rankings: 98, claims: 32 } },
  { id: 'b3', name: 'SWE-Bench Verified', slug: 'swe-bench-verified', _count: { rankings: 54, claims: 18 } },
  { id: 'b4', name: 'HumanEval', slug: 'humaneval', _count: { rankings: 87, claims: 29 } },
  { id: 'b5', name: 'MATH', slug: 'math', _count: { rankings: 62, claims: 21 } },
  { id: 'b6', name: 'OCRBench v2', slug: 'ocrbench-v2', _count: { rankings: 41, claims: 13 } },
  { id: 'b7', name: 'OmniDoc', slug: 'omnidoc', _count: { rankings: 33, claims: 11 } },
  { id: 'b8', name: 'VQA v2', slug: 'vqa-v2', _count: { rankings: 76, claims: 25 } },
  { id: 'b9', name: 'MMLU', slug: 'mmlu', _count: { rankings: 110, claims: 38 } },
  { id: 'b10', name: 'HellaSwag', slug: 'hellaswag', _count: { rankings: 89, claims: 31 } },
  { id: 'b11', name: 'GSM8K', slug: 'gsm8k', _count: { rankings: 74, claims: 24 } },
  { id: 'b12', name: 'ARC Challenge', slug: 'arc-challenge', _count: { rankings: 65, claims: 20 } },
];

function makePaper(id: string, title: string, slug: string, year: number, month: number, stars?: number, citations?: number) {
  return {
    id,
    title,
    slug,
    githubStars: stars ?? Math.floor(Math.random() * 8000) + 500,
    citationCount: citations ?? Math.floor(Math.random() * 2000) + 50,
    publicationDate: `${year}-${String(month).padStart(2, '0')}-15T00:00:00.000Z`,
  };
}

export const MOCK_BENCHMARK_DETAILS: Record<string, BenchmarkDetail> = {
  'swe-bench-verified': {
    id: 'b3',
    name: 'SWE-Bench Verified',
    slug: 'swe-bench-verified',
    description: 'SWE-bench Verified evaluates autonomous AI agents on resolving real-world GitHub issues end-to-end against full unit test suites.',
    domain: 'Coding',
    task: 'Software Engineering',
    metric: 'Resolve Rate (%)',
    rankings: [
      { id: 'r1', rank: 1, previous_rank: null, score: 65.2, score_str: '65.2%', model_name: 'Claude 3.5 Sonnet (New) + SWE-agent', verified: true, paper: makePaper('p20', 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering', 'swe-agent-agent-computer', 2024, 5, 14200, 310) },
      { id: 'r2', rank: 2, previous_rank: 1, score: 56.4, score_str: '56.4%', model_name: 'Agentless + GPT-4o', verified: true, paper: makePaper('p21', 'Agentless: Demystifying LLM-based Software Engineering Agents', 'agentless-demystifying', 2024, 7, 3400, 180) },
      { id: 'r3', rank: 3, previous_rank: 2, score: 48.0, score_str: '48.0%', model_name: 'AutoCodeRover', verified: true, paper: makePaper('p22', 'AutoCodeRover: Autonomous Program Improvement', 'autocoderover-autonomous', 2024, 4, 2900, 125) },
      { id: 'r4', rank: 4, previous_rank: 3, score: 43.1, score_str: '43.1%', model_name: 'CodeR + DeepSeek-Coder-33B', verified: false, paper: makePaper('p23', 'CodeR: Issue Resolving with Multi-Agent Collaboration', 'coder-issue-resolving', 2024, 6, 1800, 65) },
    ],
    claims: [
      { id: 'c1', paper: makePaper('p20', 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering', 'swe-agent-agent-computer', 2024, 5, 14200, 310) },
    ],
  },
  'humaneval': {
    id: 'b4',
    name: 'HumanEval',
    slug: 'humaneval',
    description: 'Measuring functional correctness for synthesizing Python programs from docstrings via pass@k test suites.',
    domain: 'Coding',
    task: 'Code Generation',
    metric: 'Pass@1 (%)',
    rankings: [
      { id: 'r1', rank: 1, previous_rank: 2, score: 92.4, score_str: '92.4%', model_name: 'Claude 3.5 Sonnet', verified: true, paper: makePaper('p11', 'Claude 3.5 Sonnet: Model Card', 'claude-35-sonnet-model-card', 2024, 6, 8500, 420) },
      { id: 'r2', rank: 2, previous_rank: 1, score: 90.2, score_str: '90.2%', model_name: 'GPT-4o (Zero-Shot)', verified: true, paper: makePaper('p10', 'GPT-4 Technical Report', 'gpt-4-technical-report', 2023, 3, 21400, 4900) },
      { id: 'r3', rank: 3, previous_rank: null, score: 86.8, score_str: '86.8%', model_name: 'DeepSeek-Coder-V2 236B', verified: true, paper: makePaper('p12', 'DeepSeek-Coder: When the Large Language Model Meets Programming', 'deepseek-coder', 2024, 1, 13100, 850) },
      { id: 'r4', rank: 4, previous_rank: 3, score: 79.9, score_str: '79.9%', model_name: 'WizardCoder-Python-34B', verified: false, paper: makePaper('p13', 'WizardCoder: Empowering Code Large Language Models with Evol-Instruct', 'wizardcoder-empowering', 2023, 6, 4200, 390) },
      { id: 'r5', rank: 5, previous_rank: 5, score: 73.2, score_str: '73.2%', model_name: 'StarCoder2-15B', verified: false, paper: makePaper('p14', 'StarCoder: May the Source be with You!', 'starcoder-may-the-source', 2023, 5, 7800, 520) },
      { id: 'r6', rank: 6, previous_rank: 6, score: 67.0, score_str: '67.0%', model_name: 'CodeLlama-34B-Instruct', verified: false, paper: makePaper('p15', 'CodeLlama: Open Foundation Models for Code', 'codellama-open-foundation', 2023, 8, 15900, 1100) },
    ],
    claims: [
      { id: 'c1', paper: makePaper('p11', 'Claude 3.5 Sonnet: Model Card', 'claude-35-sonnet-model-card', 2024, 6, 8500, 420) },
    ],
  },
  'mmlu': {
    id: 'b9',
    name: 'MMLU',
    slug: 'mmlu',
    description: 'Massive Multitask Language Understanding benchmark testing world knowledge and problem-solving across 57 subjects in STEM, humanities, and social sciences.',
    domain: 'Language',
    task: 'Question Answering',
    metric: '5-shot Accuracy (%)',
    rankings: [
      { id: 'r1', rank: 1, previous_rank: null, score: 90.8, score_str: '90.8%', model_name: 'o3-mini / GPT-4o', verified: true, paper: makePaper('p30', 'GPT-4 Technical Report', 'gpt-4-technical-report', 2023, 3, 21400, 4900) },
      { id: 'r2', rank: 2, previous_rank: 1, score: 88.7, score_str: '88.7%', model_name: 'Claude 3.5 Sonnet', verified: true, paper: makePaper('p11', 'Claude 3.5 Sonnet: Model Card', 'claude-35-sonnet-model-card', 2024, 6, 8500, 420) },
      { id: 'r3', rank: 3, previous_rank: 2, score: 88.5, score_str: '88.5%', model_name: 'DeepSeek-V3', verified: true, paper: makePaper('p31', 'DeepSeek-V3 Technical Report', 'deepseek-v3-technical-report', 2024, 12, 16200, 780) },
      { id: 'r4', rank: 4, previous_rank: 3, score: 88.6, score_str: '88.6%', model_name: 'Llama 3.1 405B', verified: false, paper: makePaper('p32', 'The Llama 3 Herd of Models', 'the-llama-3-herd-of-models', 2024, 7, 24000, 1600) },
      { id: 'r5', rank: 5, previous_rank: 4, score: 85.9, score_str: '85.9%', model_name: 'Gemini 1.5 Pro', verified: false, paper: makePaper('p33', 'Gemini 1.5: Unlocking multimodal understanding across millions of tokens', 'gemini-15-multimodal', 2024, 2, 5900, 680) },
    ],
    claims: [
      { id: 'c1', paper: makePaper('p30', 'GPT-4 Technical Report', 'gpt-4-technical-report', 2023, 3, 21400, 4900) },
    ],
  },
  'imagenet': {
    id: 'b1',
    name: 'ImageNet',
    slug: 'imagenet',
    description: 'The golden benchmark for visual representation learning and top-1 image classification accuracy on 1,000 object categories.',
    domain: 'Computer Vision',
    task: 'Image Classification',
    metric: 'Top-1 Accuracy (%)',
    rankings: [
      { id: 'r1', rank: 1, previous_rank: 2, score: 91.1, score_str: '91.1%', model_name: 'EVA-02-E', verified: true, paper: makePaper('p1', 'EVA: Exploring the Limits of Masked Visual Representation Learning at Scale', 'eva-exploring-limits', 2023, 3, 4100, 890) },
      { id: 'r2', rank: 2, previous_rank: 1, score: 91.0, score_str: '91.0%', model_name: 'CoCa (Contrastive Captioner)', verified: true, paper: makePaper('p2', 'CoCa: Contrastive Captioners are Image-Text Foundation Models', 'coca-contrastive-captioners', 2022, 5, 2900, 640) },
      { id: 'r3', rank: 3, previous_rank: 3, score: 90.4, score_str: '90.4%', model_name: 'ViT-22B', verified: true, paper: makePaper('p3', 'ViT-22B: Scaling Vision Transformers to 22 Billion Parameters', 'vit-22b-scaling', 2023, 2, 1800, 310) },
      { id: 'r4', rank: 4, previous_rank: null, score: 90.1, score_str: '90.1%', model_name: 'SwinV2-G (640x640)', verified: false, paper: makePaper('p4', 'SwinV2: Scaling Up Capacity and Resolution for Vision Representation', 'swinv2-scaling-up', 2022, 1, 5600, 1450) },
      { id: 'r5', rank: 5, previous_rank: 4, score: 88.5, score_str: '88.5%', model_name: 'CLIP-ViT-L/14@336px', verified: false, paper: makePaper('p5', 'CLIP: Learning Transferable Visual Models From Natural Language Supervision', 'clip-learning-transferable', 2021, 2, 28000, 9200) },
    ],
    claims: [
      { id: 'c1', paper: makePaper('p1', 'EVA: Exploring the Limits of Masked Visual Representation Learning at Scale', 'eva-exploring-limits', 2023, 3, 4100, 890) },
      { id: 'c2', paper: makePaper('p6', 'DeiT III: Revenge of the ViT', 'deit-iii-revenge', 2022, 4, 3200, 480) },
    ],
  },
};

/**
 * Returns mock detail for any slug, generating a plausible structure
 * if the slug isn't in the predefined map.
 */
export function getMockBenchmarkDetail(slug: string): BenchmarkDetail {
  if (MOCK_BENCHMARK_DETAILS[slug]) {
    return MOCK_BENCHMARK_DETAILS[slug];
  }

  // Generic fallback for unknown slugs
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: `bm-${slug}`,
    name,
    slug,
    description: `${name} is an evaluation benchmark measuring performance, robustness, and generalizability across standardized test environments.`,
    domain: 'General AI',
    task: 'Evaluation',
    metric: 'Score (%)',
    rankings: [
      { id: 'r1', rank: 1, previous_rank: null, score: 94.6, score_str: '94.6%', model_name: `${name}-SOTA-v2`, verified: true, paper: makePaper('mp1', `${name}: State-of-the-Art Baseline Paper`, `${slug}-sota-baseline`, 2025, 3, 4200, 580) },
      { id: 'r2', rank: 2, previous_rank: 1, score: 92.1, score_str: '92.1%', model_name: `Omni-${name}-XL`, verified: true, paper: makePaper('mp2', `Advancing ${name} with Novel Architecture`, `${slug}-advancing-novel`, 2025, 1, 2800, 310) },
      { id: 'r3', rank: 3, previous_rank: 2, score: 89.4, score_str: '89.4%', model_name: `Sparse-${name}-Base`, verified: false, paper: makePaper('mp3', `Efficient ${name} via Sparse Attention`, `${slug}-efficient-sparse`, 2024, 11, 1900, 195) },
      { id: 'r4', rank: 4, previous_rank: 3, score: 86.8, score_str: '86.8%', model_name: `Deep-${name}-Foundation`, verified: false, paper: makePaper('mp4', `Scaling Laws for ${name} Evaluation`, `${slug}-scaling-laws`, 2024, 8, 3400, 420) },
    ],
    claims: [
      { id: 'c1', paper: makePaper('mp1', `${name}: State-of-the-Art Baseline Paper`, `${slug}-sota-baseline`, 2025, 3, 4200, 580) },
    ],
  };
}
