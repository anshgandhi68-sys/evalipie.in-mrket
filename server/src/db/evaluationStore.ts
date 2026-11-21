import { EventEmitter } from 'events';
import { supabase } from './supabaseClient.js';
import {
  EvaluationProject,
  EvaluationRun,
  EvaluationFinding,
  RequirementMatrixItem,
  TestRunRecord,
  EvaluationEventLog,
  StageStatus
} from '../../../shared/types.js';

class EvaluationStore extends EventEmitter {
  private projects = new Map<string, EvaluationProject>();
  private evaluations = new Map<string, EvaluationRun>();
  private findings = new Map<string, EvaluationFinding[]>();
  private requirements = new Map<string, RequirementMatrixItem[]>();
  private testRuns = new Map<string, TestRunRecord[]>();
  private events = new Map<string, EvaluationEventLog[]>();

  constructor() {
    super();
    this.setMaxListeners(200);
    this.seedInitialProject();
  }

  private seedInitialProject() {
    const demoProj: EvaluationProject = {
      id: 'proj-demo-fintech',
      name: 'fintech-vault-transfer-service',
      description: 'Production Microservice for Wallet Transfers, Order Invoices, and Checkout Discount Calculations',
      sourceType: 'DEMO',
      repoUrl: 'https://github.com/evalipie-benchmark/fintech-vault-transfer-service',
      branch: 'main',
      commitHash: 'a89c20e',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
      lastEvaluationId: 'eval-demo-fintech',
      lastScore: 64
    };
    this.projects.set(demoProj.id, demoProj);

    const demoRun: EvaluationRun = {
      id: 'eval-demo-fintech',
      projectId: 'proj-demo-fintech',
      projectName: 'fintech-vault-transfer-service',
      sourceType: 'DEMO',
      repoUrl: 'https://github.com/evalipie-benchmark/fintech-vault-transfer-service',
      branch: 'main',
      status: 'COMPLETED',
      currentStageId: 10,
      score: 64,
      scoreBreakdown: {
        requirements: 14,
        reliability: 12,
        security: 14,
        tests: 10,
        architecture: 9,
        dependencies: 5,
        total: 64
      },
      executiveSummary: 'Evalipie evaluated this implementation against stated requirements and claims. Overall quality score: 64/100 (ACCEPTABLE). Found 3 findings, of which 1 is critical severity and 2 were independently confirmed via isolated sandbox reproduction. Stated requirement claims regarding zero-balance overdraft protection and strict invoice tenant isolation were contradicted by actual code behavior. Immediate remediation required in atomic transactions and authentication filters.',
      repoMetadata: {
        filesCount: 5,
        linesOfCode: 204,
        languages: { JavaScript: 180, JSON: 24 },
        primaryLanguage: 'JavaScript',
        framework: 'Express.js',
        buildTool: 'Node / Native Toolchain',
        packageManager: 'npm / yarn',
        dependenciesCount: 4,
        vulnerableDependenciesCount: 0
      },
      stages: [
        { id: 1, name: 'Input Validation & Security Sanitization', code: 'INPUT_VALIDATION', status: 'COMPLETED', durationMs: 340, message: 'All parameters passed security boundaries' },
        { id: 2, name: 'Repository & File Ingestion', code: 'REPO_INGESTION', status: 'COMPLETED', durationMs: 220, message: 'Ingested 5 source files (204 LOC)' },
        { id: 3, name: 'Project Structure & AST Analysis', code: 'STRUCTURE_ANALYSIS', status: 'COMPLETED', durationMs: 450, message: 'AST and symbol graph constructed' },
        { id: 4, name: 'Technology & Dependency Stack Detection', code: 'TECH_DETECTION', status: 'COMPLETED', durationMs: 290, message: 'Node.js / Express stack verified' },
        { id: 5, name: 'Requirement Claims Extraction', code: 'REQUIREMENT_EXTRACTION', status: 'COMPLETED', durationMs: 380, message: '3 claims extracted from spec' },
        { id: 6, name: 'Static Vulnerability & Logic Analysis', code: 'STATIC_ANALYSIS', status: 'COMPLETED', durationMs: 620, message: 'Identified 3 defect findings' },
        { id: 7, name: 'Automated Test Suite Execution', code: 'TEST_EXECUTION', status: 'COMPLETED', durationMs: 310, message: '2 tests passed, 1 test failed' },
        { id: 8, name: 'AI Claim-vs-Reality Reasoning Engine', code: 'AI_REASONING', status: 'COMPLETED', durationMs: 480, message: '2 claims contradicted by code' },
        { id: 9, name: 'Sandboxed Bug Verification & Reproduction', code: 'BUG_VERIFICATION', status: 'COMPLETED', durationMs: 510, message: 'Terminal sandbox execution verified' },
        { id: 10, name: 'Report Generation & Quality Scoring', code: 'REPORT_GENERATION', status: 'COMPLETED', durationMs: 90, message: 'Score: 64/100 compiled' }
      ],
      totalRequirements: 3,
      satisfiedRequirements: 1,
      totalFindings: 3,
      criticalCount: 1,
      highCount: 1,
      mediumCount: 1,
      lowCount: 0,
      reproducedCount: 3,
      totalTests: 3,
      passedTests: 2,
      failedTests: 1,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3600000 + 4200).toISOString(),
      durationMs: 4200
    };
    this.evaluations.set(demoRun.id, demoRun);

