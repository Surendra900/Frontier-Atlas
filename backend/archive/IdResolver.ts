import { QueryRouter } from "./index.js";
import { QueryIntent, QueryType } from "./types.js";
import { ShardId } from "../database/shard-config.js";

export class IdResolver {
  constructor(
    private readonly redisManager: typeof import("../lib/redis.js").redisManager,
    private readonly queryRouter: QueryRouter,
  ) {}

  async getShardForPaper(id: string): Promise<ShardId | null> {
    const redis = this.redisManager.getClient();

    try {
      const cacheKey = `paper:shard:${id}`;
      const shardStr = await redis.get(cacheKey);

      if (!shardStr) return null;

      const shard = Number(shardStr);
      return isNaN(shard) ? null : (shard as ShardId);
    } catch {
      return null;
    }
  }

  async cachePaperLocation(id: string, shard: ShardId): Promise<void> {
    const redis = this.redisManager.getClient();

    try {
      const cacheKey = `paper:shard:${id}`;
      await redis.set(cacheKey, shard.toString(), { ex: 60 * 60 * 24 }); // 24 hours
    } catch {
      // Ignore cache failures - non-blocking
    }
  }

  async resolvePaper(id: string) {
    const cachedShard = await this.getShardForPaper(id);

    const intent: QueryIntent = {
      type: QueryType.READ,
      entity: "paper",
      operation: "findUnique",
      filters: { id },
      shardHint: cachedShard ?? undefined,
    };

    if (cachedShard !== null) {
      // Cache HIT: Route only to the specific shard
      const result = await this.queryRouter.routeQuery(
        intent,
        async (prisma, shardId) => {
          if (shardId !== cachedShard) return null;

          return prisma.paper.findUnique({
            where: { id },
            select: {
              id: true,
              slug: true,
              title: true,
              abstract: true,
              thumbnailUrl: true,
              publicationDate: true,
              paperUrl: true,
              githubUrl: true,
              githubStars: true,
            },
          });
        },
      );

      return result.results.find(Boolean) ?? null;
    }

    // Cache MISS: Search all shards + heal cache
    const result = await this.queryRouter.routeQuery(
      intent,
      async (prisma, shardId) => {
        const paper = await prisma.paper.findUnique({
          where: { id },
          include: {
            authors: { include: { author: true } },
            tasks: { include: { task: true } },
            methods: { include: { method: true } },
          },
        });

        if (paper && shardId !== undefined) {
          await this.cachePaperLocation(id, shardId);
        }

        return paper;
      },
    );

    return result.results.find(Boolean) ?? null;
  }
}
