import { Request, Response } from 'express';
import { productDiscoveryOrchestrator } from '../ai/product-discovery.js';
import { compareProducts } from '../ai/tools/compare-products.js';
import { findAlternatives } from '../ai/tools/find-alternatives.js';
import { getProductDetails } from '../ai/tools/get-product-details.js';
import { selfHostedAiClient } from '../ai/client.js';
import { aiConfig } from '../ai/config.js';
import {
  DiscoveryRequestSchema,
  CompareRequestSchema,
  AlternativesRequestSchema
} from '../ai/schemas.js';

export const aiController = {
  // POST /api/v1/ai/discover
  discover: async (req: Request, res: Response) => {
    try {
      const parsed = DiscoveryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: parsed.error.format()
        });
      }

      const result = await productDiscoveryOrchestrator.discover(parsed.data);
      res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      console.error('[AI Controller] Discovery error:', err);
      res.status(500).json({
        status: 'error',
        code: 'DISCOVERY_FAILED',
        message: err.message || 'Internal AI discovery error'
      });
    }
  },

  // POST /api/v1/ai/search (Direct search with structured intent)
  search: async (req: Request, res: Response) => {
    try {
      const parsed = DiscoveryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: parsed.error.format()
        });
      }

      const result = await productDiscoveryOrchestrator.discover(parsed.data);
      res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        code: 'SEARCH_FAILED',
        message: err.message
      });
    }
  },

  // POST /api/v1/ai/compare
  compare: (req: Request, res: Response) => {
    try {
      const parsed = CompareRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: parsed.error.format()
        });
      }

      const result = compareProducts(parsed.data.productIds, parsed.data.city);
      res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      console.error('[AI Controller] Comparison error:', err);
      res.status(500).json({
        status: 'error',
        code: 'COMPARISON_FAILED',
        message: err.message || 'Product comparison failed'
      });
    }
  },

  // POST /api/v1/ai/alternatives
  alternatives: (req: Request, res: Response) => {
    try {
      const parsed = AlternativesRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          errors: parsed.error.format()
        });
      }

      const result = findAlternatives(parsed.data.productId, parsed.data.maxPrice, parsed.data.city);
      if (!result) {
        return res.status(404).json({
          status: 'error',
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found in catalog'
        });
      }

      res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      console.error('[AI Controller] Alternatives error:', err);
      res.status(500).json({
        status: 'error',
        code: 'ALTERNATIVES_FAILED',
        message: err.message || 'Alternatives query failed'
      });
    }
  },

  // GET /api/v1/ai/product/:id
  getProductDetails: (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || 'Bengaluru';
      const result = getProductDetails(req.params.id, city);
      if (!result) {
        return res.status(404).json({
          status: 'error',
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        });
      }
      res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  // GET /api/v1/ai/conversations/:id
  getConversation: (req: Request, res: Response) => {
    const session = productDiscoveryOrchestrator.getConversation(req.params.id);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        code: 'CONVERSATION_NOT_FOUND',
        message: 'No active session found with this ID'
      });
    }
    res.json({
      status: 'success',
      data: session
    });
  },

  // DELETE /api/v1/ai/conversations/:id
  deleteConversation: (req: Request, res: Response) => {
    const deleted = productDiscoveryOrchestrator.clearConversation(req.params.id);
    res.json({
      status: 'success',
      message: deleted ? 'Conversation cleared successfully' : 'Conversation not found',
      deleted
    });
  },

  // GET /api/v1/ai/health
  getHealth: async (_req: Request, res: Response) => {
    const health = await selfHostedAiClient.checkHealth();
    const telemetry = selfHostedAiClient.getTelemetry();
    res.json({
      status: health.status === 'healthy' ? 'online' : 'degraded',
      service: 'Evalipie Self-Hosted Intelligence Engine',
      engine: {
        provider: aiConfig.provider,
        modelId: aiConfig.modelId,
        inferenceBaseUrl: aiConfig.inferenceBaseUrl,
        hardwareAcceleration: 'Apple Silicon Metal GPU',
        runtimeStatus: health.status,
        availableModels: health.models
      },
      telemetry
    });
  },

  // GET /api/v1/ai/telemetry
  getTelemetry: (_req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: selfHostedAiClient.getTelemetry()
    });
  },

  // POST /api/v1/ai/evaluate
  evaluate: async (_req: Request, res: Response) => {
    try {
      const { runAiEvaluation } = await import('../ai/eval/evaluation-runner.js');
      const report = await runAiEvaluation();
      res.json({
        status: 'success',
        data: report
      });
    } catch (err: any) {
      console.error('[AI Controller] Evaluation error:', err);
      res.status(500).json({
        status: 'error',
        code: 'EVALUATION_FAILED',
        message: err.message
      });
    }
  }
};
