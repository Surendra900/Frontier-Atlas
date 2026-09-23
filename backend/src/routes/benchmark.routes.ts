import { Hono } from 'hono';
import * as benchmarkController from '../controllers/benchmark.controller.js';

const benchmarkRoutes = new Hono();

benchmarkRoutes.get('/', benchmarkController.getBenchmarks);
benchmarkRoutes.get('/:slug', benchmarkController.getBenchmarkBySlug);

export default benchmarkRoutes;