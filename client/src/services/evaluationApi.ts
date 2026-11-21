import {
  EvaluationRun,
  EvaluationFinding,
  RequirementMatrixItem,
  TestRunRecord,
  StartEvaluationRequest,
  EvaluationProject
} from '../../../shared/types.js';

const API_BASE = '/api/v1';

export const evaluationApi = {
  /**
   * Start evaluation on GitHub repo, uploaded ZIP, or code files.
   */
  async startEvaluation(req: StartEvaluationRequest): Promise<EvaluationRun> {
    const res = await fetch(`${API_BASE}/evaluations/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to start evaluation: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.evaluation;
  },

  /**
   * Instant 1-click evaluation of pre-configured sample project for hackathon judges.
   */
  async startDemo(): Promise<EvaluationRun> {
    const res = await fetch(`${API_BASE}/evaluations/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to start demo evaluation: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.evaluation;
  },

  /**
   * Fetch current evaluation state and stage progress.
   */
  async getEvaluation(id: string): Promise<EvaluationRun> {
    const res = await fetch(`${API_BASE}/evaluations/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to load evaluation ${id}`);
    }
    const data = await res.json();
    return data.evaluation;
  },

  /**
   * Fetch findings with optional severity, category, or status filter.
   */
  async getFindings(
    id: string,
    filters?: { severity?: string; category?: string; status?: string }
  ): Promise<EvaluationFinding[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);

    const res = await fetch(`${API_BASE}/evaluations/${id}/findings?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load findings');
    const data = await res.json();
    return data.findings || [];
  },

  /**
   * Fetch Requirements Traceability Matrix.
   */
  async getRequirements(id: string): Promise<RequirementMatrixItem[]> {
    const res = await fetch(`${API_BASE}/evaluations/${id}/requirements`);
    if (!res.ok) throw new Error('Failed to load requirements');
    const data = await res.json();
    return data.requirements || [];
  },

  /**
   * Fetch automated test run records.
   */
  async getTestRuns(id: string): Promise<TestRunRecord[]> {
    const res = await fetch(`${API_BASE}/evaluations/${id}/test-runs`);
    if (!res.ok) throw new Error('Failed to load test runs');
    const data = await res.json();
    return data.testRuns || [];
  },

  /**
   * Download full Markdown report.
   */
  getMarkdownReportUrl(id: string): string {
    return `${API_BASE}/evaluations/${id}/report?format=markdown`;
  },

  /**
   * Download full JSON report.
   */
  getJsonReportUrl(id: string): string {
    return `${API_BASE}/evaluations/${id}/report?format=download`;
  },

  /**
   * Cancel ongoing evaluation.
   */
  async cancelEvaluation(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/evaluations/${id}/cancel`, { method: 'POST' });
    const data = await res.json();
    return data.success;
  },

  /**
   * List past projects and recent runs.
   */
  async listProjects(): Promise<{ projects: EvaluationProject[]; recentRuns: EvaluationRun[] }> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to load projects');
    const data = await res.json();
    return {
      projects: data.projects || [],
      recentRuns: data.recentRuns || []
    };
  }
};
