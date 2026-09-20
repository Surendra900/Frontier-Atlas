import { QueryRouter } from "../routing/index.js";
import { QueryIntent, QueryType } from "../routing/types.js";

export function resolveHuggingFaceUrl(model: {
  name: string;
  slug: string;
  vendor?: string | null;
  repositoryUrl?: string | null;
  repository_url?: string | null;
  apiUrl?: string | null;
  api_url?: string | null;
}): string {
  const repo = model.repositoryUrl ?? model.repository_url ?? "";
  const api = model.apiUrl ?? model.api_url ?? "";
  if (repo.includes("huggingface.co")) return repo;
  if (api.includes("huggingface.co")) return api;

  const cleanName = model.name.trim();
  return `https://huggingface.co/models?search=${encodeURIComponent(cleanName)}`;
}

export interface HardwareRequirements {
  minVramFp16Gb: number;
  minVramQuantizedGb: number;
  hardwareTier: "consumer_6gb" | "consumer_16gb" | "workstation_48gb" | "cloud_cluster";
  fitsOn6GbGpu: boolean;
  recommendedGpu: string;
  recommendedEngine: string;
}

export interface RunSnippets {
  ollama: string;
  vllm: string;
  transformers: string;
  curl: string;
}

export function calculateHardwareRequirements(model: {
  parameterCount?: string | null;
  architecture?: string | null;
  name?: string;
}): HardwareRequirements {
  const rawParam = (model.parameterCount || "").toUpperCase().trim();
  let billParams = 7; // default fallback 7B

  // Parse MoE patterns like 8X7B or 16X12B
  const moeMatch = rawParam.match(/(\d+)X(\d+(?:\.\d+)?)\s*B?/i);
  if (moeMatch) {
    const numExperts = parseInt(moeMatch[1], 10);
    const expertSize = parseFloat(moeMatch[2]);
    billParams = numExperts * expertSize * 0.75;
  } else {
    // Parse single parameter counts like 70B, 3.8B, 405B, 1.5B, 671B
    const singleMatch = rawParam.match(/(\d+(?:\.\d+)?)\s*B/i);
    if (singleMatch) {
      billParams = parseFloat(singleMatch[1]);
    } else {
      const mMatch = rawParam.match(/(\d+(?:\.\d+)?)\s*M/i);
      if (mMatch) {
        billParams = parseFloat(mMatch[1]) / 1000;
      }
    }
  }

  // Full precision (FP16/BF16: 2 bytes per param + 20% overhead)
  const fp16 = Math.round(billParams * 2 * 1.2 * 10) / 10;
  // 4-bit quantized (GGUF Q4_K_M / AWQ: 0.55 bytes per param + 15% overhead)
  const q4 = Math.round(billParams * 0.55 * 1.15 * 10) / 10;

  let hardwareTier: HardwareRequirements["hardwareTier"] = "consumer_6gb";
  let recommendedGpu = "NVIDIA RTX 4050 / RTX 3060 Laptop (6 GB VRAM)";
  let recommendedEngine = "Ollama / llama.cpp (Local 4-bit Quantized)";
  const fitsOn6GbGpu = q4 <= 6.0;

  if (q4 <= 6.0) {
    hardwareTier = "consumer_6gb";
    recommendedGpu = "NVIDIA RTX 4050 / RTX 3060 Laptop (6 GB VRAM)";
    recommendedEngine = "Ollama / llama.cpp (Local 4-bit Quantized)";
  } else if (q4 <= 16.0) {
    hardwareTier = "consumer_16gb";
    recommendedGpu = "NVIDIA RTX 4080 (16 GB) / Apple Silicon M-Series (16-32 GB)";
    recommendedEngine = "vLLM / Ollama (Q4 / FP16)";
  } else if (q4 <= 48.0) {
    hardwareTier = "workstation_48gb";
    recommendedGpu = "2x NVIDIA RTX 4090 (48 GB) or 1x RTX 6000 Ada (48 GB)";
    recommendedEngine = "vLLM / SGLang (Tensor Parallel)";
  } else {
    hardwareTier = "cloud_cluster";
    recommendedGpu = "Cloud Enterprise Cluster (8x H100 80 GB) or Hosted API";
    recommendedEngine = "Cloud Inference API (Groq, Together, DeepInfra)";
  }

  return {
    minVramFp16Gb: fp16,
    minVramQuantizedGb: q4,
    hardwareTier,
    fitsOn6GbGpu,
    recommendedGpu,
    recommendedEngine,
  };
}

