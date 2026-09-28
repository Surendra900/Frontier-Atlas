import { Hono } from 'hono';
import * as taskController from '../controllers/task.controller.js';

const taskRoutes = new Hono();

// Static & Collection Read Routes
taskRoutes.get('/', taskController.getTasks);
taskRoutes.get('/counts', taskController.getTaskPaperCounts);

// Dynamic Param Read Routes
taskRoutes.get('/:slug', taskController.getTaskBySlug);

export default taskRoutes;