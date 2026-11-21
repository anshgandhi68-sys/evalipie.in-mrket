import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, BookOpen, Users, TrendingUp, ShieldCheck, History } from 'lucide-react';
import { VoiceKhataWidget } from '../../components/voice/VoiceKhataWidget.js';
import { api } from '../../services/api.js';

export const VoiceKhataPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  const loadData = () => {
    api.getLedgerSummary('org-sharma').then(setSummary).catch(console.error);
    api.getLedgerCustomers('org-sharma').then(setCustomers).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#167D73] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                Gnani Hackathon Track PS2
              </span>
              <span className="text-xs text-gray-400 font-bold">Sharma Electronics Ledger</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Voice Khata Console</h1>
            <p className="text-xs text-gray-500 font-medium">Record credit and payments using your voice while attending to customers.</p>
          </div>

          <Link
            to="/business/voice-khata/ledger"
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#167D73]" />
            <span>View Manual Ledger Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Real-Time Ledger Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Outstanding Udhaar</span>
              <div className="text-2xl font-black text-[#111827]">
                ₹{summary.totalOutstandingUdhaar.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold block">Owed by customers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Today's Credit Given</span>
              <div className="text-2xl font-black text-red-600">
                ₹{summary.todayCreditGiven.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">Spoken credit entries</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Today's Received</span>
              <div className="text-2xl font-black text-emerald-600">
                ₹{summary.todayPaymentReceived.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">Payments settled</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Active Accounts</span>
              <div className="text-2xl font-black text-[#167D73]">
                {summary.totalActiveCustomers}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">Customers in ledger</span>
            </div>
          </div>
        )}

        {/* The Voice Khata Push-to-Talk Interactive Widget */}
        <VoiceKhataWidget onEntrySaved={loadData} />

        {/* Customer Accounts Quick Overview */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#167D73]" />
              <h3 className="font-extrabold text-gray-900 text-base">Customer Ledger Accounts</h3>
            </div>
            <Link to="/business/voice-khata/ledger" className="text-xs font-bold text-[#167D73] hover:underline">
              Full Transaction Log →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {customers.map(c => (
              <div key={c.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-gray-900">{c.name}</span>
                  {c.disambiguationTag && (
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-semibold">
                      {c.disambiguationTag}
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-[#111827]">
                  ₹{c.currentBalance.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-gray-400 block font-medium">Balance</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
