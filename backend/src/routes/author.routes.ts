import { Hono } from 'hono';
import * as authorController from '../controllers/author.controller.js';

const authorRoutes = new Hono();

authorRoutes.get('/', authorController.getAuthors as any);
authorRoutes.get('/:slug', authorController.getAuthorBySlug as any);

export default authorRoutes;
