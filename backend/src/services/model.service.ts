import { QueryRouter } from "../routing/index.js";
import { QueryIntent, QueryType } from "../routing/types.js";

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

  let baseModel: any = null;
  let paperCount = 0;

  const allPapers: any[] = [];
  const allModelPapers: any[] = [];

  const relatedModelsById = new Map<string, any>();

  for (const result of routingResult.results) {
    const [model, modelPapers, relatedModels] = result;

    if (model) {
      paperCount += model._count.papers;

      if (!baseModel) {
        const { papers, ...rest } = model;
        baseModel = { ...rest };
      }

      allPapers.push(...model.papers);
    }

    allModelPapers.push(...modelPapers);

    for (const relatedModel of relatedModels) {
      if (!relatedModelsById.has(relatedModel.id)) {
        relatedModelsById.set(relatedModel.id, relatedModel);
      }
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

  const seenModelPaperIds = new Set<string>();

  const tasksBySlug = new Map<string, any>();
  const methodsBySlug = new Map<string, any>();
  const datasetsBySlug = new Map<string, any>();
  const benchmarksBySlug = new Map<string, any>();

  let citationCount = 0;
  let githubStars = 0;

  for (const paper of allModelPapers) {
    if (seenModelPaperIds.has(paper.id)) continue;

    seenModelPaperIds.add(paper.id);

    citationCount += paper.citationCount || 0;
    githubStars += paper.githubStars || 0;

    for (const taskRelation of paper.tasks) {
      const task = taskRelation.task;

      if (!tasksBySlug.has(task.slug)) {
        tasksBySlug.set(task.slug, task);
      }
    }

    for (const methodRelation of paper.methods) {
      const method = methodRelation.method;

      if (!methodsBySlug.has(method.slug)) {
        methodsBySlug.set(method.slug, method);
      }
    }

    for (const datasetRelation of paper.datasets) {
      const dataset = datasetRelation.dataset;

      if (!datasetsBySlug.has(dataset.slug)) {
        datasetsBySlug.set(dataset.slug, dataset);
      }
    }

    for (const ranking of paper.rankings) {
      const benchmark = ranking.benchmark;

      if (!benchmarksBySlug.has(benchmark.slug)) {
        benchmarksBySlug.set(benchmark.slug, {
          ...benchmark,
          rank: ranking.rank,
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