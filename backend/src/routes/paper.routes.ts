import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as paperController from "../controllers/paper.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.middleware.js";

const paperIngestSchema = z.object({
  schemaVersion: z.string().optional(),
  recordType: z.literal("RESEARCH_PAPER").optional(),
  content: z.object({
    title: z.string().min(1, "Title is required"),
    arxiv_id: z.string().optional().nullable(),
    paper_url: z.string().url().optional().or(z.literal("")).nullable(),
    thumbnail_url: z.string().url().optional().or(z.literal("")).nullable(),
    github_url: z.string().url().optional().or(z.literal("")).nullable(),
    github_stars: z.number().default(0),
    abstract: z.string().optional().nullable(),
    authors: z.string().optional().nullable(),
  }).passthrough(),
});

const paperUpdateSchema = z.object({
  title: z.string().optional(),
  abstract: z.string().optional(),
  paperUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  projectUrl: z.string().url().optional(),
});

const paperRoutes = new Hono();

// Specific routes before catch-all /:slug
paperRoutes.get("/search", paperController.searchPapers as any);
paperRoutes.get("/organization-counts", paperController.getOrganizationPaperCounts as any);
paperRoutes.get("/id/:id", paperController.getPaperById as any);
paperRoutes.get("/check-saved", optionalAuthMiddleware, paperController.checkSavedPaper as any);
paperRoutes.post("/save", authMiddleware, paperController.toggleSavePaper as any);
paperRoutes.get("/saved", authMiddleware, paperController.getSavedPapers as any);
paperRoutes.post(
  "/ingest",
  zValidator("json", paperIngestSchema),
  paperController.ingestPaper as any,
);

paperRoutes.get("/", paperController.getPapers as any);
paperRoutes.get("/:slug", paperController.getPaperBySlug as any);

paperRoutes.put(
  "/:slug",
  authMiddleware,
  zValidator("json", paperUpdateSchema),
  paperController.updatePaper as any,
);

paperRoutes.delete(
  "/:slug",
  authMiddleware,
  paperController.deletePaper as any,
);

export default paperRoutes;
