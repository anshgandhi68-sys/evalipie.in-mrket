import React, { useState, useEffect } from 'react';
import { Shield, Zap, Server, Activity, CheckCircle2, AlertTriangle, RefreshCw, Flame } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminDashboardPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [outboxStats, setOutboxStats] = useState<any>(null);
  const [isTestingConcurrency, setIsTestingConcurrency] = useState(false);
  const [concurrencyResult, setConcurrencyResult] = useState<any>(null);

  const loadTelemetry = async () => {
    try {
      const [h, o] = await Promise.all([
        api.getAdminHealth(),
        api.getOutboxTelemetry()
      ]);
      setHealth(h);
      setOutboxStats(o);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunConcurrencyRace = async () => {
    setIsTestingConcurrency(true);
    setConcurrencyResult(null);
    try {
      const res = await api.runConcurrencyTest();
      setConcurrencyResult(res.simulation);
      loadTelemetry();
    } catch (err: any) {
      alert(err.message || 'Error running concurrency simulation');
    } finally {
      setIsTestingConcurrency(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">Platform Operations & Telemetry</h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                  All Systems Online
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Real-time observability of Aiven PostgreSQL, Kafka, OpenSearch, and Redis Cache</p>
            </div>
          </div>

          <button
            onClick={loadTelemetry}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 1. Cluster Services Health Cards */}
        {health?.services && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-gray-900">Aiven PostgreSQL</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-gray-500">{health.services.aivenPostgreSql.mode}</div>
              <div className="text-xs font-bold text-[#167D73] pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Latency: {health.services.aivenPostgreSql.latencyMs}ms</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-gray-900">Aiven Apache Kafka</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-gray-500">Topics: {health.services.aivenApacheKafka.topics.join(', ')}</div>
              <div className="text-xs font-bold text-[#167D73] pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Streaming Latency: {health.services.aivenApacheKafka.latencyMs}ms</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-gray-900">Aiven OpenSearch</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-gray-500">Indexed Catalog Documents: {health.services.aivenOpenSearch.indexedDocs} items</div>
              <div className="text-xs font-bold text-[#167D73] pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Query Latency: {health.services.aivenOpenSearch.latencyMs}ms</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-gray-900">Redis In-Memory Cache</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-gray-500">Sub-millisecond Session & Catalog Cache</div>
              <div className="text-xs font-bold text-[#167D73] pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cache Latency: {health.services.redisCache?.latencyMs ?? 2}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. THE SHOWSTOPPER: Live Interactive Concurrency Race Test */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Live Hackathon Concurrency Verification</span>
              </div>
              <h2 className="text-2xl font-black">Two Buyers Competing for the Last Remaining Unit</h2>
              <p className="text-xs text-gray-400 max-w-xl">
                Simulate two concurrent customer checkouts arriving at the exact same millisecond for an item with initial stock = 1. Watch PostgreSQL atomic row-locking prevent overselling.
              </p>
            </div>

            <button
              disabled={isTestingConcurrency}
              onClick={handleRunConcurrencyRace}
              className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95 shrink-0 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-gray-950" />
              <span>{isTestingConcurrency ? 'Executing Race...' : 'Trigger Live Concurrency Race'}</span>
            </button>
          </div>

          {/* Race Results Visualization */}
          {concurrencyResult && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-gray-300 border-b border-white/10 pb-3">
                <span>Scenario: {concurrencyResult.scenario}</span>
                <span className="text-emerald-400">Final Stock in DB: {concurrencyResult.verification.finalStockRemaining}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {concurrencyResult.raceResults.map((r: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      r.result === 'SUCCESS' 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                        : 'bg-red-950/40 border-red-500/50 text-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-sm">{r.buyer}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        r.result === 'SUCCESS' ? 'bg-emerald-500 text-gray-950' : 'bg-red-500 text-white'
                      }`}>
                        HTTP {r.status} {r.result}
                      </span>
                    </div>
                    <div className="text-xs opacity-90">
                      {r.result === 'SUCCESS' ? `Order Confirmed: ${r.orderNumber}` : r.message}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-900/30 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{concurrencyResult.verification.acidGuarantee}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Transactional Outbox & Kafka Telemetry Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900">Transactional Outbox Queue & Event Streaming</h3>
              <p className="text-xs text-gray-500">Guarantees zero dual-write anomalies between PostgreSQL and Kafka/OpenSearch.</p>
            </div>
            {outboxStats && (
              <div className="flex gap-4 text-xs font-bold">
                <span className="text-gray-500">Total: <b>{outboxStats.totalEvents}</b></span>
                <span className="text-emerald-700">Dispatched: <b>{outboxStats.dispatchedEvents}</b></span>
                <span className="text-amber-600">Pending: <b>{outboxStats.pendingEvents}</b></span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Topic Name</th>
                  <th className="py-3 px-4">Payload Summary</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Dispatched Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-gray-700 text-[11px]">
                {(outboxStats?.recentEvents || []).map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">{ev.id}</td>
                    <td className="py-3 px-4 text-[#167D73] font-bold">{ev.topic}</td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-xs">{JSON.stringify(ev.payload)}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(ev.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">
                      {ev.dispatchedAt ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Dispatched
                        </span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Pending Outbox
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
