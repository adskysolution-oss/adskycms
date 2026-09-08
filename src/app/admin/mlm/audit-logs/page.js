'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { History, Search, RefreshCw } from 'lucide-react';
export default function AdminMlmAuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('ALL');
    const [search, setSearch] = useState('');
    const loadLogs = async () => {
        setLoading(true);
        try {
            const url = selectedAction !== 'ALL'
                ? `/api/admin/mlm/audit-logs?action=${selectedAction}`
                : '/api/admin/mlm/audit-logs';
            const res = await fetch(url);
            const json = await res.json();
            if (res.ok && json.success) {
                setLogs(json.data || []);
            }
        }
        catch (e) {
            console.error('Failed to load MLM audit logs:', e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadLogs();
    }, [selectedAction]);
    const distinctActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
    const filtered = logs.filter((l) => {
        const q = search.toLowerCase();
        return (!q ||
            l.action?.toLowerCase().includes(q) ||
            l.performedByName?.toLowerCase().includes(q) ||
            l.targetModel?.toLowerCase().includes(q) ||
            l.reason?.toLowerCase().includes(q));
    });
    return (<DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <History className="w-5 h-5"/>
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                MLM Audit Logs
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Immutable historical event log tracking administrative verifications, level rule changes, and financial payout operations.
            </p>
          </div>

          <button onClick={loadLogs} disabled={loading} className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by action, administrator, target..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"/>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none">
              <option value="ALL">All Recorded Actions</option>
              {distinctActions.map((act) => (<option key={act} value={act}>
                  {act}
                </option>))}
            </select>

            <span className="text-gray-500 font-bold text-xs pl-2">
              {filtered.length} entries
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] border-b border-gray-200 font-bold">
                <tr>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Details / Values</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (<tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      No audit log records found.
                    </td>
                  </tr>) : (filtered.map((log) => (<tr key={log._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        <div>{log.performedByName || 'System'}</div>
                        <div className="text-[10px] font-normal text-gray-500">{log.performedByRole}</div>
                      </td>
                      <td className="p-4 text-gray-700 font-mono text-[11px]">
                        <div>{log.targetModel}</div>
                        <div className="text-[10px] text-gray-400">{log.targetId}</div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-sm text-[11px]">
                        {log.reason && <div className="font-semibold text-gray-900">{log.reason}</div>}
                        {log.newValue && (<pre className="text-[10px] bg-gray-50 p-1.5 rounded font-mono overflow-x-auto mt-0.5">
                            {JSON.stringify(log.newValue)}
                          </pre>)}
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp || log.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
