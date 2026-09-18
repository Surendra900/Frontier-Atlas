import { Hono } from 'hono';
import * as datasetController from '../controllers/dataset.controller.js';

const datasetRoutes = new Hono();

datasetRoutes.get('/', datasetController.getDatasets as any);
datasetRoutes.get('/:slug', datasetController.getDatasetBySlug as any);

export default datasetRoutes;
