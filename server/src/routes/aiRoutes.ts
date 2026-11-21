import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

export const aiRouter = Router();

// AI Intelligence Engine Endpoints
aiRouter.post('/discover', aiController.discover);
aiRouter.post('/compare', aiController.compare);
aiRouter.post('/alternatives', aiController.alternatives);
aiRouter.get('/conversations/:id', aiController.getConversation);
aiRouter.get('/health', aiController.getHealth);
aiRouter.get('/telemetry', aiController.getTelemetry);
aiRouter.post('/evaluate', aiController.evaluate);
