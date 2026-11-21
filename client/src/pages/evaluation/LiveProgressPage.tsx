import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  Terminal, 
  FileCode, 
  StopCircle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { evaluationApi } from '../../services/evaluationApi.js';
import { EvaluationRun, EvaluationEventLog, StageStatus } from '../../../../shared/types.js';

export const LiveProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [events, setEvents] = useState<EvaluationEventLog[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Poll evaluation status and events
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchState = async () => {
      try {
        const run = await evaluationApi.getEvaluation(id);
        if (!isMounted) return;
        setEvaluation(run);

        // Fetch latest events
        const res = await fetch(`/api/v1/evaluations/${id}/events`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.events) {
            setEvents(data.events);
          }
        }

        // If completed, navigate to results after short delay
        if (run.status === 'COMPLETED') {
          setTimeout(() => {
            if (isMounted) {
              navigate(`/evaluation/${id}/results`);
            }
          }, 1500);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message);
      }
    };

    fetchState();
    pollInterval = setInterval(fetchState, 1000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [id, navigate]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll terminal log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleCancel = async () => {
    if (!id) return;
    await evaluationApi.cancelEvaluation(id);
  };

  const getStageIcon = (status: StageStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'RUNNING':
        return <Activity className="w-5 h-5 text-[#105B55] animate-spin shrink-0" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />;
    }
  };

  if (!evaluation && !errorMsg) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#105B55] font-semibold">
          <Activity className="w-5 h-5 animate-spin" /> Initializing Evaluation Pipeline...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#111827] font-sans pt-6 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E5EAF0] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#E9F7F3] text-[#105B55] font-bold">
                EVALUATION IN PROGRESS
              </span>
              <span className="text-xs text-[#687385] font-mono">ID: {id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mt-1">
              {evaluation?.projectName || 'Project Under Evaluation'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5EAF0] text-xs font-mono text-[#687385]">
              <Clock className="w-3.5 h-3.5 text-[#105B55]" />
              <span>Elapsed: {elapsedSeconds}s</span>
            </div>

            {evaluation?.status === 'RUNNING' && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <StopCircle className="w-3.5 h-3.5" /> Stop
              </button>
            )}

            {evaluation?.status === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => navigate(`/evaluation/${id}/results`)}
                className="px-4 py-2 rounded-xl bg-[#105B55] text-white hover:bg-[#167D73] text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Main Two-Column Layout: Stepper (Left) & Terminal (Right) ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Stepper (10 Stages) */}
          <div className="lg:col-span-5 bg-white border border-[#E5EAF0] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5EAF0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#687385]">
                10-Stage Evaluation Pipeline
              </h3>
              <span className="text-xs font-mono font-bold text-[#105B55]">
                Stage {evaluation?.currentStageId || 1} of 10
              </span>
            </div>

            <div className="space-y-3.5">
              {(evaluation?.stages || []).map((stage) => {
                const isCurrent = stage.id === evaluation?.currentStageId && stage.status === 'RUNNING';
                return (
                  <div
                    key={stage.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                      isCurrent
                        ? 'bg-[#E9F7F3]/50 border border-[#167D73]/30'
                        : 'border border-transparent'
                    }`}
                  >
                    {getStageIcon(stage.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#105B55]' : 'text-[#111827]'}`}>
                          {stage.name}
                        </h4>
                        {stage.durationMs && (
                          <span className="text-[10px] font-mono text-[#687385]">
                            {stage.durationMs}ms
                          </span>
                        )}
                      </div>
                      {stage.message && (
                        <p className="text-[11px] text-[#687385] mt-0.5 truncate">{stage.message}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Telemetry Terminal */}
          <div className="lg:col-span-7 bg-[#111827] rounded-2xl p-4 shadow-xl border border-gray-800 flex flex-col h-[540px]">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-gray-400">evalipie-sandbox.telemetry.log</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Event Stream
              </span>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs text-gray-300 pr-2 selection:bg-teal-700 selection:text-white">
              {events.length === 0 && (
                <div className="text-gray-500 italic py-4">Waiting for execution events...</div>
              )}

              {events.map((evt) => {
                const color = 
                  evt.level === 'ERROR' ? 'text-red-400' :
                  evt.level === 'WARN' ? 'text-amber-400' :
                  evt.level === 'SUCCESS' ? 'text-emerald-400' : 'text-gray-300';

                return (
                  <div key={evt.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-gray-600 shrink-0 text-[10px]">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : ''}
                    </span>
                    <span className={`shrink-0 font-bold text-[10px] uppercase px-1 rounded ${
                      evt.level === 'ERROR' ? 'bg-red-950 text-red-400' :
                      evt.level === 'WARN' ? 'bg-amber-950 text-amber-400' :
                      evt.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {evt.stageName}
                    </span>
                    <span className={color}>{evt.message}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>

            {/* Terminal Footer */}
            <div className="pt-3 mt-3 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>Host: sandbox-worker-01 (Isolated)</span>
              <span>Total events logged: {events.length}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveProgressPage;
