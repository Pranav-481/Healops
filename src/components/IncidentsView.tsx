import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Bot,
  Zap,
  Clock,
  User,
  Activity,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Incident, HealingAction } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  onExecuteHealing: (incident: Incident, action: HealingAction) => void;
  isHealingExecuting: boolean;
  onOpenAIAnalysis: (incident: Incident) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onExecuteHealing,
  isHealingExecuting,
  onOpenAIAnalysis,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || 'inc-9021'
  );

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Incident Management &amp; Root Cause Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
          Prometheus threshold alerting, telemetry anomaly analysis &amp; autonomous self-healing execution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List (Left Column) */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Active Incidents ({incidents.length})
          </div>

          {incidents.map((inc) => {
            const isSelected = inc.id === selectedIncident?.id;
            const isCritical = inc.severity === 'CRITICAL';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <GlassCard
                key={inc.id}
                interactive
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-4 transition-all ${
                  isSelected ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white' : ''
                }`}
                glow={isCritical && !isResolved ? 'rose' : undefined}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-slate-800 font-bold bg-white/95 px-2 py-0.5 rounded-lg border border-white shadow-xs">
                    {inc.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                        : isCritical
                        ? 'bg-rose-500/10 text-rose-700 border-rose-500/25 shadow-xs'
                        : 'bg-amber-500/10 text-amber-700 border-amber-500/25 shadow-xs'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">{inc.title}</h3>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/50 font-mono">
                  <span className="font-semibold text-slate-700">{inc.service}</span>
                  <span>{inc.detectedTime}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Incident Details & Self-Healing Actions (Right 2 Columns) */}
        {selectedIncident && (
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-6 space-y-5">
              {/* Incident Header */}
              <div className="border-b border-slate-200/60 pb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white/95 px-2.5 py-0.5 rounded-lg border border-white shadow-xs">
                    {selectedIncident.id}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700">
                    {selectedIncident.severity}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 font-medium">
                    {selectedIncident.environment}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedIncident.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                        : 'bg-amber-500/10 text-amber-700 border-amber-500/25 shadow-xs'
                    }`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold font-display tracking-wide text-slate-900">
                  {selectedIncident.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedIncident.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Service</span>
                    <strong className="text-slate-800 font-bold">{selectedIncident.service}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assignee</span>
                    <strong className="text-slate-800 font-bold">{selectedIncident.assignedEngineer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Error Rate</span>
                    <strong className="text-rose-600 font-bold">{selectedIncident.errorRate}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latency P99</span>
                    <strong className="text-amber-600 font-bold">{selectedIncident.latencyMs}ms</strong>
                  </div>
                </div>
              </div>

              {/* AI Root Cause Analysis Box */}
              {selectedIncident.aiAnalysis && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/70 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm font-display tracking-wide">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Gemini Root Cause Diagnostic Analysis
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-500/25 font-bold shadow-xs">
                      {Math.round(selectedIncident.aiAnalysis.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {selectedIncident.aiAnalysis.rootCause}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-purple-200/60 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Telemetric Evidence:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside font-mono">
                      {selectedIncident.aiAnalysis.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      Risk Level: <strong className="text-amber-600 font-bold">{selectedIncident.aiAnalysis.riskAssessment}</strong>
                    </div>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={<Bot className="w-3.5 h-3.5 text-purple-600" />}
                      onClick={() => onOpenAIAnalysis(selectedIncident)}
                    >
                      Inspect with Copilot
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* Remediation / Self-Healing Actions */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Available Self-Healing Remediation Actions
                </div>

                <div className="space-y-2.5">
                  {selectedIncident.healingActions.map((act) => {
                    const isExecuting = act.status === 'EXECUTING';
                    const isSuccess = act.status === 'SUCCESS';

                    return (
                      <div
                        key={act.id}
                        className="btn-popup p-3.5 rounded-xl border border-white/80 bg-white/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{act.actionType}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                act.riskLevel === 'LOW'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'
                                  : 'bg-amber-500/10 text-amber-700 border-amber-500/25'
                              }`}
                            >
                              {act.riskLevel} RISK
                            </span>
                            {act.requiresApproval && (
                              <span className="text-[10px] font-bold border border-purple-300 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                Approval Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">{act.description}</p>
                          {act.auditMessage && (
                            <p className="text-[11px] text-slate-500 font-mono italic">
                              {act.auditMessage}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {isSuccess ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Remediated
                            </span>
                          ) : (
                            <GlassButton
                              variant={act.riskLevel === 'HIGH' ? 'danger' : 'primary'}
                              size="sm"
                              icon={<Zap className="w-3.5 h-3.5" />}
                              isLoading={isExecuting || isHealingExecuting}
                              onClick={() => onExecuteHealing(selectedIncident, act)}
                            >
                              {act.requiresApproval ? 'Approve & Execute' : 'Execute Recovery'}
                            </GlassButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
