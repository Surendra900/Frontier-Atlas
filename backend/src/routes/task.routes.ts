import { Hono } from 'hono';
import * as taskController from '../controllers/task.controller.js';

const taskRoutes = new Hono();

taskRoutes.get('/', taskController.getTasks as any);
taskRoutes.get('/counts', taskController.getTaskPaperCounts as any);
taskRoutes.get('/:slug', taskController.getTaskBySlug as any);

export default taskRoutes;
