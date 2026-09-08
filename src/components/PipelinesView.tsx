import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Copy,
  Pause,
  RotateCcw,
  Terminal,
  GitBranch,
  GitCommit,
  User as UserIcon,
  ShieldCheck,
  Flame,
  Check,
  CheckCheck
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Pipeline, PipelineStage, LogEntry } from '../types';

interface PipelinesViewProps {
  pipelines: Pipeline[];
  terminalLogs: LogEntry[];
  onTriggerPipeline: (failHealthCheck?: boolean) => void;
  isRunning: boolean;
}

export const PipelinesView: React.FC<PipelinesViewProps> = ({
  pipelines,
  terminalLogs,
  onTriggerPipeline,
  isRunning,
}) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    pipelines[0]?.id || 'pipe-501'
  );
  const [logSearch, setLogSearch] = useState('');
  const [isLogPaused, setIsLogPaused] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  const selectedPipeline =
    pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const filteredLogs = terminalLogs.filter((l) =>
    l.message.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const getStageIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'FAILED':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'WARNING':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'RUNNING':
        return (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        );
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900">
            CI/CD Pipeline Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Deterministic 10-stage automated build, container security verification &amp; canary deployment
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Play className="w-3.5 h-3.5" />}
            isLoading={isRunning}
            onClick={() => onTriggerPipeline(false)}
          >
            Run Pipeline
          </GlassButton>
          <GlassButton
            variant="danger"
            size="sm"
            icon={<Flame className="w-3.5 h-3.5" />}
            isLoading={isRunning}
            onClick={() => onTriggerPipeline(true)}
            title="Trigger pipeline that fails synthetic health check to test Self-Healing"
          >
            Simulate Canary Anomaly
          </GlassButton>
        </div>
      </div>

      {/* Selected Pipeline Execution Header */}
      {selectedPipeline && (
        <GlassCard className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono text-slate-800 font-bold bg-white/90 px-2.5 py-0.5 rounded-lg border border-white shadow-xs">
                  #{selectedPipeline.id}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-display tracking-wide text-slate-900">
                  {selectedPipeline.projectName}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedPipeline.status === 'SUCCESS'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                      : selectedPipeline.status === 'FAILED'
                      ? 'bg-rose-500/10 text-rose-700 border-rose-500/25 shadow-xs'
                      : 'bg-slate-900 text-white border-slate-800 shadow-xs'
                  }`}
                >
                  {selectedPipeline.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-slate-500">
                  <GitCommit className="w-3.5 h-3.5 text-slate-700" />
                  {selectedPipeline.commitHash}
                </span>
                <span className="text-slate-700 font-medium">
                  "{selectedPipeline.commitMessage}"
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-700" />
                <span>{selectedPipeline.branch}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedPipeline.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedPipeline.durationSeconds}s</span>
              </div>
            </div>
          </div>

          {/* 10-Stage Pipeline Visualizer (Horizontal Chain) */}
          <div className="mt-5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              10-Stage Execution Matrix
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
              {selectedPipeline.stages.map((stage, idx) => {
                const isStageRunning = stage.status === 'RUNNING';
                const isStageFailed = stage.status === 'FAILED';
                const isStageSuccess = stage.status === 'SUCCESS';

                return (
                  <div
                    key={stage.name}
                    className={`
                      btn-popup p-2.5 rounded-xl border flex flex-col justify-between backdrop-blur-md transition-all
                      ${
                        isStageRunning
                          ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                          : isStageFailed
                          ? 'bg-rose-50/90 border-rose-400/60 shadow-xs text-slate-800'
                          : isStageSuccess
                          ? 'bg-white/70 border-white/90 hover:border-white hover:bg-white shadow-xs text-slate-800'
                          : 'bg-white/40 border-white/50 opacity-60 text-slate-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono opacity-70">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {getStageIcon(stage.status)}
                    </div>

                    <div>
                      <div className="text-xs font-bold truncate">
                        {stage.name.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] opacity-75 truncate mt-0.5">
                        {stage.displayName}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-current/20 text-[10px] font-mono flex justify-between">
                      <span className="font-semibold">{stage.status}</span>
                      <span>{stage.durationSeconds > 0 ? `${stage.durationSeconds}s` : '--'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Terminal Log Viewer */}
      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-slate-800" />
            <h3 className="font-bold font-display text-slate-900 text-sm tracking-wide">
              Live Pipeline Build Logs
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter output..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="bg-white/85 border border-white text-xs text-slate-800 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 w-48 placeholder:text-slate-400 font-mono shadow-xs"
              />
            </div>

            {/* Pause / Resume */}
            <button
              onClick={() => setIsLogPaused(!isLogPaused)}
              className="btn-popup px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/95 border-t-white bg-gradient-to-b from-white/95 via-white/80 to-white/85 text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer backdrop-blur-xl shadow-[0_4px_14px_rgba(15,23,42,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,1)]"
            >
              <Pause className="w-3.5 h-3.5" /> {isLogPaused ? 'Resume' : 'Pause'}
            </button>

            {/* Copy Logs */}
            <button
              onClick={handleCopyLogs}
              className="btn-popup px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/95 border-t-white bg-gradient-to-b from-white/95 via-white/80 to-white/85 text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer backdrop-blur-xl shadow-[0_4px_14px_rgba(15,23,42,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,1)]"
            >
              {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLog ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Terminal Window Box */}
        <div className="h-72 bg-slate-950/90 rounded-2xl p-4 font-mono text-xs overflow-y-auto border border-slate-800/80 space-y-1.5 shadow-inner">
          {filteredLogs.map((log) => {
            const isError = log.level === 'ERROR' || log.level === 'CRITICAL';
            const isWarning = log.level === 'WARNING';
            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 leading-relaxed"
              >
                <span className="text-slate-500 shrink-0 select-none text-[11px]">
                  [{log.timestamp}]
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isError
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-cyan-400 shrink-0 text-[11px]">[{log.service}]</span>
                <span className={`break-all ${isError ? 'text-rose-300' : isWarning ? 'text-amber-200' : 'text-slate-200'}`}>
                  {log.message}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
