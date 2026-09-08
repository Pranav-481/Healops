import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GitCommit,
  GitBranch,
  Server,
  Layers,
  ShieldCheck,
  ArrowRight,
  AlertOctagon
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Deployment } from '../types';

interface DeploymentsViewProps {
  deployments: Deployment[];
  onRollback: (deployment: Deployment) => void;
  isRollingBack: boolean;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  deployments,
  onRollback,
  isRollingBack,
}) => {
  const [selectedEnv, setSelectedEnv] = useState<string>('ALL');
  const [confirmRollbackDeployment, setConfirmRollbackDeployment] = useState<Deployment | null>(null);

  const environments = ['ALL', 'Production', 'Staging', 'Development'];

  const filteredDeployments = deployments.filter(
    (d) => selectedEnv === 'ALL' || d.environment.toLowerCase() === selectedEnv.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900">
            Deployment Orchestration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Zero-downtime Canary, Blue-Green &amp; Rolling rollouts with instant automated rollback guardrails
          </p>
        </div>

        {/* Environment Filter */}
        <div className="flex items-center bg-white/40 border border-white/60 rounded-full p-1 text-xs backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          {environments.map((env) => (
            <button
              key={env}
              onClick={() => setSelectedEnv(env)}
              className={`btn-apple-glass px-3.5 py-1 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                selectedEnv === env
                  ? 'btn-glass-primary font-bold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60 font-semibold'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Deployment List */}
      <div className="space-y-3.5">
        {filteredDeployments.map((dep) => {
          const isFailed = dep.status === 'FAILED';
          const isRolledBack = dep.status === 'ROLLED_BACK';
          const isSuccess = dep.status === 'SUCCESS';

          return (
            <GlassCard
              key={dep.id}
              className="p-5"
              glow={isFailed ? 'rose' : isRolledBack ? 'purple' : undefined}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white/90 px-2.5 py-0.5 rounded-lg border border-white shadow-xs">
                      {dep.id}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold font-display tracking-wide text-slate-900">{dep.projectName}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/70 text-slate-700 font-mono border border-white/90 shadow-xs">
                      {dep.version}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg border border-slate-200/80 text-slate-600 font-medium bg-slate-50/60">
                      {dep.strategy}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isSuccess
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                          : isFailed
                          ? 'bg-rose-500/10 text-rose-700 border-rose-500/25 shadow-xs'
                          : 'bg-purple-500/10 text-purple-700 border-purple-500/25 shadow-xs'
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap font-mono">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5 text-slate-700" />
                      {dep.commitHash}
                    </span>
                    <span>&bull;</span>
                    <span>{dep.environment} cluster</span>
                    <span>&bull;</span>
                    <span>Deployed {dep.deployedAt}</span>
                  </p>

                  {/* Warning / Failure detail */}
                  {isFailed && (
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-300/60 text-xs text-rose-800 flex items-center gap-2.5 shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Synthetic Canary Probe failed: HTTP 500 error rate spiked to 18.4%.</span>
                    </div>
                  )}

                  {isRolledBack && (
                    <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-300/60 text-xs text-purple-800 flex items-center gap-2.5 shadow-xs">
                      <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Autonomous Rollback executed to stable release {dep.rollbackVersion || 'v2.13.9'}.</span>
                    </div>
                  )}
                </div>

                {/* Rollback Trigger */}
                <div className="shrink-0">
                  {dep.status !== 'ROLLED_BACK' && (
                    <GlassButton
                      variant={isFailed ? 'danger' : 'secondary'}
                      size="sm"
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => setConfirmRollbackDeployment(dep)}
                      title="Rollback to previous stable version"
                    >
                      Rollback to {dep.rollbackVersion || 'v2.13.9'}
                    </GlassButton>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Rollback Confirmation Modal */}
      {confirmRollbackDeployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
          <GlassCard className="max-w-md w-full p-6 space-y-4 shadow-2xl border-white/90">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display tracking-wide text-slate-900">Confirm Production Rollback</h3>
                <p className="text-xs text-slate-500">Deployment guardrail verification</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to rollback{' '}
              <strong className="text-slate-900 font-bold">{confirmRollbackDeployment.projectName}</strong> from{' '}
              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{confirmRollbackDeployment.version}</span> to stable release{' '}
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{confirmRollbackDeployment.rollbackVersion || 'v2.13.9'}</span>?
            </p>

            <div className="p-3.5 rounded-xl bg-white/60 border border-white/80 text-xs text-slate-600 space-y-1 font-mono shadow-xs">
              <div>&bull; Cluster: <span className="font-bold text-slate-800">{confirmRollbackDeployment.environment}</span></div>
              <div>&bull; Action: Kubernetes zero-downtime blue/green traffic redirection</div>
              <div>&bull; Audit Record: Immutable compliance event will be appended</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmRollbackDeployment(null)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="danger"
                size="sm"
                isLoading={isRollingBack}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => {
                  onRollback(confirmRollbackDeployment);
                  setConfirmRollbackDeployment(null);
                }}
              >
                Confirm Rollback
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
