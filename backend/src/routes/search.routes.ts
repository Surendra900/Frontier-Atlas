import { Hono } from "hono";
import * as searchController from "../controllers/search.controller.js";

const searchRoutes = new Hono();

searchRoutes.get("/suggestions", searchController.getSuggestions as any);
searchRoutes.get("/", searchController.globalSearch as any);

export default searchRoutes;