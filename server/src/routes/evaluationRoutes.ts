import express, { Request, Response } from 'express';
import { evaluationStore } from '../db/evaluationStore.js';
import { evaluationOrchestrator } from '../services/evaluation/evaluationOrchestrator.js';
import { reportGeneratorService } from '../services/evaluation/reportGeneratorService.js';
import { StartEvaluationRequest } from '../../../shared/types.js';

export const evaluationRouter = express.Router();

// ── 1. Start Evaluation (GitHub URL, ZIP or Manual claims) ─────────
evaluationRouter.post('/evaluations/start', async (req: Request, res: Response) => {
  try {
    const body: StartEvaluationRequest = req.body;
    if (!body.sourceType) {
      return res.status(400).json({ error: 'sourceType is required (GITHUB, DEMO, ZIP, FILES)' });
    }

    if (body.sourceType === 'GITHUB' && !body.repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required for GITHUB source type' });
    }

    const run = await evaluationOrchestrator.startEvaluation(body);
    res.status(201).json({
      success: true,
      evaluation: run
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start evaluation' });
  }
});

// ── 2. One-Click Demo Evaluation for Hackathon Judges ──────────────
evaluationRouter.post('/evaluations/demo', async (_req: Request, res: Response) => {
  try {
    const run = await evaluationOrchestrator.startEvaluation({
      sourceType: 'DEMO',
      projectName: 'fintech-vault-transfer-service',
      runTests: true,
      attemptReproduction: true
    });
    res.status(201).json({
      success: true,
      evaluation: run
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start demo evaluation' });
  }
});

// ── 3. Get Evaluation Status & Details ─────────────────────────────
evaluationRouter.get('/evaluations/:id', async (req: Request, res: Response) => {
  try {
    const run = await evaluationStore.getEvaluation(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    res.json({ success: true, evaluation: run });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 4. Server-Sent Events (SSE) Live Telemetry Stream ──────────────
evaluationRouter.get('/evaluations/:id/events', async (req: Request, res: Response) => {
  const evaluationId = req.params.id;
  const isSSE = req.headers.accept?.includes('text/event-stream');

  if (isSSE) {
    // SSE Stream Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send existing past events first
    const existingEvents = await evaluationStore.getEvents(evaluationId);
    for (const evt of existingEvents) {
      res.write(`data: ${JSON.stringify(evt)}\n\n`);
    }

    // Subscribe to live events
    const eventHandler = (event: any) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    evaluationStore.on(`event:${evaluationId}`, eventHandler);

    req.on('close', () => {
      evaluationStore.off(`event:${evaluationId}`, eventHandler);
      res.end();
    });
  } else {
    // Polling fallback
    const afterIndex = parseInt(req.query.after as string || '0', 10);
    const events = await evaluationStore.getEvents(evaluationId, afterIndex);
    res.json({ success: true, events });
  }
});

// ── 5. Get Findings (Filterable) ──────────────────────────────────
evaluationRouter.get('/evaluations/:id/findings', async (req: Request, res: Response) => {
  try {
    const findings = await evaluationStore.getFindings(req.params.id);
    const { severity, category, status } = req.query;

    let filtered = findings;
    if (severity) {
      filtered = filtered.filter(f => f.severity.toLowerCase() === (severity as string).toLowerCase());
    }
    if (category) {
      filtered = filtered.filter(f => f.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (status) {
      filtered = filtered.filter(f => f.verificationStatus.toLowerCase() === (status as string).toLowerCase());
    }

    res.json({ success: true, findings: filtered, total: findings.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 6. Get Requirements Traceability Matrix ────────────────────────
evaluationRouter.get('/evaluations/:id/requirements', async (req: Request, res: Response) => {
  try {
    const requirements = await evaluationStore.getRequirements(req.params.id);
    res.json({ success: true, requirements, total: requirements.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 7. Get Automated Test Execution Records ────────────────────────
evaluationRouter.get('/evaluations/:id/test-runs', async (req: Request, res: Response) => {
  try {
    const testRuns = await evaluationStore.getTestRuns(req.params.id);
    res.json({ success: true, testRuns, total: testRuns.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 8. Download / Export Report (Markdown / JSON) ──────────────────
evaluationRouter.get('/evaluations/:id/report', async (req: Request, res: Response) => {
  try {
    const evaluationId = req.params.id;
    const run = await evaluationStore.getEvaluation(evaluationId);
    if (!run) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    const [requirements, findings, testRuns] = await Promise.all([
      evaluationStore.getRequirements(evaluationId),
      evaluationStore.getFindings(evaluationId),
      evaluationStore.getTestRuns(evaluationId)
    ]);

    const format = (req.query.format as string)?.toLowerCase();

    if (format === 'markdown' || format === 'md') {
      const markdown = reportGeneratorService.generateMarkdown(run, requirements, findings, testRuns);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="evalipie-report-${run.projectName}.md"`);
      return res.send(markdown);
    }

    const jsonData = reportGeneratorService.generateJson(run, requirements, findings, testRuns);
    if (format === 'download') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="evalipie-report-${run.projectName}.json"`);
      return res.send(JSON.stringify(jsonData, null, 2));
    }

    res.json({ success: true, report: jsonData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 9. Cancel Running Evaluation ──────────────────────────────────
evaluationRouter.post('/evaluations/:id/cancel', async (req: Request, res: Response) => {
  try {
    const success = evaluationOrchestrator.cancelEvaluation(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── 10. List Projects & History ────────────────────────────────────
evaluationRouter.get('/projects', async (_req: Request, res: Response) => {
  try {
    const projects = await evaluationStore.listProjects();
    const runs = await evaluationStore.listEvaluations();
    res.json({ success: true, projects, recentRuns: runs.slice(0, 10) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
