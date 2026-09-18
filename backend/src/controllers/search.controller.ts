import { Context } from "hono";
import * as searchService from "../services/search.service.js";

export const globalSearch = async (c: Context) => {
  const queryRouter = c.get("queryRouter");

  const q = c.req.query("q") || "";
  const limit = Number(c.req.query("limit") || "5");

  const data = await searchService.globalSearch(queryRouter, q, limit);

  return c.json({
    status: "success",
    data,
  });
};

export const getSuggestions = async (c: Context) => {
  const queryRouter = c.get("queryRouter");

  const q = c.req.query("q") || "";
  const limit = Number(c.req.query("limit") || "8");

  const data = await searchService.getSearchSuggestions(queryRouter, q, limit);

  return c.json({
    status: "success",
    data,
  });
};