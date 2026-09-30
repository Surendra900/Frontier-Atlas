import { Context } from "hono";
import * as searchService from "../services/search.service.js";

export const globalSearch = async (c: Context) => {
  const queryRouter = c.get("queryRouter");

  const q = c.req.query("q") || "";
  const limit = Number(c.req.query("limit") || "5");

  const data = await searchService.globalSearch(queryRouter, q, limit);

  c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  return c.json({
    status: "success",
    data,
  });
};