    const demoRequirements: RequirementMatrixItem[] = [
      {
        id: 'req-demo-1',
        evaluationId: 'eval-demo-fintech',
        requirementNumber: 1,
        requirementText: 'Atomic Balance Debiting & Overdraft Protection: The balance debiting engine MUST guarantee atomic execution and absolute overdraft protection under concurrent operations.',
        status: 'CONTRADICTED',
        verdict: 'Claim claims atomic overdraft protection, but implementation uses non-atomic read-modify-write without transactional locking or distributed mutex.',
        gapAnalysis: 'Race condition exists in debitBalance(). Simultaneous operations allow balance to drop into negative amounts.',
        evidence: [
          {
            filePath: 'src/accountService.js',
            lineNumbers: 'L17-L34',
            snippet: 'async function debitBalance(accountId, amount) {\n  const currentBalance = memoryBalances.get(accountId) || 0;\n  await sleep(25);',
            symbolName: 'debitBalance()'
          }
        ]
      },
      {
        id: 'req-demo-2',
        evaluationId: 'eval-demo-fintech',
        requirementNumber: 2,
        requirementText: 'Strict Authorization & IDOR Protection on Order Invoices: The invoice API endpoint (/api/orders/:id) MUST strictly authenticate caller ownership.',
        status: 'CONTRADICTED',
        verdict: 'Claim asserts strict tenant authorization and owner-only invoice access, but endpoint returns sensitive order records without verifying caller token.',
        gapAnalysis: 'Missing authorization check on /api/orders/:id permits IDOR horizontal privilege escalation.',
        evidence: [
          {
            filePath: 'src/orderController.js',
            lineNumbers: 'L18-L32',
            snippet: 'function getOrderInvoice(req, res) {\n  const orderId = req.params.id;\n  const order = ordersDatabase.get(orderId);',
            symbolName: 'getOrderInvoice()'
          }
        ]
      },
      {
        id: 'req-demo-3',
        evaluationId: 'eval-demo-fintech',
        requirementNumber: 3,
        requirementText: 'Idempotent Coupon Discount Validation: Promotional discounts MUST be idempotent, non-stackable, and payable cart total must never evaluate below ₹0.',
        status: 'PARTIAL',
        verdict: 'Coupon calculations exist, but duplicate coupon stacking is not prevented and checkout total has no non-negative floor safeguard.',
        gapAnalysis: 'Stacking identical promo codes or high discounts can result in negative cart totals.',
        evidence: [
          {
            filePath: 'src/couponService.js',
            lineNumbers: 'L15-L35',
            snippet: 'function calculateCartTotal(cartItemsTotal, appliedCoupons) {\n  for (const code of appliedCoupons) {\n    discountTotal += coupon.discount;',
            symbolName: 'calculateCartTotal()'
          }
        ]
      }
    ];
    this.requirements.set('eval-demo-fintech', demoRequirements);

