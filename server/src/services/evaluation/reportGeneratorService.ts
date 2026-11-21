import {
  EvaluationRun,
  RequirementMatrixItem,
  EvaluationFinding,
  TestRunRecord
} from '../../../../shared/types.js';

export class ReportGeneratorService {
  public generateMarkdown(
    run: EvaluationRun,
    requirements: RequirementMatrixItem[],
    findings: EvaluationFinding[],
    testRuns: TestRunRecord[]
  ): string {
    const lines: string[] = [];

    lines.push(`# Evalipie Software Evaluation Report`);
    lines.push(`**Project:** ${run.projectName}`);
    lines.push(`**Repository:** ${run.repoUrl || 'Local / Uploaded Source'}`);
    lines.push(`**Evaluation ID:** \`${run.id}\``);
    lines.push(`**Date:** ${new Date(run.startedAt).toUTCString()}`);
    lines.push(`**Overall Score:** **${run.score} / 100**`);
    lines.push('');
    lines.push(`> *Positioning: Your project makes claims. Evalipie tries to break them.*`);
    lines.push('');

    lines.push(`## 1. Executive Summary`);
    lines.push(run.executiveSummary);
    lines.push('');

    lines.push(`## 2. Transparent Score Breakdown`);
    lines.push(`| Dimension | Score | Max | Status |`);
    lines.push(`| --- | --- | --- | --- |`);
    lines.push(`| Requirements Satisfaction | ${run.scoreBreakdown.requirements} | 25 | ${run.scoreBreakdown.requirements > 18 ? 'Passed' : 'Needs Work'} |`);
    lines.push(`| Code Reliability & Bugs | ${run.scoreBreakdown.reliability} | 25 | ${run.scoreBreakdown.reliability > 18 ? 'Good' : 'Defects Found'} |`);
    lines.push(`| Security Posture | ${run.scoreBreakdown.security} | 20 | ${run.scoreBreakdown.security > 15 ? 'Secure' : 'Vulnerabilities Detected'} |`);
    lines.push(`| Test Suite & Coverage | ${run.scoreBreakdown.tests} | 15 | ${run.scoreBreakdown.tests > 10 ? 'Comprehensive' : 'Incomplete'} |`);
    lines.push(`| Architecture & Modularity | ${run.scoreBreakdown.architecture} | 10 | Standard |`);
    lines.push(`| Dependency Freshness | ${run.scoreBreakdown.dependencies} | 5 | ${run.repoMetadata.vulnerableDependenciesCount === 0 ? 'Clean' : 'Outdated'} |`);
    lines.push(`| **Total** | **${run.score}** | **100** | **${run.score >= 70 ? 'APPROVED' : 'ACTION REQUIRED'}** |`);
    lines.push('');

    lines.push(`## 3. Requirements vs Implementation Traceability Matrix`);
    lines.push(`| # | Stated Claim / Requirement | Implementation Status | Evidence / File | Verdict |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const req of requirements) {
      const evidenceStr = req.evidence.map(e => `\`${e.filePath}:${e.lineNumbers || ''}\``).join(', ') || 'None';
      lines.push(`| ${req.requirementNumber} | ${req.requirementText.replace(/\|/g, '\\|')} | **${req.status}** | ${evidenceStr} | ${req.verdict.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');

    lines.push(`## 4. Defect & Security Findings (${findings.length} Total)`);
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      lines.push(`### [${f.severity}] ${f.title}`);
      lines.push(`- **Category:** ${f.category}`);
      lines.push(`- **Verification Status:** \`${f.verificationStatus}\``);
      lines.push(`- **Location:** \`${f.filePath}:${f.lineNumbers}\``);
      lines.push(`- **Summary:** ${f.summary}`);
      lines.push(`- **Failure Mechanism:** ${f.failureMechanism}`);
      lines.push('');
      if (f.reproductionSteps?.length) {
        lines.push(`**Reproduction Steps:**`);
        for (const step of f.reproductionSteps) {
          lines.push(`1. ${step}`);
        }
        lines.push('');
      }
      if (f.sandboxOutput) {
        lines.push(`**Sandbox Terminal Output:**`);
        lines.push('```bash');
        lines.push(f.sandboxOutput);
        lines.push('```');
        lines.push('');
      }
      if (f.codeDiff) {
        lines.push(`**Recommended Code Fix:**`);
        lines.push('```diff');
        lines.push(f.codeDiff);
        lines.push('```');
        lines.push('');
      }
    }

    lines.push(`## 5. Automated Test Suite Results`);
    lines.push(`- Total Tests Discovered: ${run.totalTests}`);
    lines.push(`- Tests Passed: ${run.passedTests}`);
    lines.push(`- Tests Failed: ${run.failedTests}`);
    lines.push('');
    for (const test of testRuns) {
      lines.push(`- **[${test.status}]** \`${test.testSuiteName}\` > ${test.testName} (${test.durationMs}ms)`);
      if (test.errorMessage) {
        lines.push(`  - *Error:* \`${test.errorMessage}\``);
      }
    }

    lines.push('');
    lines.push(`---`);
    lines.push(`*Report generated automatically by Evalipie AI Software Evaluation Engine (https://evalipie.in)*`);

    return lines.join('\n');
  }

  public generateJson(
    run: EvaluationRun,
    requirements: RequirementMatrixItem[],
    findings: EvaluationFinding[],
    testRuns: TestRunRecord[]
  ): Record<string, any> {
    return {
      evalipieVersion: '2.0-production',
      domain: 'https://evalipie.in',
      tagline: 'Your project makes claims. Evalipie tries to break them.',
      run,
      requirements,
      findings,
      testRuns,
      exportedAt: new Date().toISOString()
    };
  }
}

export const reportGeneratorService = new ReportGeneratorService();
