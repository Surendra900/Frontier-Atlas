import { Hono } from 'hono';
import * as benchmarkController from '../controllers/benchmark.controller.js';

const benchmarkRoutes = new Hono();

benchmarkRoutes.get('/', benchmarkController.getBenchmarks as any);
benchmarkRoutes.get('/:slug', benchmarkController.getBenchmarkBySlug as any);

export default benchmarkRoutes;
