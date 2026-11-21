import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Github, 
  UploadCloud, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Code2, 
  Activity,
  FileCheck2,
  Bug,
  Cpu,
  Sparkles
} from 'lucide-react';
import { evaluationApi } from '../../services/evaluationApi.js';
import { DoorHero } from '../../components/hero/DoorHero.js';

export const EvaluationLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const run = await evaluationApi.startEvaluation({
        sourceType: 'GITHUB',
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || 'main',
        runTests: true,
        attemptReproduction: true
      });
      navigate(`/evaluation/${run.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start evaluation');
      setIsLoading(false);
    }
  };

  const handleLaunchDemo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const run = await evaluationApi.startDemo();
      navigate(`/evaluation/${run.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to launch demo');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] text-[#111827] font-sans selection:bg-[#167D73] selection:text-white">
      
      {/* ── 1. 3D Architectural Storefront Hero with Container-Query Doorway ── */}
      <DoorHero 
        onEnter={() => {
          document.getElementById('evaluation-core')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── 2. Evaluation Core Platform Section ───────────────────────────── */}
      <div id="evaluation-core" className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        
        {/* Flagship Header Badge */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#105B55]/10 text-[#105B55]">
              <Cpu className="w-3.5 h-3.5 text-[#167D73]" /> Autonomous AI Software Auditor
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-[#687385]">
              Domain: <code className="font-mono text-[#111827]">evalipie.in</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/marketplace" 
              className="text-xs font-bold text-[#167D73] hover:text-[#105B55] hover:underline"
            >
              Browse Hyperlocal Marketplace →
            </Link>
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Your project makes claims.<br />
            <span className="text-[#105B55]">Evalipie tries to break them.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#687385] leading-relaxed">
            An intelligent software evaluation platform that examines your code, challenges your stated requirements,
            identifies potential failure points, and executes sandboxed reproductions to discover what your tests missed.
          </p>
        </div>

        {/* ── 3. Primary Input Box: GitHub Repo + Evaluate CTA ──────────────── */}
        <div className="max-w-2xl mx-auto bg-white border border-[#E5EAF0] rounded-2xl shadow-xl shadow-[#105B55]/5 p-4 sm:p-6 mb-8">
          <form onSubmit={handleStartGitHub} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#687385] mb-2">
                Public GitHub Repository URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Github className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#687385]" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl text-sm font-mono text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#167D73] focus:ring-2 focus:ring-[#167D73]/20 transition"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="branch: main"
                    className="w-full px-3 py-3 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl text-xs font-mono text-[#111827] focus:outline-none focus:border-[#167D73]"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#105B55] hover:bg-[#167D73] text-white font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" /> Ingesting & Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Start Deep Evaluation
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/evaluate')}
                className="py-3.5 px-5 rounded-xl border border-[#E5EAF0] bg-white hover:bg-[#F7F9FC] text-[#111827] font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-[#687385]" /> Upload ZIP / Config
              </button>
            </div>
          </form>

          {/* 1-Click Demo Evaluation for Hackathon Judges */}
          <div className="mt-5 pt-4 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#687385]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Judging or testing? Evaluate our benchmark fintech microservice immediately:</span>
            </div>
            <button
              type="button"
              onClick={handleLaunchDemo}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-[#E9F7F3] hover:bg-[#D5EFE9] text-[#105B55] font-bold border border-[#167D73]/30 transition shrink-0 flex items-center gap-1.5"
            >
              <span>Try Sample Project (1-Click)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── 4. Key Metrics & Value Propositions (4 Cards) ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <div className="bg-white p-5 rounded-xl border border-[#E5EAF0] shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-[#E9F7F3] text-[#105B55] flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111827] mb-1">Requirements Traceability</h3>
            <p className="text-xs text-[#687385] leading-relaxed">
              Extracts stated specifications from your claims or docs and verifies whether implementation code actually supports them.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5EAF0] shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111827] mb-1">Bug & Vulnerability Discovery</h3>
            <p className="text-xs text-[#687385] leading-relaxed">
              Detects race conditions, IDOR access bypasses, secret leaks, and edge-case boundary errors with exact line numbers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5EAF0] shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111827] mb-1">Isolated Bug Reproduction</h3>
            <p className="text-xs text-[#687385] leading-relaxed">
              Runs automated reproduction scripts in an isolated sandbox subprocess, capturing real terminal output as proof.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5EAF0] shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#167D73] flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#111827] mb-1">Transparent 0–100 Score</h3>
            <p className="text-xs text-[#687385] leading-relaxed">
              Objective 6-dimension score breakdown with actionable remediation guidance and ready-to-merge code diffs.
            </p>
          </div>
        </div>

        {/* ── 5. The 10-Stage Autonomous Evaluation Pipeline ────────────────── */}
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 sm:p-8 mb-16 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#167D73] uppercase tracking-wider">Evaluation Engine Architecture</span>
              <h2 className="text-2xl font-extrabold text-[#111827] mt-1">
                10 Real Analysis Stages. Zero Simulated Intelligence.
              </h2>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#F7F9FC] text-[#687385] border border-[#E5EAF0]">
              SSE Telemetry Streamed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { num: '01', title: 'Input Validation', desc: 'Sanitization & security check' },
              { num: '02', title: 'Repo Ingestion', desc: 'Secure tree & LOC extraction' },
              { num: '03', title: 'Structure Analysis', desc: 'AST & module symbol graphs' },
              { num: '04', title: 'Tech Stack', desc: 'Language, framework & deps' },
              { num: '05', title: 'Claim Extraction', desc: 'Traceability Matrix generation' },
              { num: '06', title: 'Static Analysis', desc: 'Vulnerabilities & logic flaws' },
              { num: '07', title: 'Test Execution', desc: 'Test suite discovery & runs' },
              { num: '08', title: 'AI Reasoning', desc: 'Claim vs implementation check' },
              { num: '09', title: 'Bug Reproduction', desc: 'Sandboxed subprocess trials' },
              { num: '10', title: 'Quality Scoring', desc: '0–100 score & Markdown export' }
            ].map((st) => (
              <div key={st.num} className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF0] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#105B55]">{st.num}</span>
                  <h4 className="text-xs font-bold text-[#111827] mt-1">{st.title}</h4>
                </div>
                <p className="text-[11px] text-[#687385] mt-2 leading-tight">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. Bottom Banner / CTA ───────────────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-[#105B55] to-[#167D73] text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold">Ready to challenge your software's claims?</h3>
            <p className="text-sm opacity-90 mt-1 max-w-xl">
              Submit your repository URL or run the sample project in one click to view the live 10-stage evaluation stepper.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLaunchDemo}
            className="px-6 py-3.5 bg-white text-[#105B55] font-bold text-sm rounded-xl shadow-lg hover:bg-[#FBF7EF] transition shrink-0 flex items-center gap-2"
          >
            <span>Launch Instant Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default EvaluationLandingPage;
