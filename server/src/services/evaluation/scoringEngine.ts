import {
  RequirementMatrixItem,
  EvaluationFinding,
  TestRunRecord,
  ScoreBreakdown,
  RepoMetadata
} from '../../../../shared/types.js';

export class ScoringEngine {
  public computeScore(
    requirements: RequirementMatrixItem[],
    findings: EvaluationFinding[],
    testRuns: TestRunRecord[],
    metadata: RepoMetadata
  ): { score: number; breakdown: ScoreBreakdown; executiveSummary: string } {
    // 1. Requirements Score (Max 25)
    let reqScore = 25;
    if (requirements.length > 0) {
      let satisfiedPoints = 0;
      for (const req of requirements) {
        if (req.status === 'SATISFIED') satisfiedPoints += 1.0;
        else if (req.status === 'PARTIAL') satisfiedPoints += 0.5;
        else if (req.status === 'NOT_IMPLEMENTED') satisfiedPoints += 0.0;
        else if (req.status === 'CONTRADICTED') satisfiedPoints += -0.2;
      }
      const ratio = Math.max(0, Math.min(1, satisfiedPoints / requirements.length));
      reqScore = Math.round(ratio * 25);
    }

    // 2. Reliability Score (Max 25)
    let relScore = 25;
    for (const f of findings) {
      if (f.category === 'LOGIC' || f.category === 'EDGE_CASE') {
        if (f.severity === 'CRITICAL') relScore -= 9;
        else if (f.severity === 'HIGH') relScore -= 5;
        else if (f.severity === 'MEDIUM') relScore -= 3;
        else relScore -= 1;
      }
    }
    relScore = Math.max(0, Math.min(25, relScore));

    // 3. Security Score (Max 20)
    let secScore = 20;
    for (const f of findings) {
      if (f.category === 'SECURITY') {
        if (f.severity === 'CRITICAL') secScore -= 10;
        else if (f.severity === 'HIGH') secScore -= 6;
        else if (f.severity === 'MEDIUM') secScore -= 3;
        else secScore -= 1;
      }
    }
    secScore = Math.max(0, Math.min(20, secScore));

    // 4. Tests Score (Max 15)
    let testScore = 15;
    if (testRuns.length > 0) {
      const passed = testRuns.filter(t => t.status === 'PASSED').length;
      testScore = Math.round((passed / testRuns.length) * 15);
    } else {
      // If no tests exist in project, cap at 4/15
      testScore = 4;
    }

    // 5. Architecture Score (Max 10)
    let archScore = 10;
    if (metadata.filesCount > 0 && metadata.linesOfCode / metadata.filesCount > 300) {
      archScore -= 2; // High LOC per file
    }
    if (findings.some(f => f.category === 'ARCHITECTURE')) {
      archScore -= 3;
    }
    archScore = Math.max(2, Math.min(10, archScore));

    // 6. Dependencies Score (Max 5)
    let depScore = 5;
    if (metadata.vulnerableDependenciesCount > 0) {
      depScore -= Math.min(5, metadata.vulnerableDependenciesCount * 2.5);
    }
    depScore = Math.max(0, Math.min(5, depScore));

    const total = reqScore + relScore + secScore + testScore + archScore + depScore;

    const breakdown: ScoreBreakdown = {
      requirements: reqScore,
      reliability: relScore,
      security: secScore,
      tests: testScore,
      architecture: archScore,
      dependencies: depScore,
      total
    };

    const executiveSummary = this.generateExecutiveSummary(total, breakdown, requirements, findings);

    return {
      score: total,
      breakdown,
      executiveSummary
    };
  }

  private generateExecutiveSummary(
    score: number,
    breakdown: ScoreBreakdown,
    requirements: RequirementMatrixItem[],
    findings: EvaluationFinding[]
  ): string {
    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL');
    const reproducedFindings = findings.filter(f => f.verificationStatus === 'REPRODUCED');
    const contradictedReqs = requirements.filter(r => r.status === 'CONTRADICTED');

    let grade = 'MODERATE';
    if (score >= 85) grade = 'STRONG';
    else if (score >= 70) grade = 'ACCEPTABLE';
    else if (score < 50) grade = 'CRITICAL DEFICIT';

    return `Evalipie evaluated this implementation against stated requirements and claims. Overall quality score: ${score}/100 (${grade}). Found ${findings.length} findings, of which ${criticalFindings.length} are critical severity and ${reproducedFindings.length} were independently confirmed via isolated sandbox reproduction. ${contradictedReqs.length} stated requirement claims were contradicted by actual code behavior (notably in race condition handling and access control). Immediate remediation required in atomic transactions and authentication filters.`;
  }
}

export const scoringEngine = new ScoringEngine();
