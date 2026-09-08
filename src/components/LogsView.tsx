import React, { useState } from 'react';
import { LogEntry } from '../types';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  Terminal, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  Trash2,
  Clock,
  Layers
} from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [isLive, setIsLive] = useState(true);
  const [copied, setCopied] = useState(false);

  const services = Array.from(new Set(logs.map((l) => l.service)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesService = serviceFilter === 'ALL' || log.service === serviceFilter;
    return matchesSearch && matchesLevel && matchesService;
  });

  const handleCopy = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healops-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Centralized Log Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Real-time streaming telemetry, stdout/stderr streams, container audits & trace spans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant={isLive ? 'secondary' : 'outline'}
            size="sm"
            icon={isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause Stream' : 'Resume Live'}
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownload}
          >
            Export
          </GlassButton>
        </div>
      </div>

      {/* Control Bar */}
      <GlassCard className="p-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, error code, or regex (e.g. status:500, timeout)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Service filter */}
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="h-8 px-2 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md text-slate-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="ALL">All Services</option>
                {services.map((svc) => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
            </div>

            {/* Level filters */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-md p-0.5">
              {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                    levelFilter === lvl
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Log Console Container */}
      <div className="bg-slate-950 dark:bg-zinc-950 text-slate-200 border border-slate-800 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 dark:bg-zinc-900/90 border-b border-slate-800 dark:border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>stream: stdout/stderr (pod-pool-east-1)</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Showing {filteredLogs.length} events
          </div>
        </div>

        {/* Scrollable logs list */}
        <div className="p-3 font-mono text-xs max-h-[580px] overflow-y-auto space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No matching log entries found. Adjust search terms or level filters.
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.level === 'ERROR' || log.level === 'CRITICAL';
              const isWarning = log.level === 'WARNING';
              
              return (
                <div
                  key={log.id || idx}
                  className="flex items-start gap-2.5 px-2 py-1 rounded hover:bg-slate-900/70 dark:hover:bg-zinc-900/70 transition-colors leading-relaxed group"
                >
                  <span className="text-slate-500 shrink-0 text-[11px] select-none">
                    {log.timestamp}
                  </span>

                  <span
                    className={`shrink-0 px-1.5 py-0.2 rounded text-[10px] font-semibold select-none ${
                      isError
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : isWarning
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {log.level}
                  </span>

                  <span className="text-blue-400 shrink-0 font-medium select-none text-[11px]">
                    [{log.service}]
                  </span>

                  <span
                    className={`flex-1 break-all ${
                      isError
                        ? 'text-rose-300 font-medium'
                        : isWarning
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
