import { Context } from 'hono';
import * as methodService from '../services/method.service.js';
import { redisManager } from '../lib/redis.js';

// ---------------------------------------------------------------------------
// Version-counter helpers for method list cache
// Same pattern as papers — INCR the version on any mutation so versioned list
// keys are silently superseded without any wildcard scan.
// ---------------------------------------------------------------------------

const getMethodsVersion = async (): Promise<string> => {
  try {
    const redis = redisManager.getClient();
    const v = await redis.get('methods:version');
    return v ? String(v) : '0';
  } catch {
    return '0';
  }
};

const bumpMethodsVersion = async (): Promise<void> => {
  try {
    const redis = redisManager.getClient();
    await redis.incr('methods:version');
  } catch (err) {
    console.error('Redis methods version bump failed:', err);
  }
};

const localMethodCache = new Map<string, { data: any; expiresAt: number }>();
const LOCAL_METHOD_TTL = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Read handlers
// ---------------------------------------------------------------------------

export const getMethods = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const sort = c.req.query('sort') || 'name';
  const search = c.req.query('search') || '';
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 20;

  try {
    const version = await getMethodsVersion();
    const cacheKey = `methods:v${version}:list:${sort}:${search}:${page}:${limit}`;

    // 1. Instant local memory hit (0.1ms)
    const localHit = localMethodCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    // 2. Redis hit
    const redis = redisManager.getClient();
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      localMethodCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_METHOD_TTL });
      return c.json(cached as any, 200);
    }

    const result = await methodService.getMethods(queryRouter, {
      sort,
      search: search || undefined,
      page,
      limit,
    });

    const response = {
      status: 'success',
      count: result.methods.length,
      data: result,
    };

    localMethodCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_METHOD_TTL });

    try {
      await redis.set(cacheKey, response, { ex: 900 }); // 15 minutes
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const getGroupedMethods = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const cacheKey = 'methods:grouped';

  try {
    const localHit = localMethodCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      localMethodCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_METHOD_TTL });
      return c.json(cached as any, 200);
    }

    const grouped = await methodService.getGroupedMethods(queryRouter);
    const response = {
      status: 'success',
      data: grouped,
    };

    localMethodCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_METHOD_TTL });

    try {
      await redis.set(cacheKey, response, { ex: 1800 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const getMethodBySlug = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const slug = c.req.param('slug') as string;
  const cacheKey = `method:${slug}`;

  try {
    const localHit = localMethodCache.get(cacheKey);
    if (localHit && Date.now() < localHit.expiresAt) {
      return c.json(localHit.data, 200);
    }

    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Redis GET failed:', err);
    }

    if (cached) {
      localMethodCache.set(cacheKey, { data: cached, expiresAt: Date.now() + LOCAL_METHOD_TTL });
      return c.json(cached as any, 200);
    }

    const method = await methodService.getMethodBySlug(queryRouter, slug);
    if (!method) return c.json({ status: 'error', message: 'Method not found' }, 404);

    const response = { status: 'success', data: method };

    localMethodCache.set(cacheKey, { data: response, expiresAt: Date.now() + LOCAL_METHOD_TTL });

    try {
      await redis.set(cacheKey, response, { ex: 600 });
    } catch (err) {
      console.error('Redis SET failed:', err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

// ---------------------------------------------------------------------------
// Mutation handlers — each invalidates relevant cache keys
// ---------------------------------------------------------------------------

export const seedCategories = async (c: Context) => {
  const prisma = c.var.prisma;
  const CATEGORY_MAP: Record<string, string[]> = {
    "General": ["llm", "multi-head-attention", "softmax", "layer-normalization", "mac-tuning"],
    "Language": ["bert", "gpt", "t5", "seq2seq", "attention", "mamba-2", "performer", "bleu", "rouge", "fasttext", "speculative-decoding", "sliding-window-attention", "gated-deltanet"],
    "Vision": ["clip", "llava", "vision-transformer", "sam", "dino", "resnet", "u-net", "convnext", "mask-r-cnn", "yolo", "nerf", "vit", "r-cnn", "swin-transformer"],
    "Audio & Speech": ["whisper", "wavenet", "conformer", "soundstream", "rnn-transducer", "wav2vec", "fast-conformer", "neural-audio-codec", "spectrogram", "tdt"],
    "Agents": ["react", "mcp", "function-calling", "agent-skills", "multi-turn", "tool-use", "autogpt", "agent-frameworks", "planning", "memory"],
    "Reasoning": ["chain-of-thought", "tree-of-thoughts", "grpo", "reasoning-model", "self-refine", "reflection", "deep-research", "xavier-initialization", "context-rot", "test-time-compute"],
    "Training": ["pre-training", "fine-tuning", "peft", "qlora", "lora", "prompt-engineering", "data-augmentation", "curriculum-learning", "teacher-forcing", "label-smoothing", "contrastive-learning", "self-supervised-learning", "training"],
    "Optimization": ["adam", "adamw", "sgd", "adafactor", "weight-decay", "gradient-clipping", "learning-rate-scheduler", "cosine-annealing", "batch-normalization", "dropout", "optimization", "regularization"],
    "Inference": ["kv-cache", "ttft", "prefill", "quantization", "pruning", "distillation", "knowledge-distillation", "flash-attention", "vllm"],
    "Retrieval": ["rag", "colbert", "reranker", "bm25", "dense-retrieval", "hybrid-search", "vector-search", "reranking", "embedding-search", "context-retrieval", "retrieval-augmented-generation"],
    "Reinforcement Learning": ["ppo", "dpo", "rlhf", "rlvr", "online-rl", "muzero", "alphazero", "reinforce", "reward-model", "reinforcement-learning"],
    "Diffusion & Generation": ["stable-diffusion", "dit", "flow-matching", "diffusion-policy", "vae", "gan", "biggan", "score-based-models", "generative-adversarial-networks", "inpainting", "diffusion"],
    "Multimodal": ["blip", "flamingo", "kosmos", "imagebind", "video-llava", "audioclip", "text-to-image", "text-to-video"],
    "Architectures": ["transformer", "transformers", "mamba", "moe", "mixture-of-experts", "state-space-models", "cnn", "rnn", "lstm", "gcn", "big-bird", "graph-neural-networks", "graph-neural-network", "architecture", "sparse-attention"],
    "Evaluation": ["pass-1", "llm-as-a-judge", "human-eval", "perplexity", "f1-score", "exact-match", "auc", "meteor"],
    "Embeddings": ["word2vec", "glove", "elmo", "bert-embedding", "sentence-transformer", "openai-embedding", "cohere-embedding", "embedding-models", "dense-embedding", "embedding", "embeddings"]
  };
  
  let updatedCount = 0;
  for (const [category, slugs] of Object.entries(CATEGORY_MAP)) {
    for (const slug of slugs) {
      try {
        const method = await prisma.method.findUnique({ where: { slug } });
        if (method) {
          await prisma.method.update({ where: { slug }, data: { category } });
          updatedCount++;
        }
      } catch (e) {}
    }
  }

  // Seed operation touches all methods — invalidate fully
  await bumpMethodsVersion();
  try {
    const redis = redisManager.getClient();
    await redis.del('methods:grouped');
  } catch (err) {
    console.error('Cache invalidation failed after seed:', err);
  }
  
  return c.json({ status: 'success', updated: updatedCount });
};

export const createMethod = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const body = await c.req.json();

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return c.json({ status: 'error', message: 'Name is required' }, 400);
  }

  try {
    const method = await methodService.createMethod(queryRouter, { name: body.name.trim() });

    // Invalidate list cache (bump version) + grouped cache
    await bumpMethodsVersion();
    try {
      const redis = redisManager.getClient();
      await redis.del('methods:grouped');
    } catch (err) {
      console.error('Cache invalidation failed:', err);
    }

    return c.json({ status: 'success', data: method }, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return c.json({ status: 'error', message: 'A method with this name already exists' }, 409);
    }
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const updateMethod = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const slug = c.req.param('slug') as string;
  const body = await c.req.json();

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return c.json({ status: 'error', message: 'Name must be a non-empty string' }, 400);
  }

  try {
    const method = await methodService.updateMethod(queryRouter, slug, {
      name: body.name ? body.name.trim() : undefined,
    });

    // Invalidate: list version + grouped + this specific slug detail
    await bumpMethodsVersion();
    try {
      const redis = redisManager.getClient();
      await redis.del('methods:grouped');
      await redis.del(`method:${slug}`);
      // If name changed, the slug may have changed too — delete both
      if (method && (method as any).slug && (method as any).slug !== slug) {
        await redis.del(`method:${(method as any).slug}`);
      }
    } catch (err) {
      console.error('Cache invalidation failed:', err);
    }

    return c.json({ status: 'success', data: method }, 200);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ status: 'error', message: 'Method not found' }, 404);
    }
    if (error.code === 'P2002') {
      return c.json({ status: 'error', message: 'A method with this name already exists' }, 409);
    }
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};

export const deleteMethod = async (c: Context) => {
  const queryRouter = c.var.queryRouter as any;
  const slug = c.req.param('slug') as string;

  try {
    await methodService.deleteMethod(queryRouter, slug);

    // Invalidate: list version + grouped + this specific slug detail
    await bumpMethodsVersion();
    try {
      const redis = redisManager.getClient();
      await redis.del('methods:grouped');
      await redis.del(`method:${slug}`);
    } catch (err) {
      console.error('Cache invalidation failed:', err);
    }

    return c.json({ status: 'success', message: 'Method deleted' }, 200);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return c.json({ status: 'error', message: 'Method not found' }, 404);
    }
    return c.json({ status: 'error', detail: error.message }, 500);
  }
};