    const demoFindings: EvaluationFinding[] = [
      {
        id: 'finding-demo-race-1',
        evaluationId: 'eval-demo-fintech',
        title: 'Non-Atomic Read-Modify-Write Race Condition in Balance Debit',
        summary: 'Asynchronous latency window between balance check and balance mutation allows simultaneous transactions to overdraft funds.',
        severity: 'CRITICAL',
        category: 'LOGIC',
        verificationStatus: 'REPRODUCED',
        filePath: 'src/accountService.js',
        lineNumbers: 'L17-L34',
        failureMechanism: 'Under concurrent load, multiple requests read the identical initial balance simultaneously before either has written the debited amount, bypassing the balance threshold check.',
        reproductionSteps: [
          'Set initial account balance to ₹1000',
          'Dispatch two simultaneous debit requests of ₹600 each using Promise.all()',
          'Observe that both debits succeed and final balance evaluates to -₹200'
        ],
        sandboxOutput: `[EVALIPIE SANDBOX] Initializing isolated concurrent balance test...
[EVALIPIE SANDBOX] Starting account balance: ₹1000
[EVALIPIE SANDBOX] Dispatching 2 simultaneous debit calls of ₹600 each...
[EVALIPIE SANDBOX] Debit 1 result: fulfilled
[EVALIPIE SANDBOX] Debit 2 result: fulfilled
[EVALIPIE SANDBOX] Recorded Final Balance: ₹-200

[EVALIPIE REPRODUCTION CONFIRMED] CRITICAL: Overdraft protection failed!
[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "guarantees zero-balance overdraft protection".
[EVALIPIE REPRODUCTION CONFIRMED] Reality: Balance dropped to ₹-200 due to unhandled race condition.`,
        recommendedFix: 'Enforce pessimistic locking, atomic SQL decrement with CHECK (balance >= 0), or a distributed Redis Redlock mutex.',
        codeDiff: `- const currentBalance = memoryBalances.get(accountId);\n- await sleep(25);\n- if (currentBalance < amount) throw ...;\n+ await withDistributedLock(accountId, async () => {\n+   const balance = await getBalanceForUpdate(accountId);\n+   if (balance < amount) throw new InsufficientFundsError();\n+   await updateBalance(accountId, balance - amount);\n+ });`,
        createdAt: new Date().toISOString()
      },
      {
        id: 'finding-demo-idor-1',
        evaluationId: 'eval-demo-fintech',
        title: 'Insecure Direct Object Reference (IDOR) on Order Retrieval',
        summary: 'Invoice API endpoint returns sensitive customer records without validating caller identity or authorization rights.',
        severity: 'HIGH',
        category: 'SECURITY',
        verificationStatus: 'REPRODUCED',
        filePath: 'src/orderController.js',
        lineNumbers: 'L18-L32',
        failureMechanism: 'Endpoint directly fetches order record by URL parameter :id without ensuring req.user.id matches order.customerId or has ADMIN role.',
        reproductionSteps: [
          'Login as customer A',
          'Send HTTP GET to /api/orders/ord_902 (owned by customer B)',
          'Verify that customer B private order details and PII are returned with HTTP 200'
        ],
        sandboxOutput: `[EVALIPIE SANDBOX] Initializing IDOR access control check on order invoices...
[EVALIPIE SANDBOX] Simulated caller: cust_attacker
[EVALIPIE SANDBOX] Requested order owner: cust_beta
[EVALIPIE SANDBOX] Response status code: 200

[EVALIPIE REPRODUCTION CONFIRMED] HIGH SEVERITY: IDOR Vulnerability Verified!
[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "strictly authenticate the requesting caller and guarantee owner-only access".
[EVALIPIE REPRODUCTION CONFIRMED] Reality: Caller cust_attacker accessed private order invoice containing PII without restriction.`,
        recommendedFix: 'Verify ownership inside route controller or middleware before returning order document.',
        codeDiff: `- if (!order) return res.status(404).json({ error: 'Order not found' });\n- return res.status(200).json({ success: true, order });\n+ if (!order) return res.status(404).json({ error: 'Order not found' });\n+ if (order.customerId !== req.user.id && req.user.role !== 'ADMIN') {\n+   return res.status(403).json({ error: 'Access forbidden: unauthorized tenant' });\n+ }\n+ return res.status(200).json({ success: true, order });`,
        createdAt: new Date().toISOString()
      },
      {
        id: 'finding-demo-coupon-1',
        evaluationId: 'eval-demo-fintech',
        title: 'Uncapped Stackable Coupon Application Resulting in Negative Cart Total',
        summary: 'Discounts can be applied multiple times without deduplication, and checkout total lacks a non-negative floor safeguard.',
        severity: 'MEDIUM',
        category: 'EDGE_CASE',
        verificationStatus: 'REPRODUCED',
        filePath: 'src/couponService.js',
        lineNumbers: 'L15-L35',
        failureMechanism: 'Applied coupons array is iterated without uniqueness validation, and discount subtraction does not clamp at 0.',
        reproductionSteps: [
          'Construct cart with subtotal ₹75',
          'Pass duplicate coupon codes: ["SAVE50", "SAVE50"]',
          'Observe that finalAmount computes to -₹25'
        ],
        sandboxOutput: `[EVALIPIE SANDBOX] Testing coupon stackability and negative checkout total boundary...
[EVALIPIE SANDBOX] Cart Subtotal: ₹75
[EVALIPIE SANDBOX] Applied Coupons: ["SAVE50","SAVE50"]
[EVALIPIE SANDBOX] Total Discount Computed: ₹100
[EVALIPIE SANDBOX] Calculated Final Amount: ₹-25

[EVALIPIE REPRODUCTION CONFIRMED] MEDIUM SEVERITY: Negative Cart Total Verified!
[EVALIPIE REPRODUCTION CONFIRMED] Stated claim: "same promo code cannot be stacked and cart total must never drop below ₹0".
[EVALIPIE REPRODUCTION CONFIRMED] Reality: Cart evaluated to ₹-25, allowing fraudulent negative transactions.`,
        recommendedFix: 'Deduplicate coupon codes using Set and clamp finalAmount to Math.max(0, subtotal - discount).',
        codeDiff: `- for (const code of appliedCoupons) {\n+ const uniqueCodes = new Set(appliedCoupons);\n+ for (const code of uniqueCodes) {\n...\n- const finalAmount = cartItemsTotal - discountTotal;\n+ const finalAmount = Math.max(0, cartItemsTotal - discountTotal);`,
        createdAt: new Date().toISOString()
      }
    ];
    this.findings.set('eval-demo-fintech', demoFindings);

