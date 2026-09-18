import { Hono } from 'hono';
import * as methodController from '../controllers/method.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const methodRoutes = new Hono();

methodRoutes.get('/', methodController.getMethods as any);
methodRoutes.post('/seed', methodController.seedCategories as any);
methodRoutes.get('/taxonomy', methodController.getGroupedMethods as any);
methodRoutes.get('/:slug', methodController.getMethodBySlug as any);
methodRoutes.post('/', authMiddleware, methodController.createMethod as any);
methodRoutes.put('/:slug', authMiddleware, methodController.updateMethod as any);
methodRoutes.delete('/:slug', authMiddleware, methodController.deleteMethod as any);

export default methodRoutes;
