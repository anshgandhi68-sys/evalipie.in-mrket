import { Request, Response } from 'express';
import { productDiscoveryOrchestrator } from '../ai/product-discovery.js';
import { compareProducts } from '../ai/tools/compare-products.js';
import { findAlternatives } from '../ai/tools/find-alternatives.js';
import { trueFoundryClient } from '../ai/client.js';
import { aiConfig } from '../ai/config.js';
import {
  DiscoveryRequestSchema,
  CompareRequestSchema,
  AlternativesRequestSchema
} from '../ai/schemas.js';

export const aiController = {
  // POST /api/ai/discover
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

  // POST /api/ai/compare
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

  // POST /api/ai/alternatives
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

  // GET /api/ai/conversations/:id
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

  // GET /api/ai/health
  getHealth: (_req: Request, res: Response) => {
    const telemetry = trueFoundryClient.getTelemetry();
    res.json({
      status: 'online',
      service: 'Evalipie Intelligence Engine',
      gateway: {
        baseUrl: aiConfig.gatewayBaseUrl,
        modelId: aiConfig.modelId || 'unconfigured (using heuristic fallback)',
        isConfigured: aiConfig.isConfigured,
        gatewayStatus: telemetry.gatewayStatus
      },
      telemetry
    });
  },

  // GET /api/ai/telemetry
  getTelemetry: (_req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: trueFoundryClient.getTelemetry()
    });
  },

  // POST /api/ai/evaluate
  evaluate: async (_req: Request, res: Response) => {
    try {
      const { runAiEvaluation } = await import('../ai/eval/eval-runner.js');
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
