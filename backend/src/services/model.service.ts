import { QueryRouter } from "../routing/index.js";
import { QueryIntent, QueryType } from "../routing/types.js";

interface PaperRef {
  id: string;
  citationCount: number;
  githubStars: number;
}

interface RelationItem {
  paper: PaperRef;
}

interface ModelRecord {
  id: string;
  name: string;
  slug: string;
  vendor: string;
  vendor_logo_url?: string | null;
  releaseDate?: Date | string | null;
  parameterCount?: string | null;
  modality?: string | null;
  accessType?: string | null;
  opennessType?: string | null;
  description?: string | null;
  benchmark_score?: Record<string, unknown> | null;
  modelFamily?: string | null;
  model_family?: string | null;
  category?: string | null;
  capabilities?: string[] | null;
  researchAreas?: string[] | null;
  research_areas?: string[] | null;
  architecture?: string | null;
  contextWindow?: string | null;
  context_window?: string | null;
  license?: string | null;
  modelVersions?: string[] | null;
  model_versions?: string[] | null;
  releaseNotes?: string | null;
  release_notes?: string | null;
  paperUrl?: string | null;
  paper_url?: string | null;
  repositoryUrl?: string | null;
  repository_url?: string | null;
  apiUrl?: string | null;
  api_url?: string | null;
  trendingScore?: number | null;
  createdAt: Date | string;
  _count: { papers: number };
  papers?: RelationItem[];
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
  researchArea?: string
) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: "model",
    operation: "findMany",
  };

  const isTrending = sort === "trending";
  const needsFullSort = isTrending || sort === "benchmark" || sort === "papers";

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
      take: needsFullSort ? Math.max(200, skip + limit) : limit,
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

  const modelsById = new Map<string, ModelRecord>();

  for (const result of routingResult.results) {
    if (!Array.isArray(result)) continue;
    for (const model of result as ModelRecord[]) {
      if (!modelsById.has(model.id)) {
        modelsById.set(model.id, model);
      } else {
        const existing = modelsById.get(model.id);
        if (existing && existing._count) {
          existing._count.papers += model._count?.papers || 0;
        }
      }
    }
  }

  const models = Array.from(modelsById.values()).map((model) => {
    let citationCount = 0;
    let githubStars = 0;

    if (isTrending && Array.isArray(model.papers)) {
      const seenPaperIds = new Set<string>();

      for (const paperRelation of model.papers) {
        const paper = paperRelation?.paper;
        if (!paper || !paper.id) continue;

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
      createdAt: model.createdAt,
      trendingScore: model.trendingScore ?? trendingScore,
      paperCount: model._count?.papers || 0,
      citationCount: isTrending ? citationCount : undefined,
      githubStars: isTrending ? githubStars : undefined,
    };
  });

  models.sort((a, b) => {
    if (sort === "recent") {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
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
      const benchmarkA = a.benchmarkScore as Record<string, number> | null;
      const benchmarkB = b.benchmarkScore as Record<string, number> | null;
      const scoreA = typeof benchmarkA?.mmlu === "number" ? benchmarkA.mmlu : 0;
      const scoreB = typeof benchmarkB?.mmlu === "number" ? benchmarkB.mmlu : 0;
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
  slug: string
) => {
  const intent: QueryIntent = {
    type: QueryType.READ,
    entity: "model",
    operation: "findUnique",
    filters: { slug },
  };

  const routingResult = await queryRouter.routeQuery(intent, async (prisma) => {
    return Promise.all([
      prisma.model.findUnique({
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
      }),

      prisma.paper.findMany({
        take: 200,
        where: {
          models: {
            some: {
              model: { slug },
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
            not: slug,
          },
          papers: {
            some: {
              paper: {
                models: {
                  some: {
                    model: { slug },
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
    ]);
  });

  let baseModel: ModelRecord | null = null;
  let paperCount = 0;

  const allPapers: RelationItem[] = [];
  const allModelPapers: Array<{
    id: string;
    citationCount: number;
    githubStars: number;
    tasks?: Array<{ task: { id: string; name: string; slug: string; color: string | null } }>;
    methods?: Array<{ method: { id: string; name: string; slug: string; category: string } }>;
    datasets?: Array<{ dataset: { id: string; name: string; slug: string } }>;
    rankings?: Array<{ rank: number; benchmark: { id: string; name: string; slug: string } }>;
  }> = [];

  const relatedModelsById = new Map<string, { id: string; name: string; slug: string; _count: { papers: number } }>();

  for (const result of routingResult.results) {
    if (!Array.isArray(result)) continue;
    const [model, modelPapers, relatedModels] = result;

    if (model) {
      paperCount += model._count?.papers || 0;

      if (!baseModel) {
        const { papers: _p, ...rest } = model;
        baseModel = { ...rest, _count: model._count };
      }

      if (Array.isArray(model.papers)) {
        allPapers.push(...model.papers);
      }
    }

    if (Array.isArray(modelPapers)) {
      allModelPapers.push(...modelPapers);
    }

    if (Array.isArray(relatedModels)) {
      for (const relatedModel of relatedModels) {
        if (relatedModel && !relatedModelsById.has(relatedModel.id)) {
          relatedModelsById.set(relatedModel.id, relatedModel);
        }
      }
    }
  }

  if (!baseModel) return null;

  const seenPaperIds = new Set<string>();
  const dedupPapers: RelationItem[] = [];

  for (const paperRelation of allPapers) {
    const paperId = paperRelation?.paper?.id;
    if (paperId && !seenPaperIds.has(paperId)) {
      seenPaperIds.add(paperId);
      dedupPapers.push(paperRelation);
    }
  }

  const seenModelPaperIds = new Set<string>();

  const tasksBySlug = new Map<string, unknown>();
  const methodsBySlug = new Map<string, unknown>();
  const datasetsBySlug = new Map<string, unknown>();
  const benchmarksBySlug = new Map<string, unknown>();

  let citationCount = 0;
  let githubStars = 0;

  for (const paper of allModelPapers) {
    if (!paper || !paper.id || seenModelPaperIds.has(paper.id)) continue;

    seenModelPaperIds.add(paper.id);

    citationCount += paper.citationCount || 0;
    githubStars += paper.githubStars || 0;

    if (Array.isArray(paper.tasks)) {
      for (const taskRelation of paper.tasks) {
        const task = taskRelation?.task;
        if (task && task.slug && !tasksBySlug.has(task.slug)) {
          tasksBySlug.set(task.slug, task);
        }
      }
    }

    if (Array.isArray(paper.methods)) {
      for (const methodRelation of paper.methods) {
        const method = methodRelation?.method;
        if (method && method.slug && !methodsBySlug.has(method.slug)) {
          methodsBySlug.set(method.slug, method);
        }
      }
    }

    if (Array.isArray(paper.datasets)) {
      for (const datasetRelation of paper.datasets) {
        const dataset = datasetRelation?.dataset;
        if (dataset && dataset.slug && !datasetsBySlug.has(dataset.slug)) {
          datasetsBySlug.set(dataset.slug, dataset);
        }
      }
    }

    if (Array.isArray(paper.rankings)) {
      for (const ranking of paper.rankings) {
        const benchmark = ranking?.benchmark;
        if (benchmark && benchmark.slug && !benchmarksBySlug.has(benchmark.slug)) {
          benchmarksBySlug.set(benchmark.slug, {
            ...benchmark,
            rank: ranking.rank,
          });
        }
      }
    }
  }

  dedupPapers.sort((a, b) => {
    const scoreA = Math.max(
      a.paper?.githubStars || 0,
      a.paper?.citationCount || 0
    );
    const scoreB = Math.max(
      b.paper?.githubStars || 0,
      b.paper?.citationCount || 0
    );
    return scoreB - scoreA;
  });

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
    createdAt: baseModel.createdAt,
    paperCount,
    citationCount,
    githubStars,
    papers: dedupPapers.slice(0, 100),
    tasks: Array.from(tasksBySlug.values()),
    methods: Array.from(methodsBySlug.values()),
    datasets: Array.from(datasetsBySlug.values()),
    benchmarks: Array.from(benchmarksBySlug.values()),
    relatedModels: Array.from(relatedModelsById.values()).map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      paperCount: model._count?.papers || 0,
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

  const modelsById = new Map<string, ModelRecord>();

  for (const result of routingResult.results) {
    if (!Array.isArray(result)) continue;
    for (const model of result as ModelRecord[]) {
      if (model && model.id && !modelsById.has(model.id)) {
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
    value: string | null | undefined
  ) => {
    if (!value || typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;

    map.set(trimmed, (map.get(trimmed) || 0) + 1);
  };

  for (const model of modelsById.values()) {
    incrementCount(vendors, model.vendor);
    incrementCount(modalities, model.modality);
    incrementCount(accessTypes, model.accessType);
    incrementCount(opennessTypes, model.opennessType);
    incrementCount(
      modelFamilies,
      model.modelFamily ?? model.model_family
    );

    const modelCapabilities = Array.isArray(model.capabilities)
      ? model.capabilities
      : [];

    for (const capability of modelCapabilities) {
      if (typeof capability === "string") {
        incrementCount(capabilities, capability);
      }
    }

    const modelResearchAreas = model.researchAreas ?? model.research_areas;

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