    const demoTestRuns: TestRunRecord[] = [
      {
        id: 'test-run-1',
        evaluationId: 'eval-demo-fintech',
        testSuiteName: 'tests/accountService.test.js',
        testName: 'Single sequential debit updates balance correctly',
        status: 'PASSED',
        durationMs: 42
      },
      {
        id: 'test-run-2',
        evaluationId: 'eval-demo-fintech',
        testSuiteName: 'tests/accountService.test.js',
        testName: 'Rejects debit when single amount exceeds balance',
        status: 'PASSED',
        durationMs: 38
      },
      {
        id: 'test-run-3',
        evaluationId: 'eval-demo-fintech',
        testSuiteName: 'tests/accountService.test.js',
        testName: 'Concurrent simultaneous debits must strictly respect balance boundary',
        status: 'FAILED',
        durationMs: 76,
        errorMessage: 'Expected balance >= 0, but received -200 (Overdraft Violation)',
        stackTrace: 'AssertionError: Expected balance >= 0\n    at testRaceCondition (accountService.test.js:48:12)'
      }
    ];
    this.testRuns.set('eval-demo-fintech', demoTestRuns);
  }

  // ── Project Methods ─────────────────────────────────────────────
  async createProject(project: EvaluationProject): Promise<EvaluationProject> {
    this.projects.set(project.id, project);

    try {
      await supabase.from('evaluation_projects').upsert({
        id: project.id,
        user_id: project.userId || null,
        name: project.name,
        description: project.description || null,
        source_type: project.sourceType,
        repo_url: project.repoUrl || null,
        branch: project.branch || null,
        created_at: project.createdAt,
        updated_at: project.updatedAt
      });
    } catch {
      // Memory fallback
    }

    return project;
  }

  async getProject(id: string): Promise<EvaluationProject | undefined> {
    return this.projects.get(id);
  }

  async listProjects(): Promise<EvaluationProject[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // ── Evaluation Run Methods ──────────────────────────────────────
  async saveEvaluation(run: EvaluationRun): Promise<EvaluationRun> {
    this.evaluations.set(run.id, { ...run });

    const project = this.projects.get(run.projectId);
    if (project) {
      project.lastEvaluationId = run.id;
      project.lastScore = run.score;
      project.updatedAt = new Date().toISOString();
      this.projects.set(project.id, project);
    }

    try {
      await supabase.from('evaluation_runs').upsert({
        id: run.id,
        project_id: run.projectId,
        status: run.status,
        score: run.score,
        score_breakdown: run.scoreBreakdown,
        executive_summary: run.executiveSummary,
        repo_metadata: run.repoMetadata,
        started_at: run.startedAt,
        completed_at: run.completedAt || null
      });
    } catch {
      // Memory fallback
    }

    return run;
  }

  async getEvaluation(id: string): Promise<EvaluationRun | undefined> {
    return this.evaluations.get(id);
  }

  async listEvaluations(projectId?: string): Promise<EvaluationRun[]> {
    const all = Array.from(this.evaluations.values());
    if (projectId) {
      return all.filter(e => e.projectId === projectId).sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    }
    return all.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async updateStage(
    evaluationId: string,
    stageId: number,
    status: StageStatus,
    message?: string
  ): Promise<void> {
    const run = this.evaluations.get(evaluationId);
    if (!run) return;

    const stage = run.stages.find(s => s.id === stageId);
    if (stage) {
      stage.status = status;
      if (status === 'RUNNING' && !stage.startedAt) {
        stage.startedAt = new Date().toISOString();
      }
      if (status === 'COMPLETED' || status === 'FAILED') {
        stage.completedAt = new Date().toISOString();
        if (stage.startedAt) {
          stage.durationMs = new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime();
        }
      }
      if (message) stage.message = message;
    }

    run.currentStageId = stageId;
    this.evaluations.set(evaluationId, { ...run });
  }

  // ── Findings Methods ────────────────────────────────────────────
  async addFinding(finding: EvaluationFinding): Promise<void> {
    const list = this.findings.get(finding.evaluationId) || [];
    list.push(finding);
    this.findings.set(finding.evaluationId, list);

    const run = this.evaluations.get(finding.evaluationId);
    if (run) {
      run.totalFindings = list.length;
      run.criticalCount = list.filter(f => f.severity === 'CRITICAL').length;
      run.highCount = list.filter(f => f.severity === 'HIGH').length;
      run.mediumCount = list.filter(f => f.severity === 'MEDIUM').length;
      run.lowCount = list.filter(f => f.severity === 'LOW').length;
      run.reproducedCount = list.filter(f => f.verificationStatus === 'REPRODUCED').length;
      this.evaluations.set(run.id, { ...run });
    }
  }

  async getFindings(evaluationId: string): Promise<EvaluationFinding[]> {
    return this.findings.get(evaluationId) || [];
  }

  // ── Requirements Traceability Matrix ────────────────────────────
  async saveRequirements(items: RequirementMatrixItem[]): Promise<void> {
    if (items.length === 0) return;
    const evalId = items[0].evaluationId;
    this.requirements.set(evalId, items);

    const run = this.evaluations.get(evalId);
    if (run) {
      run.totalRequirements = items.length;
      run.satisfiedRequirements = items.filter(i => i.status === 'SATISFIED').length;
      this.evaluations.set(evalId, { ...run });
    }
  }

  async getRequirements(evaluationId: string): Promise<RequirementMatrixItem[]> {
    return this.requirements.get(evaluationId) || [];
  }

  // ── Test Execution Records ──────────────────────────────────────
  async saveTestRuns(runs: TestRunRecord[]): Promise<void> {
    if (runs.length === 0) return;
    const evalId = runs[0].evaluationId;
    this.testRuns.set(evalId, runs);

    const run = this.evaluations.get(evalId);
    if (run) {
      run.totalTests = runs.length;
      run.passedTests = runs.filter(t => t.status === 'PASSED').length;
      run.failedTests = runs.filter(t => t.status === 'FAILED').length;
      this.evaluations.set(evalId, { ...run });
    }
  }

  async getTestRuns(evaluationId: string): Promise<TestRunRecord[]> {
    return this.testRuns.get(evaluationId) || [];
  }

  // ── Live Event Telemetry Stream ─────────────────────────────────
  async addEvent(event: EvaluationEventLog): Promise<void> {
    const list = this.events.get(event.evaluationId) || [];
    list.push(event);
    this.events.set(event.evaluationId, list);

    this.emit(`event:${event.evaluationId}`, event);
  }

  async getEvents(evaluationId: string, afterIndex = 0): Promise<EvaluationEventLog[]> {
    const list = this.events.get(evaluationId) || [];
    return list.slice(afterIndex);
  }
}

export const evaluationStore = new EvaluationStore();
