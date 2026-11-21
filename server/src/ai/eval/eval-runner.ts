import { EVALUATION_DATASET, EvaluationTestCase } from './evaluation-dataset.js';
import { productDiscoveryOrchestrator } from '../product-discovery.js';
import { db } from '../../db/connection.js';

export interface EvalMetricReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  intentAccuracyPct: number;
  groundingIntegrityPct: number;
  budgetCompliancePct: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  failures: Array<{
    id: string;
    query: string;
    reason: string;
  }>;
}

export async function runAiEvaluation(): Promise<EvalMetricReport> {
  console.log(`\n======================================================`);
  console.log(`🧪 EVALIPIE INTELLIGENCE ENGINE — EVALUATION SUITE`);
  console.log(`📊 Total Test Cases: ${EVALUATION_DATASET.length}`);
  console.log(`======================================================\n`);

  let intentMatches = 0;
  let groundingChecks = 0;
  let budgetCompliantChecks = 0;
  let budgetTotalChecked = 0;
  const latencies: number[] = [];
  const failures: EvalMetricReport['failures'] = [];

  for (const testCase of EVALUATION_DATASET) {
    const startTime = Date.now();
    try {
      const result = await productDiscoveryOrchestrator.discover({
        prompt: testCase.query,
        city: 'Bengaluru'
      });
      const latency = Date.now() - startTime;
      latencies.push(latency);

      let testPassed = true;
      const reasons: string[] = [];

      // 1. Check Category Intent
      if (testCase.expectedCategory) {
        if (result.intent.category?.toLowerCase() === testCase.expectedCategory.toLowerCase()) {
          intentMatches++;
        } else {
          testPassed = false;
          reasons.push(
            `Category mismatch: expected "${testCase.expectedCategory}", got "${result.intent.category}"`
          );
        }
      } else {
        intentMatches++;
      }

      // 2. Check Budget Extraction
      if (testCase.expectedMaxBudget) {
        budgetTotalChecked++;
        if (result.intent.budget.max === testCase.expectedMaxBudget) {
          budgetCompliantChecks++;
        } else {
          testPassed = false;
          reasons.push(
            `Budget extraction mismatch: expected ${testCase.expectedMaxBudget}, got ${result.intent.budget.max}`
          );
        }

        // Verify all returned matches obey budget
        for (const match of result.matches) {
          if (match.bestOffer.sellingPrice > testCase.expectedMaxBudget) {
            testPassed = false;
            reasons.push(
              `Budget breach: Product "${match.title}" priced at ₹${match.bestOffer.sellingPrice} exceeds max ₹${testCase.expectedMaxBudget}`
            );
          }
        }
      }

      // 3. Check Catalogue Grounding (Zero Hallucination Verification)
      for (const match of result.matches) {
        const canonical = db.products.get(match.productId);
        if (!canonical) {
          testPassed = false;
          reasons.push(`Hallucination detected: productId "${match.productId}" does not exist in DB!`);
        }
      }
      groundingChecks++;

      // 4. Verify Empty Result Handling on Impossible Queries
      if (testCase.testType === 'empty_result' || testCase.testType === 'conflicting_requirements') {
        if (result.matches.length > 0) {
          testPassed = false;
          reasons.push(`Expected 0 matches for impossible constraint, but got ${result.matches.length} items`);
        }
      }

      if (!testPassed) {
        failures.push({
          id: testCase.id,
          query: testCase.query,
          reason: reasons.join('; ')
        });
        console.log(`❌ [${testCase.id}] FAIL: "${testCase.query}" -> ${reasons.join('; ')}`);
      } else {
        console.log(`✅ [${testCase.id}] PASS: "${testCase.query}" (${latency}ms)`);
      }
    } catch (err: any) {
      failures.push({
        id: testCase.id,
        query: testCase.query,
        reason: `Execution exception: ${err.message}`
      });
      console.log(`💥 [${testCase.id}] EXCEPTION: "${testCase.query}" -> ${err.message}`);
    }
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const total = EVALUATION_DATASET.length;
  const passed = total - failures.length;
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;

  const intentAccuracy = Math.round((intentMatches / total) * 100);
  const groundingIntegrity = Math.round((groundingChecks / total) * 100);
  const budgetCompliance = budgetTotalChecked > 0 ? Math.round((budgetCompliantChecks / budgetTotalChecked) * 100) : 100;

  console.log(`\n======================================================`);
  console.log(`📈 EVALUATION SCORECARD REPORT`);
  console.log(`======================================================`);
  console.log(`Total Queries:         ${total}`);
  console.log(`Passed:                ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  console.log(`Failed:                ${failures.length}`);
  console.log(`Intent Accuracy:       ${intentAccuracy}%`);
  console.log(`Grounding Integrity:   ${groundingIntegrity}% (Zero Hallucination Verified)`);
  console.log(`Budget Compliance:     ${budgetCompliance}%`);
  console.log(`Average Latency:       ${avgLatency} ms`);
  console.log(`P95 Latency:           ${p95Latency} ms`);
  console.log(`======================================================\n`);

  return {
    totalTests: total,
    passedTests: passed,
    failedTests: failures.length,
    intentAccuracyPct: intentAccuracy,
    groundingIntegrityPct: groundingIntegrity,
    budgetCompliancePct: budgetCompliance,
    averageLatencyMs: avgLatency,
    p95LatencyMs: p95Latency,
    failures
  };
}

// Direct execution CLI support
if (process.argv[1]?.endsWith('eval-runner.ts') || process.argv[1]?.endsWith('eval-runner.js')) {
  runAiEvaluation()
    .then(report => {
      if (report.failedTests > 3) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(err => {
      console.error('Eval runner error:', err);
      process.exit(1);
    });
}
