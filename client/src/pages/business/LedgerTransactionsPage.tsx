import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, BookOpen, Mic, Download, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';
import { LedgerEntry, LedgerCustomer } from '../../../../shared/types.js';

export const LedgerTransactionsPage: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [customers, setCustomers] = useState<LedgerCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLedgerEntries('org-sharma'),
      api.getLedgerCustomers('org-sharma')
    ]).then(([entriesData, customersData]) => {
      setEntries(entriesData);
      setCustomers(customersData);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !searchQuery || 
      e.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || e.entryType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link to="/business/voice-khata" className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voice Khata Push-to-Talk</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Manual Ledger Audit & History</h1>
            <p className="text-xs text-gray-500">Transparent financial records of every credit and payment entry recorded via voice or manual entry.</p>
          </div>

          <Link
            to="/business/voice-khata"
            className="bg-[#167D73] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto hover:bg-[#105B55] transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Open Voice Session</span>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or note..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#167D73]"
            />
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            {['ALL', 'CREDIT', 'PAYMENT'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'ALL' ? 'All Transactions' : type === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment (Jama)'}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4">Source & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">Loading ledger records...</td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">No transactions matching your search.</td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {entry.customerName || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          entry.entryType === 'CREDIT' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {entry.entryType === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment Received'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-black text-sm ${
                        entry.entryType === 'CREDIT' ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {entry.entryType === 'CREDIT' ? '+' : '-'} ₹{entry.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-gray-900">
                        ₹{entry.balanceAfter.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#167D73]" />
                        <span>{entry.notes || 'Recorded via Voice Khata'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#E9F7F3] p-4 rounded-2xl border border-[#167D73]/20 flex items-center gap-2 text-xs text-[#105B55] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#167D73] shrink-0" />
          <span>Every transaction is recorded with auditable timestamps, customer balances, and merchant organization tenant isolation.</span>
        </div>
      </div>
    </div>
  );
};
