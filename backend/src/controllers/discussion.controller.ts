import { Context } from "hono";
import * as discussionService from "../services/discussion.service.js";
import { redisManager } from "../lib/redis.js";

export const getDiscussions = async (c: Context) => {
  const cacheKey = "discussions:list";

  try {
    const redis = redisManager.getClient();
    let cached = null;

    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error("Redis GET failed for discussions:", err);
    }

    if (cached) {
      return c.json(cached as any, 200);
    }

    const discussions = await discussionService.getDiscussions();
    const response = {
      status: "success",
      count: discussions.length,
      data: discussions,
    };

    try {
      await redis.set(cacheKey, response, { ex: 600 }); // Cache for 10 minutes
    } catch (err) {
      console.error("Redis SET failed for discussions:", err);
    }

    return c.json(response, 200);
  } catch (error: any) {
    console.error("Discussion Error:", error);
    return c.json(
      {
        status: "error",
        detail: error.message,
      },
      500
    );
  }
};