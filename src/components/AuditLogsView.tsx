import React, { useState } from 'react';
import { AuditLog } from '../types';
import { mockAuditLogs } from '../data/mockData';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  FileCheck2, 
  Search, 
  Download, 
  Filter, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Shield,
  Layers
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    const matchesResult = resultFilter === 'ALL' || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Result', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.user,
      l.action,
      l.resource,
      l.resourceId,
      l.result,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `healops-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            Compliance &amp; Security Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Immutable SOC2 / ISO-27001 audit events: deployment executions, approvals &amp; autonomous recovery actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </GlassButton>
        </div>
      </div>

      {/* Control Bar */}
      <GlassCard className="p-3.5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, resource, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white/75 border border-white/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 font-medium shadow-xs"
            />
          </div>

          <div className="flex items-center bg-white/70 border border-white/90 rounded-xl p-1 text-xs backdrop-blur-md shadow-xs">
            {(['ALL', 'SUCCESS', 'FAILURE'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setResultFilter(res)}
                className={`btn-popup px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  resultFilter === res
                    ? 'bg-blue-600/15 text-blue-700 border border-blue-400/40 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 border border-transparent'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Audit Log Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-white/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Event ID / Time</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {log.id}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {log.timestamp}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.user}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/70 text-slate-800 border border-white/90 shadow-xs">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                    <div className="font-bold text-slate-900">{log.resource}</div>
                    <div className="font-mono text-[10px] text-slate-500">{log.resourceId}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {log.result === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 shadow-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        FAILURE
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-sm font-medium">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
