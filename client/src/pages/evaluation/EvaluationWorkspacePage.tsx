import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Github, 
  UploadCloud, 
  Play, 
  Settings2, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { evaluationApi } from '../../services/evaluationApi.js';

export const EvaluationWorkspacePage: React.FC = () => {
  const navigate = useNavigate();

  const [sourceType, setSourceType] = useState<'GITHUB' | 'ZIP' | 'DEMO'>('GITHUB');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [analysisDepth, setAnalysisDepth] = useState<'QUICK' | 'STANDARD' | 'DEEP'>('STANDARD');
  const [runTests, setRunTests] = useState(true);
  const [attemptReproduction, setAttemptReproduction] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (sourceType === 'GITHUB' && !repoUrl.trim()) {
        throw new Error('Please enter a valid GitHub repository URL.');
      }

      const run = await evaluationApi.startEvaluation({
        sourceType,
        repoUrl: sourceType === 'GITHUB' ? repoUrl.trim() : undefined,
        branch: sourceType === 'GITHUB' ? (branch.trim() || 'main') : undefined,
        projectName: projectName.trim() || undefined,
        problemStatement: problemStatement.trim() || undefined,
        analysisDepth,
        runTests,
        attemptReproduction
      });

      navigate(`/evaluation/${run.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start evaluation');
      setIsSubmitting(false);
    }
  };

  const handleLoadDemo = () => {
    setSourceType('DEMO');
    setProjectName('fintech-vault-transfer-service');
    setProblemStatement(`# Stated Requirements: Fintech Vault & Transfer Service
1. Atomic Balance Debiting: The engine guarantees zero-balance overdraft protection against concurrent debits.
2. Insecure Direct Object Reference (IDOR) Protection: All customer invoice API endpoints strictly authenticate caller ownership.
3. Discount Validation: Promo codes cannot be stacked and cart checkout total never drops below ₹0.`);
  };

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#111827] font-sans pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#687385] hover:text-[#105B55] mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#105B55]">Evaluation Workspace</span>
          <h1 className="text-3xl font-extrabold text-[#111827] mt-1">Configure Software Evaluation</h1>
          <p className="text-sm text-[#687385] mt-2">
            Submit your source repository and specify stated requirements to test implementation fidelity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ── Source Type Selector ──────────────────────────────────── */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#687385] mb-3">
              1. Choose Source Ingestion Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('GITHUB')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                  sourceType === 'GITHUB'
                    ? 'border-[#105B55] bg-[#E9F7F3]/40 ring-2 ring-[#105B55]/10'
                    : 'border-[#E5EAF0] bg-white hover:bg-[#F7F9FC]'
                }`}
              >
                <Github className={`w-5 h-5 shrink-0 mt-0.5 ${sourceType === 'GITHUB' ? 'text-[#105B55]' : 'text-[#687385]'}`} />
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">GitHub Repository</h4>
                  <p className="text-[11px] text-[#687385] mt-1">Direct clone and fetch via GitHub API</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('ZIP')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                  sourceType === 'ZIP'
                    ? 'border-[#105B55] bg-[#E9F7F3]/40 ring-2 ring-[#105B55]/10'
                    : 'border-[#E5EAF0] bg-white hover:bg-[#F7F9FC]'
                }`}
              >
                <UploadCloud className={`w-5 h-5 shrink-0 mt-0.5 ${sourceType === 'ZIP' ? 'text-[#105B55]' : 'text-[#687385]'}`} />
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">ZIP Archive Upload</h4>
                  <p className="text-[11px] text-[#687385] mt-1">Upload code files with path-traversal protection</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLoadDemo}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                  sourceType === 'DEMO'
                    ? 'border-[#105B55] bg-[#E9F7F3]/40 ring-2 ring-[#105B55]/10'
                    : 'border-[#E5EAF0] bg-white hover:bg-[#F7F9FC]'
                }`}
              >
                <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${sourceType === 'DEMO' ? 'text-amber-600' : 'text-[#687385]'}`} />
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Judge Demo Benchmark</h4>
                  <p className="text-[11px] text-[#687385] mt-1">Pre-configured fintech service with reproducible bugs</p>
                </div>
              </button>
            </div>

            {/* Ingestion Inputs */}
            {sourceType === 'GITHUB' && (
              <div className="mt-5 pt-4 border-t border-[#E5EAF0] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">Repository URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/organization/repository"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl text-xs font-mono text-[#111827] focus:outline-none focus:border-[#105B55]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl text-xs font-mono text-[#111827] focus:outline-none focus:border-[#105B55]"
                  />
                </div>
              </div>
            )}

            {sourceType === 'ZIP' && (
              <div className="mt-5 pt-4 border-t border-[#E5EAF0]">
                <div className="border-2 border-dashed border-[#E5EAF0] hover:border-[#105B55] rounded-xl p-8 text-center cursor-pointer bg-[#F7F9FC] transition">
                  <UploadCloud className="w-8 h-8 text-[#687385] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#111827]">Drag and drop your project ZIP file here</p>
                  <p className="text-[11px] text-[#687385] mt-1">Supports Node.js, Python, Go, Rust up to 50MB</p>
                </div>
              </div>
            )}

            {sourceType === 'DEMO' && (
              <div className="mt-5 pt-4 border-t border-[#E5EAF0] bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Selected: <strong>fintech-vault-transfer-service</strong>. Ready to execute real isolated race condition and IDOR tests.</span>
              </div>
            )}
          </div>

          {/* ── Requirements & Claims Editor ───────────────────────────── */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#687385]">
                2. Project Claims / Requirements (Optional)
              </label>
              <span className="text-[11px] text-[#687385]">Auto-extracted from README.md if left empty</span>
            </div>
            <textarea
              rows={5}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Paste the problem statement, hackathon requirements, or key claims your software makes..."
              className="w-full p-3.5 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl text-xs font-mono text-[#111827] focus:outline-none focus:border-[#105B55] placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* ── Advanced Configuration Toggles ────────────────────────── */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#687385] mb-4">
              3. Evaluation Engine Configuration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF0]">
                <div>
                  <h5 className="text-xs font-bold text-[#111827]">Execute Test Suite</h5>
                  <p className="text-[11px] text-[#687385]">Discover unit test runners and record pass/fail results</p>
                </div>
                <input
                  type="checkbox"
                  checked={runTests}
                  onChange={(e) => setRunTests(e.target.checked)}
                  className="w-4 h-4 text-[#105B55] rounded focus:ring-[#105B55]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF0]">
                <div>
                  <h5 className="text-xs font-bold text-[#111827]">Attempt Bug Reproduction</h5>
                  <p className="text-[11px] text-[#687385]">Execute targeted reproduction scripts in isolated sandbox</p>
                </div>
                <input
                  type="checkbox"
                  checked={attemptReproduction}
                  onChange={(e) => setAttemptReproduction(e.target.checked)}
                  className="w-4 h-4 text-[#105B55] rounded focus:ring-[#105B55]"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-3 rounded-xl border border-[#E5EAF0] bg-white text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-[#105B55] hover:bg-[#167D73] text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? 'Starting Evaluation...' : 'Begin 10-Stage Evaluation'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EvaluationWorkspacePage;