export function generateRunSnippets(model: {
  name: string;
  slug: string;
  vendor?: string | null;
  parameterCount?: string | null;
  huggingFaceUrl?: string | null;
  apiUrl?: string | null;
}): RunSnippets {
  const cleanSlug = model.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const vendor = (model.vendor || "model").toLowerCase().replace(/[^a-z0-9]/g, "");

  let hfId = `${vendor}/${model.name.replace(/\s+/g, "-")}`;
  if (model.huggingFaceUrl && model.huggingFaceUrl.includes("huggingface.co/")) {
    const parts = model.huggingFaceUrl.split("huggingface.co/")[1];
    if (parts && !parts.startsWith("models?")) {
      hfId = parts.split(/[?#]/)[0];
    }
  }

  let ollamaTag = cleanSlug;
  if (cleanSlug.includes("llama-3-3-70b")) ollamaTag = "llama3.3:70b";
  else if (cleanSlug.includes("llama-3-2-3b")) ollamaTag = "llama3.2:3b";
  else if (cleanSlug.includes("llama-3-2-1b")) ollamaTag = "llama3.2:1b";
  else if (cleanSlug.includes("llama-3-1-8b")) ollamaTag = "llama3.1:8b";
  else if (cleanSlug.includes("llama-3-1-70b")) ollamaTag = "llama3.1:70b";
  else if (cleanSlug.includes("deepseek-r1")) ollamaTag = "deepseek-r1";
  else if (cleanSlug.includes("deepseek-v3")) ollamaTag = "deepseek-v3";
  else if (cleanSlug.includes("qwen-2-5-7b") || cleanSlug.includes("qwen2.5-7b")) ollamaTag = "qwen2.5:7b";
  else if (cleanSlug.includes("qwen-2-5-3b") || cleanSlug.includes("qwen2.5-3b")) ollamaTag = "qwen2.5:3b";
  else if (cleanSlug.includes("phi-3-5")) ollamaTag = "phi3.5";
  else if (cleanSlug.includes("mistral-7b")) ollamaTag = "mistral";
  else if (cleanSlug.includes("gemma-2-9b")) ollamaTag = "gemma2:9b";
  else if (cleanSlug.includes("gemma-2-2b")) ollamaTag = "gemma2:2b";

  const ollama = `ollama run ${ollamaTag}`;
  const vllm = `vllm serve ${hfId} --port 8000 --trust-remote-code`;
  const transformers = `from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_id = "${hfId}"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

inputs = tokenizer("Explore the frontier of AI research:", return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=64)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))`;

  const curl = `curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${hfId}",
    "messages": [{"role": "user", "content": "Explain the significance of this architecture."}],
    "temperature": 0.7
  }'`;

  return {
    ollama,
    vllm,
    transformers,
    curl,
  };
}

export const getModels = async (
  queryRouter: QueryRouter,
  limit: number = 50,
  skip: number = 0,
  sort: string = "name",
  vendor?: string,
  modality?: string,
  accessType?: string,
  opennessType?: string,
  modelFamily?: string,
  category?: string,
  capability?: string,
  researchArea?: string,
) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: "model",
    operation: "findMany",
  };

  const isTrending = sort === "trending";
  const needsFullSort =
    isTrending || sort === "benchmark" || sort === "papers";

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.model.findMany({
      where: {
        ...(vendor
          ? {
            vendor: {
              equals: vendor,
              mode: "insensitive",
            },
          }
          : {}),
        ...(modality
          ? {
            modality: {
              equals: modality,
              mode: "insensitive",
            },
          }
          : {}),
        ...(accessType
          ? {
            accessType: {
              equals: accessType,
              mode: "insensitive",
            },
          }
          : {}),
        ...(opennessType
          ? {
            opennessType: {
              equals: opennessType,
              mode: "insensitive",
            },
          }
          : {}),
        ...(modelFamily
          ? {
            OR: [
              {
                modelFamily: {
                  equals: modelFamily,
                  mode: "insensitive",
                },
              },
              {
                model_family: {
                  equals: modelFamily,
                  mode: "insensitive",
                },
              },
            ],
          }
          : {}),
        ...(category
          ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
          : {}),
        ...(capability
          ? {
            capabilities: {
              array_contains: [capability],
            },
          }
          : {}),
        ...(researchArea
          ? {
            researchAreas: {
              array_contains: [researchArea],
            },
          }
          : {}),

      },
      take: needsFullSort ? 200 : limit,
      skip: needsFullSort ? 0 : skip,
      orderBy:
        sort === "recent"
          ? { releaseDate: "desc" }
          : { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        vendor: true,
        vendor_logo_url: true,
        releaseDate: true,
        parameterCount: true,
        modality: true,
        accessType: true,
        opennessType: true,
        description: true,
        benchmark_score: true,
        model_family: true,
        modelFamily: true,
        category: true,
        capabilities: true,
        research_areas: true,
        researchAreas: true,
        architecture: true,
        context_window: true,
        contextWindow: true,
        license: true,
        model_versions: true,
        modelVersions: true,
        release_notes: true,
        releaseNotes: true,
        paper_url: true,
        paperUrl: true,
        repository_url: true,
        repositoryUrl: true,
        api_url: true,
        apiUrl: true,
        trendingScore: true,
        createdAt: true,
        _count: {
          select: {
            papers: true,
          },
        },
        papers: isTrending
          ? {
            take: 100,
            select: {
              paper: {
                select: {
                  id: true,
                  citationCount: true,
                  githubStars: true,
                },
              },
            },
          }
          : false,
      },
    });
  });

  const modelsById = new Map<string, any>();

  for (const result of routingResult.results) {
    for (const model of result) {
      if (!modelsById.has(model.id)) {
        modelsById.set(model.id, model);
      } else {
        const existing = modelsById.get(model.id);

        if (existing) {
          existing._count.papers += model._count.papers;
        }
      }
    }
  }

  const models = Array.from(modelsById.values()).map((model) => {
    let citationCount = 0;
    let githubStars = 0;

    if (isTrending && model.papers) {
      const seenPaperIds = new Set<string>();

      for (const paperRelation of model.papers) {
        const paper = paperRelation.paper;

        if (seenPaperIds.has(paper.id)) continue;

        seenPaperIds.add(paper.id);

        citationCount += paper.citationCount || 0;
        githubStars += paper.githubStars || 0;
      }
    }

    const trendingScore = citationCount + githubStars;

    return {
      id: model.id,
      name: model.name,
      slug: model.slug,
      vendor: model.vendor,
      vendorLogoUrl: model.vendor_logo_url,
      releaseDate: model.releaseDate,
      parameterCount: model.parameterCount,
      modality: model.modality,
      accessType: model.accessType,
      opennessType: model.opennessType,
      description: model.description,
      benchmarkScore: model.benchmark_score,
      modelFamily: model.modelFamily ?? model.model_family,
      category: model.category,
      capabilities: model.capabilities,
      researchAreas: model.researchAreas ?? model.research_areas,
      architecture: model.architecture,
      contextWindow: model.contextWindow ?? model.context_window,
      license: model.license,
      modelVersions: model.modelVersions ?? model.model_versions,
      releaseNotes: model.releaseNotes ?? model.release_notes,
      paperUrl: model.paperUrl ?? model.paper_url,
      repositoryUrl: model.repositoryUrl ?? model.repository_url,
      apiUrl: model.apiUrl ?? model.api_url,
      huggingFaceUrl: resolveHuggingFaceUrl(model),
      createdAt: model.createdAt,
      trendingScore: model.trendingScore,
      paperCount: model._count.papers,
      citationCount: isTrending ? citationCount : undefined,
      githubStars: isTrending ? githubStars : undefined,
    };
  });

  models.sort((a, b) => {
    if (sort === "recent") {
      const dateA = a.releaseDate
        ? new Date(a.releaseDate).getTime()
        : 0;

      const dateB = b.releaseDate
        ? new Date(b.releaseDate).getTime()
        : 0;

      return dateB - dateA;
    }

    if (sort === "trending") {
      const scoreDiff = (b.trendingScore || 0) - (a.trendingScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const paperDiff = b.paperCount - a.paperCount;
      if (paperDiff !== 0) return paperDiff;
      return a.name.localeCompare(b.name);
    }

    if (sort === "papers") {
      return b.paperCount - a.paperCount;
    }

    if (sort === "benchmark") {
      const scoreA =
        typeof a.benchmarkScore?.mmlu === "number"
          ? a.benchmarkScore.mmlu
          : 0;

      const scoreB =
        typeof b.benchmarkScore?.mmlu === "number"
          ? b.benchmarkScore.mmlu
          : 0;

      return scoreB - scoreA;
    }

    return a.name.localeCompare(b.name);
  });

  return needsFullSort
    ? models.slice(skip, skip + limit)
    : models.slice(0, limit);
};

