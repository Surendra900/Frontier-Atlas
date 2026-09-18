import { Hono } from "hono";
import * as discussionController from "../controllers/discussion.controller.js";

const discussionRoutes = new Hono();

discussionRoutes.get("/", discussionController.getDiscussions as any);

export default discussionRoutes;