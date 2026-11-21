import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Terminal, 
  FileText, 
  Share2, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Bug,
  Cpu,
  Layers,
  ArrowLeft,
  ChevronDown,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { evaluationApi } from '../../services/evaluationApi.js';
import { 
  EvaluationRun, 
  RequirementMatrixItem, 
  EvaluationFinding, 
  TestRunRecord,
  FindingSeverity,
  RequirementStatus
} from '../../../../shared/types.js';

export const ResultsDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [requirements, setRequirements] = useState<RequirementMatrixItem[]>([]);
  const [findings, setFindings] = useState<EvaluationFinding[]>([]);
  const [testRuns, setTestRuns] = useState<TestRunRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'findings' | 'tests' | 'architecture'>('findings');
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [run, reqs, fndgs, tests] = await Promise.all([
          evaluationApi.getEvaluation(id),
          evaluationApi.getRequirements(id),
          evaluationApi.getFindings(id),
          evaluationApi.getTestRuns(id)
        ]);
        setEvaluation(run);
        setRequirements(reqs);
        setFindings(fndgs);
        setTestRuns(tests);
      } catch (err) {
        console.error('Failed to load evaluation data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center">
        <div className="text-sm font-semibold text-[#105B55] flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading Evaluation Report...
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-[#111827]">Evaluation Not Found</h2>
        <p className="text-xs text-[#687385] mt-1 mb-5 max-w-md">
          The requested evaluation ID could not be located. You can run a new evaluation or explore our benchmark demonstration project.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/evaluate')}
            className="px-4 py-2 rounded-xl bg-[#105B55] text-white text-xs font-bold shadow hover:bg-[#167D73]"
          >
            Start New Evaluation
          </button>
          <button
            onClick={() => navigate('/evaluation/eval-demo-fintech/results')}
            className="px-4 py-2 rounded-xl border border-[#E5EAF0] bg-white text-xs font-bold text-[#111827] hover:bg-[#F7F9FC]"
          >
            View Benchmark Demo
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = 
    evaluation.score >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    evaluation.score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-red-700 bg-red-50 border-red-200';

  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    return true;
  });

  const filteredRequirements = requirements.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#111827] font-sans pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5EAF0]">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#687385] hover:text-[#105B55] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Projects & Evaluations
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>

            <a
              href={evaluationApi.getMarkdownReportUrl(evaluation.id)}
              download
              className="px-3.5 py-1.5 rounded-lg bg-[#105B55] text-white hover:bg-[#167D73] text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Markdown
            </a>
          </div>
        </div>

        {/* ── 1. Executive Summary & Quality Score Banner ────────────────── */}
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#E5EAF0]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#105B55]">
                  Evaluation Verified Report
                </span>
                <span className="text-xs text-[#687385] font-mono">ID: {evaluation.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                {evaluation.projectName}
              </h1>
              {evaluation.repoUrl && (
                <a
                  href={evaluation.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#167D73] hover:underline mt-1"
                >
                  <span>{evaluation.repoUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Overall Score Gauge */}
            <div className="flex items-center gap-5">
              <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 ${scoreColor} shadow-sm`}>
                <span className="text-3xl font-black">{evaluation.score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">out of 100</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  evaluation.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {evaluation.score >= 70 ? 'APPROVED' : 'ACTION REQUIRED'}
                </span>
                <div className="text-xs text-[#687385] mt-1.5 space-y-0.5">
                  <div><strong>{findings.length}</strong> findings discovered</div>
                  <div><strong>{findings.filter(f => f.verificationStatus === 'REPRODUCED').length}</strong> confirmed in sandbox</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="mt-5 p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF0] text-xs leading-relaxed text-[#111827]">
            <h4 className="font-bold text-[#105B55] uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> AI Claim-vs-Reality Synthesis
            </h4>
            <p>{evaluation.executiveSummary}</p>
          </div>

          {/* 6-Dimension Score Breakdown */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Requirements', score: evaluation.scoreBreakdown.requirements, max: 25 },
              { label: 'Reliability', score: evaluation.scoreBreakdown.reliability, max: 25 },
              { label: 'Security', score: evaluation.scoreBreakdown.security, max: 20 },
              { label: 'Tests Suite', score: evaluation.scoreBreakdown.tests, max: 15 },
              { label: 'Architecture', score: evaluation.scoreBreakdown.architecture, max: 10 },
              { label: 'Dependencies', score: evaluation.scoreBreakdown.dependencies, max: 5 }
            ].map((dim) => (
              <div key={dim.label} className="p-3 rounded-xl bg-white border border-[#E5EAF0]">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[#687385] text-[11px]">{dim.label}</span>
                  <span className="font-mono font-bold text-[#111827]">{dim.score}/{dim.max}</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5EAF0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#105B55] rounded-full"
                    style={{ width: `${(dim.score / dim.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Interactive Navigation Tabs ─────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-[#E5EAF0] mb-6 overflow-x-auto">
          {[
            { id: 'findings', label: 'Bug & Security Findings', count: findings.length, icon: Bug },
            { id: 'matrix', label: 'Requirements Traceability Matrix', count: requirements.length, icon: FileText },
            { id: 'tests', label: 'Automated Test Results', count: testRuns.length, icon: Terminal },
            { id: 'architecture', label: 'Architecture & Stack', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-[#105B55] text-[#105B55]'
                    : 'border-transparent text-[#687385] hover:text-[#111827]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-[#105B55] text-white' : 'bg-[#E5EAF0] text-[#687385]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: BUG & SECURITY FINDINGS ─────────────────────────────── */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#687385]">Filter Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      severityFilter === sev
                        ? 'bg-[#105B55] text-white shadow-sm'
                        : 'bg-white border border-[#E5EAF0] text-[#687385] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#687385] font-mono">
                Showing {filteredFindings.length} of {findings.length} findings
              </span>
            </div>

            {filteredFindings.map((finding) => (
              <div 
                key={finding.id}
                className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5EAF0]">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      finding.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                      finding.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      finding.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {finding.severity}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      finding.verificationStatus === 'REPRODUCED' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {finding.verificationStatus === 'REPRODUCED' ? 'VERIFIED REPRODUCED IN SANDBOX' : finding.verificationStatus}
                    </span>

                    <span className="text-xs font-mono text-[#687385]">
                      {finding.filePath}:{finding.lineNumbers}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#687385] uppercase tracking-wider">
                    Category: {finding.category}
                  </span>
                </div>

                {/* Title & Explanation */}
                <div>
                  <h3 className="text-base font-bold text-[#111827]">{finding.title}</h3>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{finding.summary}</p>
                </div>

                {/* Failure Mechanism */}
                <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF0] text-xs">
                  <h4 className="font-bold text-[#111827] mb-1">Failure Mechanism & Vulnerability Details:</h4>
                  <p className="text-[#687385] leading-relaxed">{finding.failureMechanism}</p>
                </div>

                {/* Reproduction Steps */}
                {finding.reproductionSteps?.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <h4 className="font-bold text-[#111827]">Reproduction Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-[#687385]">
                      {finding.reproductionSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Sandboxed Terminal Output Box (Verifiable Evidence) */}
                {finding.sandboxOutput && (
                  <div>
                    <h4 className="font-bold text-xs text-[#111827] mb-1.5 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-600" />
                      <span>Isolated Sandbox Terminal Execution Log</span>
                    </h4>
                    <pre className="p-4 rounded-xl bg-[#111827] text-gray-200 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
                      <code>{finding.sandboxOutput}</code>
                    </pre>
                  </div>
                )}

                {/* Recommended Fix with Diff */}
                {finding.codeDiff && (
                  <div>
                    <h4 className="font-bold text-xs text-[#111827] mb-1.5 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Recommended Remediation Code Diff</span>
                    </h4>
                    <pre className="p-4 rounded-xl bg-[#1E293B] text-gray-200 font-mono text-xs overflow-x-auto leading-relaxed border border-gray-700">
                      <code>{finding.codeDiff}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 2: REQUIREMENTS TRACEABILITY MATRIX ───────────────────── */}
        {activeTab === 'matrix' && (
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Requirements vs Implementation Matrix</h3>
                <p className="text-xs text-[#687385] mt-0.5">
                  Correlates stated specification claims against discovered code symbols and runtime behavior.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {['ALL', 'SATISFIED', 'CONTRADICTED', 'PARTIAL'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      statusFilter === st
                        ? 'bg-[#105B55] text-white'
                        : 'bg-[#F7F9FC] border border-[#E5EAF0] text-[#687385]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredRequirements.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-[#E5EAF0] bg-[#F7F9FC] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#105B55]">Requirement #{req.requirementNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      req.status === 'SATISFIED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'CONTRADICTED' ? 'bg-red-100 text-red-800' :
                      req.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#111827]">{req.requirementText}</p>
                  
                  <div className="text-xs text-[#4B5563]">
                    <strong>Verdict:</strong> {req.verdict}
                  </div>

                  {req.gapAnalysis && (
                    <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      <strong>Gap Analysis:</strong> {req.gapAnalysis}
                    </div>
                  )}

                  {req.evidence?.length > 0 && (
                    <div className="pt-2 text-xs text-[#687385]">
                      <span className="font-semibold text-[#111827]">Correlated Code Evidence: </span>
                      {req.evidence.map((ev, i) => (
                        <code key={i} className="mr-2 px-2 py-0.5 rounded bg-white border border-[#E5EAF0] font-mono text-[11px] text-[#167D73]">
                          {ev.filePath}:{ev.lineNumbers}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: AUTOMATED TEST SUITE EXECUTION ─────────────────────── */}
        {activeTab === 'tests' && (
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Automated Test Runner Results</h3>
                <p className="text-xs text-[#687385] mt-0.5">
                  Tests discovered in repository and executed in isolated worker runner.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-700 font-bold">{evaluation.passedTests} Passed</span>
                <span className="text-red-700 font-bold">{evaluation.failedTests} Failed</span>
                <span className="text-[#687385]">Total: {evaluation.totalTests}</span>
              </div>
            </div>

            <div className="space-y-3">
              {testRuns.map((test) => (
                <div 
                  key={test.id}
                  className={`p-4 rounded-xl border text-xs ${
                    test.status === 'PASSED' 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {test.status === 'PASSED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-bold text-[#111827]">{test.testName}</span>
                    </div>
                    <span className="font-mono text-[#687385]">{test.durationMs}ms</span>
                  </div>

                  <div className="mt-1 font-mono text-[11px] text-[#687385] pl-6">
                    Suite: {test.testSuiteName}
                  </div>

                  {test.errorMessage && (
                    <div className="mt-2.5 p-3 rounded-lg bg-red-950 text-red-200 font-mono text-[11px]">
                      <div>{test.errorMessage}</div>
                      {test.stackTrace && <pre className="mt-1 text-gray-400 text-[10px]">{test.stackTrace}</pre>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: ARCHITECTURE & HEALTH ─────────────────────────────── */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#111827] mb-4">Technology Stack Overview</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                  <span className="text-[#687385]">Primary Language</span>
                  <span className="font-bold font-mono text-[#111827]">{evaluation.repoMetadata.primaryLanguage}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                  <span className="text-[#687385]">Detected Framework</span>
                  <span className="font-bold font-mono text-[#111827]">{evaluation.repoMetadata.framework || 'Custom'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                  <span className="text-[#687385]">Total Source Files</span>
                  <span className="font-bold font-mono text-[#111827]">{evaluation.repoMetadata.filesCount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                  <span className="text-[#687385]">Total Lines of Code</span>
                  <span className="font-bold font-mono text-[#111827]">{evaluation.repoMetadata.linesOfCode} LOC</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                  <span className="text-[#687385]">Package Dependencies</span>
                  <span className="font-bold font-mono text-[#111827]">{evaluation.repoMetadata.dependenciesCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#111827] mb-4">Language Distribution</h3>
              <div className="space-y-3">
                {Object.entries(evaluation.repoMetadata.languages || {}).map(([lang, lines]) => {
                  const pct = Math.round((lines / Math.max(1, evaluation.repoMetadata.linesOfCode)) * 100);
                  return (
                    <div key={lang}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#111827]">{lang}</span>
                        <span className="font-mono text-[#687385]">{lines} LOC ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#E5EAF0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#105B55] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultsDashboardPage;