export const getModelBySlug = async (
  queryRouter: QueryRouter,
  slug: string,
) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: "model",
    operation: "findUnique",
    filters: { slug },
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    // 1. First try findUnique by slug
    let modelRecord = await prisma.model.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        vendor: true,
        vendor_logo_url: true,
        releaseDate: true,
        parameterCount: true,
        modality: true,
        accessType: true,
        opennessType: true,
        description: true,
        benchmark_score: true,
        model_family: true,
        modelFamily: true,
        category: true,
        capabilities: true,
        research_areas: true,
        researchAreas: true,
        architecture: true,
        context_window: true,
        contextWindow: true,
        license: true,
        model_versions: true,
        modelVersions: true,
        release_notes: true,
        releaseNotes: true,
        paper_url: true,
        paperUrl: true,
        repository_url: true,
        repositoryUrl: true,
        api_url: true,
        apiUrl: true,
        createdAt: true,
        _count: {
          select: {
            papers: true,
          },
        },
        papers: {
          take: 100,
          select: {
            paper: {
              select: {
                id: true,
                title: true,
                slug: true,
                citationCount: true,
                githubStars: true,
              },
            },
          },
          orderBy: { paper: { githubStars: "desc" } },
        },
      },
    });

    // 2. Fallback to findFirst if findUnique failed (case-insensitive or name match)
    if (!modelRecord) {
      modelRecord = await prisma.model.findFirst({
        where: {
          OR: [
            { slug: { equals: slug, mode: "insensitive" as const } },
            { id: slug },
            { name: { equals: slug, mode: "insensitive" as const } },
            { slug: { contains: slug, mode: "insensitive" as const } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          vendor: true,
          vendor_logo_url: true,
          releaseDate: true,
          parameterCount: true,
          modality: true,
          accessType: true,
          opennessType: true,
          description: true,
          benchmark_score: true,
          model_family: true,
          modelFamily: true,
          category: true,
          capabilities: true,
          research_areas: true,
          researchAreas: true,
          architecture: true,
          context_window: true,
          contextWindow: true,
          license: true,
          model_versions: true,
          modelVersions: true,
          release_notes: true,
          releaseNotes: true,
          paper_url: true,
          paperUrl: true,
          repository_url: true,
          repositoryUrl: true,
          api_url: true,
          apiUrl: true,
          createdAt: true,
          _count: {
            select: {
              papers: true,
            },
          },
          papers: {
            take: 100,
            select: {
              paper: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  citationCount: true,
                  githubStars: true,
                },
              },
            },
            orderBy: { paper: { githubStars: "desc" } },
          },
        },
      });
    }

    if (!modelRecord) {
      return [null, [], [], []];
    }

    const actualSlug = modelRecord.slug;
    const actualId = modelRecord.id;

    // 3. Fetch related papers, related models, and direct benchmark rankings in parallel
    const [modelPapers, relatedModels, directRankings] = await Promise.all([
      prisma.paper.findMany({
        take: 200,
        where: {
          models: {
            some: {
              model: {
                OR: [
                  { id: actualId },
                  { slug: actualSlug },
                ],
              },
            },
          },
        },
        select: {
          id: true,
          citationCount: true,
          githubStars: true,
          tasks: {
            select: {
              task: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          methods: {
            select: {
              method: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: true,
                },
              },
            },
          },
          datasets: {
            select: {
              dataset: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          rankings: {
            select: {
              rank: true,
              benchmark: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),

      prisma.model.findMany({
        take: 6,
        where: {
          slug: {
            not: actualSlug,
          },
          papers: {
            some: {
              paper: {
                models: {
                  some: {
                    model: {
                      OR: [
                        { id: actualId },
                        { slug: actualSlug },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              papers: true,
            },
          },
        },
      }),

      prisma.ranking.findMany({
        where: {
          OR: [
            { model_id: actualId },
            { model_name: { equals: modelRecord.name, mode: "insensitive" as const } },
            { model_name: { contains: modelRecord.name, mode: "insensitive" as const } },
            { model_name: { contains: actualSlug, mode: "insensitive" as const } },
          ],
        },
        take: 25,
        orderBy: { rank: "asc" as const },
        select: {
          rank: true,
          score: true,
          score_str: true,
          metric: true,
          verified: true,
          benchmark: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              domain: true,
            },
          },
        },
      }),
    ]);

    return [modelRecord, modelPapers, relatedModels, directRankings];
  });

  let baseModel: any = null;
  let paperCount = 0;

  const allPapers: any[] = [];
  const allModelPapers: any[] = [];
  const directRankingsList: any[] = [];

  const relatedModelsById = new Map<string, any>();

  for (const result of routingResult.results) {
    const [model, modelPapers, relatedModels, directRankings] = result;

    if (model) {
      paperCount += model._count.papers;

      if (!baseModel) {
        const { papers, ...rest } = model;
        baseModel = { ...rest };
      }

      allPapers.push(...model.papers);
    }

    if (Array.isArray(modelPapers)) {
      allModelPapers.push(...modelPapers);
    }

    if (Array.isArray(relatedModels)) {
      for (const relatedModel of relatedModels) {
        if (!relatedModelsById.has(relatedModel.id)) {
          relatedModelsById.set(relatedModel.id, relatedModel);
        }
      }
    }

    if (Array.isArray(directRankings)) {
      directRankingsList.push(...directRankings);
    }
  }

  if (!baseModel) return null;

  const seenPaperIds = new Set<string>();
  const dedupPapers = [];

  for (const paperRelation of allPapers) {
    if (!seenPaperIds.has(paperRelation.paper.id)) {
      seenPaperIds.add(paperRelation.paper.id);
      dedupPapers.push(paperRelation);
    }
  }

  const tasksBySlug = new Map<string, any>();
  const methodsBySlug = new Map<string, any>();
  const datasetsBySlug = new Map<string, any>();
  const benchmarksBySlug = new Map<string, any>();

  let citationCount = 0;
  let githubStars = 0;

  // Fallback search across papers if junction table has 0 papers
  if (dedupPapers.length === 0 && baseModel.name) {
    const searchTerms = [
      baseModel.name,
      baseModel.slug.replace(/-/g, " "),
    ].filter((t: string) => t && t.length > 2);

    if (searchTerms.length > 0) {
      const fallbackIntent: QueryIntent = {
        type: QueryType.READ,
        entity: "paper",
        operation: "findMany",
      };

      const fallbackResult = await queryRouter.routeQuery(fallbackIntent, async (prisma) => {
        return prisma.paper.findMany({
          where: {
            OR: searchTerms.map((term: string) => [
              { title: { contains: term, mode: "insensitive" as const } },
              { abstract: { contains: term, mode: "insensitive" as const } },
            ]).flat(),
          },
          take: 50,
          orderBy: [
            { githubStars: "desc" as const },
            { citationCount: "desc" as const },
          ],
          select: {
            id: true,
            title: true,
            slug: true,
            citationCount: true,
            githubStars: true,
            tasks: {
              select: {
                task: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                  },
                },
              },
            },
            methods: {
              select: {
                method: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    category: true,
                  },
                },
              },
            },
            datasets: {
              select: {
                dataset: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            rankings: {
              select: {
                rank: true,
                benchmark: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        });
      });

      for (const res of fallbackResult.results) {
        if (Array.isArray(res)) {
          for (const p of res) {
            if (!seenPaperIds.has(p.id)) {
              seenPaperIds.add(p.id);
              dedupPapers.push({
                paper_id: p.id,
                model_id: baseModel.id,
                paper: {
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  citationCount: p.citationCount || 0,
                  githubStars: p.githubStars || 0,
                },
              });
              allModelPapers.push(p);
            }
          }
        }
      }
      paperCount = dedupPapers.length;
    }
  }

  const seenModelPaperIds = new Set<string>();

  for (const paper of allModelPapers) {
    if (seenModelPaperIds.has(paper.id)) continue;

    seenModelPaperIds.add(paper.id);

    citationCount += paper.citationCount || 0;
    githubStars += paper.githubStars || 0;

    for (const taskRelation of paper.tasks || []) {
      const task = taskRelation.task;
      if (task && !tasksBySlug.has(task.slug)) {
        tasksBySlug.set(task.slug, task);
      }
    }

    for (const methodRelation of paper.methods || []) {
      const method = methodRelation.method;
      if (method && !methodsBySlug.has(method.slug)) {
        methodsBySlug.set(method.slug, method);
      }
    }

    for (const datasetRelation of paper.datasets || []) {
      const dataset = datasetRelation.dataset;
      if (dataset && !datasetsBySlug.has(dataset.slug)) {
        datasetsBySlug.set(dataset.slug, dataset);
      }
    }

    for (const ranking of paper.rankings || []) {
      const benchmark = ranking.benchmark;
      if (benchmark && !benchmarksBySlug.has(benchmark.slug)) {
        benchmarksBySlug.set(benchmark.slug, {
          ...benchmark,
          rank: ranking.rank,
        });
      }
    }
  }

  // Integrate direct SOTA rankings for this model
  for (const directRank of directRankingsList) {
    if (directRank && directRank.benchmark) {
      const b = directRank.benchmark;
      if (!benchmarksBySlug.has(b.slug)) {
        benchmarksBySlug.set(b.slug, {
          id: b.id,
          name: b.name,
          slug: b.slug,
          category: b.category,
          domain: b.domain,
          rank: directRank.rank,
          score: directRank.score,
          scoreStr: directRank.score_str,
          metric: directRank.metric,
          verified: directRank.verified,
        });
      }
    }
  }

  dedupPapers.sort((a, b) => {
    const scoreA = Math.max(
      a.paper.githubStars || 0,
      a.paper.citationCount || 0,
    );

    const scoreB = Math.max(
      b.paper.githubStars || 0,
      b.paper.citationCount || 0,
    );

    return scoreB - scoreA;
  });

  const modelFamily = baseModel.modelFamily ?? baseModel.model_family;
  const familyModels: any[] = [];
  if (modelFamily || baseModel.vendor) {
    const familyQueryIntent: QueryIntent = {
      type: QueryType.READ,
      entity: "model",
      operation: "findMany",
    };
    const familyResult = await queryRouter.routeQuery(familyQueryIntent, async (prisma) => {
      return prisma.model.findMany({
        where: {
          OR: [
            ...(modelFamily
              ? [
                  { modelFamily: { equals: modelFamily, mode: "insensitive" as const } },
                  { model_family: { equals: modelFamily, mode: "insensitive" as const } },
                  { name: { contains: modelFamily, mode: "insensitive" as const } },
                ]
              : []),
            ...(baseModel.vendor
              ? [{ vendor: { equals: baseModel.vendor, mode: "insensitive" as const } }]
              : []),
          ],
        },
        take: 20,
        orderBy: [
          { releaseDate: "asc" as const },
          { name: "asc" as const },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          vendor: true,
          vendor_logo_url: true,
          parameterCount: true,
          architecture: true,
          releaseDate: true,
          contextWindow: true,
          opennessType: true,
          modelFamily: true,
        },
      });
    });

    const seenFamilyIds = new Set<string>();
    for (const res of familyResult.results) {
      if (Array.isArray(res)) {
        for (const m of res) {
          if (!seenFamilyIds.has(m.id)) {
            seenFamilyIds.add(m.id);
            familyModels.push({
              id: m.id,
              name: m.name,
              slug: m.slug,
              vendor: m.vendor,
              vendorLogoUrl: m.vendor_logo_url,
              parameterCount: m.parameterCount,
              architecture: m.architecture,
              releaseDate: m.releaseDate,
              contextWindow: m.contextWindow,
              opennessType: m.opennessType,
              modelFamily: m.modelFamily,
            });
          }
        }
      }
    }
  }

  return {
    id: baseModel.id,
    name: baseModel.name,
    slug: baseModel.slug,
    vendor: baseModel.vendor,
    vendorLogoUrl: baseModel.vendor_logo_url,
    releaseDate: baseModel.releaseDate,
    parameterCount: baseModel.parameterCount,
    modality: baseModel.modality,
    accessType: baseModel.accessType,
    opennessType: baseModel.opennessType,
    description: baseModel.description,
    benchmarkScore: baseModel.benchmark_score,
    modelFamily: baseModel.modelFamily ?? baseModel.model_family,
    category: baseModel.category,
    capabilities: baseModel.capabilities,
    researchAreas: baseModel.researchAreas ?? baseModel.research_areas,
    architecture: baseModel.architecture,
    contextWindow: baseModel.contextWindow ?? baseModel.context_window,
    license: baseModel.license,
    modelVersions: baseModel.modelVersions ?? baseModel.model_versions,
    releaseNotes: baseModel.releaseNotes ?? baseModel.release_notes,
    paperUrl: baseModel.paperUrl ?? baseModel.paper_url,
    repositoryUrl: baseModel.repositoryUrl ?? baseModel.repository_url,
    apiUrl: baseModel.apiUrl ?? baseModel.api_url,
    huggingFaceUrl: resolveHuggingFaceUrl(baseModel),
    hardware: calculateHardwareRequirements({
      parameterCount: baseModel.parameterCount,
      architecture: baseModel.architecture,
      name: baseModel.name,
    }),
    runSnippets: generateRunSnippets({
      name: baseModel.name,
      slug: baseModel.slug,
      vendor: baseModel.vendor,
      parameterCount: baseModel.parameterCount,
      huggingFaceUrl: resolveHuggingFaceUrl(baseModel),
      apiUrl: baseModel.apiUrl ?? baseModel.api_url,
    }),
    createdAt: baseModel.createdAt,
    paperCount,
    citationCount,
    githubStars,
    papers: dedupPapers.slice(0, 100),
    tasks: Array.from(tasksBySlug.values()),
    methods: Array.from(methodsBySlug.values()),
    datasets: Array.from(datasetsBySlug.values()),
    benchmarks: Array.from(benchmarksBySlug.values()),
    familyModels,
    relatedModels: Array.from(relatedModelsById.values()).map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      paperCount: model._count.papers,
    })),
  };
};

export const getModelFacets = async (queryRouter: QueryRouter) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: "model",
    operation: "facets",
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return prisma.model.findMany({
      select: {
        id: true,
        vendor: true,
        modality: true,
        accessType: true,
        opennessType: true,
        model_family: true,
        modelFamily: true,
        capabilities: true,
        research_areas: true,
        researchAreas: true,
      },
    });
  });

  const modelsById = new Map<string, any>();

  for (const result of routingResult.results) {
    for (const model of result) {
      if (!modelsById.has(model.id)) {
        modelsById.set(model.id, model);
      }
    }
  }

  const vendors = new Map<string, number>();
  const modalities = new Map<string, number>();
  const accessTypes = new Map<string, number>();
  const opennessTypes = new Map<string, number>();
  const modelFamilies = new Map<string, number>();
  const capabilities = new Map<string, number>();
  const researchAreas = new Map<string, number>();

  const incrementCount = (
    map: Map<string, number>,
    value: string | null,
  ) => {
    if (!value) return;

    map.set(value, (map.get(value) || 0) + 1);
  };

  for (const model of modelsById.values()) {
    incrementCount(vendors, model.vendor);
    incrementCount(modalities, model.modality);
    incrementCount(accessTypes, model.accessType);
    incrementCount(opennessTypes, model.opennessType);
    incrementCount(
      modelFamilies,
      model.modelFamily ?? model.model_family,
    );

    const modelCapabilities = Array.isArray(model.capabilities)
      ? model.capabilities
      : [];

    for (const capability of modelCapabilities) {
      if (typeof capability === "string") {
        incrementCount(capabilities, capability);
      }
    }

    const modelResearchAreas =
      model.researchAreas ?? model.research_areas;

    if (Array.isArray(modelResearchAreas)) {
      for (const researchArea of modelResearchAreas) {
        if (typeof researchArea === "string") {
          incrementCount(researchAreas, researchArea);
        }
      }
    }
  }

  const toFacetArray = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

  return {
    totalModels: modelsById.size,
    vendors: toFacetArray(vendors),
    modalities: toFacetArray(modalities),
    accessTypes: toFacetArray(accessTypes),
    opennessTypes: toFacetArray(opennessTypes),
    modelFamilies: toFacetArray(modelFamilies),
    capabilities: toFacetArray(capabilities),
    researchAreas: toFacetArray(researchAreas),
  };
};

export const compareModels = async (
  queryRouter: QueryRouter,
  slugs: string[],
) => {
  const cleanSlugs = slugs
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
    .slice(0, 4);

  if (cleanSlugs.length < 2) {
    throw new Error("At least 2 model slugs are required for comparison.");
  }

  const rawModels = await Promise.all(
    cleanSlugs.map((slug) => getModelBySlug(queryRouter, slug)),
  );
  const models = rawModels.filter((m): m is NonNullable<typeof m> => m !== null);

  if (models.length < 2) {
    throw new Error("Could not find at least 2 valid models for comparison.");
  }

  const allBenchmarkNames = new Set<string>();
  for (const m of models) {
    if (m?.benchmarkScore && typeof m.benchmarkScore === "object") {
      Object.keys(m.benchmarkScore).forEach((b) => allBenchmarkNames.add(b));
    }
    if (Array.isArray(m?.benchmarks)) {
      m.benchmarks.forEach((b: any) => {
        if (b?.name) allBenchmarkNames.add(b.name);
      });
    }
  }

  const benchmarkComparison = Array.from(allBenchmarkNames).map((benchmarkName) => {
    const scores: Record<string, number | null> = {};
    let highestScore = -Infinity;
    let winnerSlug: string | null = null;

    for (const m of models) {
      let score: number | null = null;
      if (m?.benchmarkScore && typeof m.benchmarkScore[benchmarkName] === "number") {
        score = m.benchmarkScore[benchmarkName];
      } else if (Array.isArray(m?.benchmarks)) {
        const found = m.benchmarks.find(
          (b: any) => b?.name?.toLowerCase() === benchmarkName.toLowerCase(),
        );
        if (found) {
          score = typeof found.score === "number" ? found.score : parseFloat(found.scoreStr || found.score);
        }
      }

      scores[m.slug] = isNaN(score as number) ? null : score;

      if (score !== null && !isNaN(score) && score > highestScore) {
        highestScore = score;
        winnerSlug = m.slug;
      }
    }

    return {
      benchmark: benchmarkName,
      scores,
      winner: winnerSlug,
    };
  });

  const specComparison = {
    parameterCount: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.parameterCount }), {}),
    contextWindow: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.contextWindow }), {}),
    architecture: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.architecture }), {}),
    license: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.license }), {}),
    hardwareTier: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.hardware?.hardwareTier }), {}),
    fitsOn6GbGpu: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.hardware?.fitsOn6GbGpu }), {}),
    minVramQuantizedGb: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.hardware?.minVramQuantizedGb }), {}),
    minVramFp16Gb: models.reduce((acc, m) => ({ ...acc, [m.slug]: m.hardware?.minVramFp16Gb }), {}),
  };

  return {
    models: models.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      vendor: m.vendor,
      vendorLogoUrl: m.vendorLogoUrl,
      parameterCount: m.parameterCount,
      hardware: m.hardware,
    })),
    benchmarkComparison,
    specComparison,
  };
};