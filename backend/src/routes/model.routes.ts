import { Hono } from 'hono';
import * as modelController from '../controllers/model.controller.js';

const modelRoutes = new Hono();

modelRoutes.get('/', modelController.getModels);
modelRoutes.get('/facets', modelController.getModelFacets);
modelRoutes.get('/:slug', modelController.getModelBySlug);

export default modelRoutes;