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
import { Deployment, Project } from '../types';
import { Plus } from 'lucide-react';

interface DeploymentsViewProps {
  deployments: Deployment[];
  onRollback: (deployment: Deployment) => void;
  isRollingBack: boolean;
  onCreateDeployment?: (deploymentData: Partial<Deployment>) => Promise<void> | void;
  projects?: Project[];
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  deployments,
  onRollback,
  isRollingBack,
  onCreateDeployment,
  projects = [],
}) => {
  const [selectedEnv, setSelectedEnv] = useState<string>('ALL');
  const [confirmRollbackDeployment, setConfirmRollbackDeployment] = useState<Deployment | null>(null);

  // New Deployment Modal State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || 'proj-1');
  const [version, setVersion] = useState('v2.14.1');
  const [strategy, setStrategy] = useState<'Canary' | 'Blue-Green' | 'Rolling'>('Canary');
  const [environment, setEnvironment] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [commitMessage, setCommitMessage] = useState('deploy: automated release rollout');
  const [isDeploying, setIsDeploying] = useState(false);

  const environments = ['ALL', 'Production', 'Staging', 'Development'];

  const filteredDeployments = deployments.filter(
    (d) => selectedEnv === 'ALL' || d.environment.toLowerCase() === selectedEnv.toLowerCase()
  );

  const handleDeploySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      const proj = projects.find((p) => p.id === targetProjectId);
      if (onCreateDeployment) {
        await onCreateDeployment({
          projectId: targetProjectId,
          projectName: proj?.name || 'Payment Service',
          version,
          strategy,
          environment: environment as any,
          commitMessage
        });
      }
      setIsDeployModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

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

        {/* Actions & Environment Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsDeployModalOpen(true)}
          >
            Deploy Service
          </GlassButton>

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

      {/* New Deployment Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
          <GlassCard className="max-w-lg w-full p-6 space-y-4 shadow-2xl border-white/90">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display tracking-wide text-slate-900">
                    Deploy Microservice Release
                  </h3>
                  <p className="text-xs text-slate-500">Initiate zero-downtime canary or blue-green rollout</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeploySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Microservice *
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.environment})
                    </option>
                  ))}
                  {projects.length === 0 && (
                    <option value="proj-1">Payment Service (production)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Release Version *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v2.14.1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Deployment Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium cursor-pointer"
                  >
                    <option value="Canary">Canary (10% -&gt; 50% -&gt; 100%)</option>
                    <option value="Blue-Green">Blue-Green (Instant Traffic Cutover)</option>
                    <option value="Rolling">Rolling (Pod by Pod Zero-Downtime)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium cursor-pointer"
                >
                  <option value="Production">Production Cluster</option>
                  <option value="Staging">Staging Cluster</option>
                  <option value="Development">Development Cluster</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Commit / Release Notes
                </label>
                <input
                  type="text"
                  placeholder="feat: optimized connection pool & database keep-alives"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/60">
                <GlassButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDeployModalOpen(false)}
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isDeploying}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Trigger Deployment
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
