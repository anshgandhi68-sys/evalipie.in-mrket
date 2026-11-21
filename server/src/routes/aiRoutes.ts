import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

export const aiRouter = Router();

// Evalipie Self-Hosted AI Intelligence Engine Endpoints
aiRouter.post('/discover', aiController.discover);
aiRouter.post('/search', aiController.search);
aiRouter.post('/compare', aiController.compare);
aiRouter.post('/alternatives', aiController.alternatives);
aiRouter.get('/product/:id', aiController.getProductDetails);
aiRouter.get('/conversations/:id', aiController.getConversation);
aiRouter.delete('/conversations/:id', aiController.deleteConversation);
aiRouter.get('/health', aiController.getHealth);
aiRouter.get('/telemetry', aiController.getTelemetry);
aiRouter.post('/evaluate', aiController.evaluate);
