import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderGit2, 
  ExternalLink, 
  ArrowRight, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { evaluationApi } from '../../services/evaluationApi.js';
import { EvaluationProject, EvaluationRun } from '../../../../shared/types.js';

export const ProjectsHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<EvaluationProject[]>([]);
  const [recentRuns, setRecentRuns] = useState<EvaluationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await evaluationApi.listProjects();
        setProjects(data.projects);
        setRecentRuns(data.recentRuns);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#111827] font-sans pt-6 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E5EAF0] gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#105B55]">Project Repository Audit History</span>
            <h1 className="text-3xl font-extrabold text-[#111827] mt-1">Evaluated Software Projects</h1>
            <p className="text-sm text-[#687385] mt-1">
              Historical audits, requirement verification scores, and defect findings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/evaluate')}
              className="px-4 py-2.5 rounded-xl bg-[#105B55] hover:bg-[#167D73] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Evaluate New Project
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#687385] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#105B55]" /> Loading project evaluations...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-[#E9F7F3] text-[#105B55]">
                        {proj.sourceType}
                      </span>
                      {typeof proj.lastScore === 'number' && (
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          proj.lastScore >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Score: {proj.lastScore}/100
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#111827]">{proj.name}</h3>
                    {proj.description && (
                      <p className="text-xs text-[#687385] mt-1 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}

                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#167D73] hover:underline mt-2"
                      >
                        <span>{proj.repoUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5EAF0] flex items-center justify-between text-xs">
                    <span className="text-[#687385]">
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>

                    {proj.lastEvaluationId ? (
                      <button
                        onClick={() => navigate(`/evaluation/${proj.lastEvaluationId}/results`)}
                        className="font-bold text-[#105B55] hover:text-[#167D73] flex items-center gap-1"
                      >
                        <span>View Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/evaluate')}
                        className="font-bold text-[#105B55] hover:text-[#167D73] flex items-center gap-1"
                      >
                        <span>Evaluate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Evaluations Table */}
            {recentRuns.length > 0 && (
              <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#687385] mb-4">
                  Recent Evaluation Runs
                </h3>
                <div className="divide-y divide-[#E5EAF0]">
                  {recentRuns.map((run) => (
                    <div key={run.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#111827]">{run.projectName}</div>
                        <div className="text-[#687385] font-mono text-[11px]">
                          ID: {run.id} • {new Date(run.startedAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {run.status === 'COMPLETED' ? `${run.score}/100` : run.status}
                        </span>

                        <button
                          onClick={() => navigate(run.status === 'COMPLETED' ? `/evaluation/${run.id}/results` : `/evaluation/${run.id}`)}
                          className="font-bold text-[#105B55] hover:underline"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectsHistoryPage;
