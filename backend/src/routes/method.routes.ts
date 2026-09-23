import { Hono } from 'hono';
import * as methodController from '../controllers/method.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const methodRoutes = new Hono();

// Static & Collection Read Routes
methodRoutes.get('/', methodController.getMethods);
methodRoutes.get('/taxonomy', methodController.getGroupedMethods);

// Seed Route
methodRoutes.post('/seed', methodController.seedCategories);

// Dynamic Param Read Routes
methodRoutes.get('/:slug', methodController.getMethodBySlug);

// Protected Mutation Routes
methodRoutes.post('/', authMiddleware, methodController.createMethod);
methodRoutes.put('/:slug', authMiddleware, methodController.updateMethod);
methodRoutes.delete('/:slug', authMiddleware, methodController.deleteMethod);

export default methodRoutes;