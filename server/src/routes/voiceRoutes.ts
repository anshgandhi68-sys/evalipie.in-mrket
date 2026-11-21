import { Router } from 'express';
import { voiceController } from '../controllers/voiceController.js';

const router = Router();

// Core Voice Shopping Endpoints
router.post('/chat', (req, res) => voiceController.chat(req, res));
router.post('/transcribe', (req, res) => voiceController.transcribe(req, res));
router.post('/synthesize', (req, res) => voiceController.synthesize(req, res));
router.post('/order/confirm', (req, res) => voiceController.confirmOrder(req, res));
router.get('/session/:id', (req, res) => voiceController.getSession(req, res));

export default router;
