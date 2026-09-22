import React, { useState } from 'react';
import {
  Activity,
  Layers,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Bot,
  ArrowUpRight,
  TrendingUp,
  Server,
  Database,
  Lock,
  CreditCard,
  RefreshCw,
  Clock,
  Radio,
  Plus
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { CreateProjectModal } from './CreateProjectModal';
import { Project, Pipeline, Incident, ServiceHealth } from '../types';

interface DashboardViewProps {
  projects: Project[];
  pipelines: Pipeline[];
  incidents: Incident[];
  servicesHealth: ServiceHealth[];
  onNavigateTab: (tab: string) => void;
  onOpenAIAnalysis: (incident: Incident) => void;
  onCreateProject?: (projectData: Partial<Project>) => Promise<void> | void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  pipelines,
  incidents,
  servicesHealth,
  onNavigateTab,
  onOpenAIAnalysis,
  onCreateProject,
}) => {
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '30D'>('24H');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const runningPipelines = pipelines.filter((p) => p.status === 'RUNNING').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const degradedServices = servicesHealth.filter((s) => s.status !== 'HEALTHY').length;

  const healthyServicesCount = servicesHealth.filter((s) => s.status === 'HEALTHY').length;
  const overallHealthPercent = Math.round((healthyServicesCount / servicesHealth.length) * 100);

  const activeIncident = incidents.find((i) => i.status !== 'RESOLVED') || incidents[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide font-display text-slate-900">
              System Overview &amp; Telemetry
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Real-time DevSecOps posture, pipeline execution telemetry, and autonomous recovery status
          </p>
        </div>

        {/* Action controls & Time Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-white/45 rounded-full p-1 border border-white/60 text-xs backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            {(['24H', '7D', '30D'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`btn-apple-glass px-3.5 py-1 rounded-full text-xs tracking-wide transition-all select-none cursor-pointer ${
                  timeFilter === filter
                    ? 'btn-glass-primary font-bold shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60 font-medium'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </GlassButton>

          <GlassButton
            id="create-project-btn"
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Project
          </GlassButton>
        </div>
      </div>

      {/* 7 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('projects')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Projects</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">{projects.length}</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All monitored
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('pipelines')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Active CI/CD</span>
            <PlayCircle className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">{runningPipelines}</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            10-stage run
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('deployments')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Deployments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">3</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            96.8% success
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('deployments')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Failed Deploys</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">1</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Payment v2.14.0
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('security')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Critical CVEs</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">2</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Patch required
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('incidents')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Active Incidents</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">{activeIncidents}</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Investigating
          </div>
        </GlassCard>

        <GlassCard className="p-4" interactive onClick={() => onNavigateTab('selfHealing')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide text-slate-700">Self-Healed</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-wide font-display text-slate-900 mt-1.5">18</div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-800 font-mono font-bold bg-white/90 border border-white px-2.5 py-0.5 rounded-full mt-2 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Avg MTTR: 38s
          </div>
        </GlassCard>
      </div>

      {/* System Health Card & AI Diagnostic Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Health */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm sm:text-base font-bold font-display tracking-wide text-slate-900">
                  Cluster Health &amp; Microservices SLO
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${
                  overallHealthPercent > 80
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/25 shadow-xs'
                }`}>
                  {overallHealthPercent}% {overallHealthPercent > 80 ? 'Healthy' : 'Degraded'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Synthetic probe health, p99 latency, and error rate across Kubernetes clusters
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Avg Probe: <span className="text-emerald-600 font-bold">34ms</span>
            </div>
          </div>

          {/* Services Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {servicesHealth.map((svc) => {
              const isHealthy = svc.status === 'HEALTHY';
              return (
                <div
                  key={svc.name}
                  className={`btn-popup p-3.5 rounded-xl border text-xs backdrop-blur-md transition-all ${
                    isHealthy
                      ? 'bg-white/60 border-white/80 hover:border-white hover:bg-white/85 shadow-xs'
                      : 'bg-amber-50/70 border-amber-300/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {svc.name.includes('API') && <Server className="w-4 h-4 text-slate-800" />}
                      {svc.name.includes('Database') && <Database className="w-4 h-4 text-slate-800" />}
                      {svc.name.includes('Payment') && <CreditCard className="w-4 h-4 text-slate-800" />}
                      {svc.name.includes('Auth') && <Lock className="w-4 h-4 text-slate-800" />}
                      <span className="font-bold tracking-wide text-slate-800">{svc.name}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHealthy
                          ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25'
                          : 'text-amber-700 bg-amber-500/10 border-amber-500/25'
                      }`}
                    >
                      {isHealthy ? 'Healthy' : 'Degraded'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/50 text-[11px] font-mono text-slate-500">
                    <div>
                      Uptime: <span className="text-slate-800 font-semibold">{svc.uptime}%</span>
                    </div>
                    <div>
                      Latency: <span className="text-slate-800 font-semibold">{svc.latencyMs}ms</span>
                    </div>
                    <div>
                      Error: <span className={svc.errorRate > 5 ? 'text-rose-600 font-bold' : 'text-slate-800 font-semibold'}>{svc.errorRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* AI Insight Card */}
        <GlassCard className="p-5 flex flex-col justify-between" glow="purple">
          <div>
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold font-display tracking-wide text-slate-900">AI Root Cause Analysis</span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-500/25 shadow-xs">
                94% Confidence
              </span>
            </div>

            <div className="mt-3.5 p-3 rounded-xl bg-white/65 border border-white/90 text-xs backdrop-blur-md shadow-xs">
              <div className="font-bold tracking-wide text-slate-900">Anomaly Signature:</div>
              <p className="text-slate-700 mt-1 leading-relaxed">
                Payment API latency spiked by 23% and error rate reached 18.4% immediately following deployment v2.14.0.
              </p>
            </div>

            <div className="mt-3.5 space-y-1 text-xs">
              <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Autonomous Recommendation:
              </div>
              <p className="text-slate-600 leading-relaxed">
                Database connection pool exhausted due to keep-alive socket leak. Execute container recycle or trigger automated rolling rollback to v2.13.9.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-purple-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">MTTR Est: 38s</span>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              onClick={() => {
                if (activeIncident) {
                  onOpenAIAnalysis(activeIncident);
                } else {
                  onNavigateTab('incidents');
                }
              }}
            >
              Analyze Incident
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* CI/CD Performance & Telemetry Waveform */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline Success Rate */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-sm font-bold font-display tracking-wide text-slate-900">
                CI/CD Pipeline Success Rate
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">14 workflow runs executed today</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-600 font-mono font-display">96.4%</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Payment Service (Canary)</span>
                <span className="text-rose-600 font-semibold font-mono">85% (Failed Canary Probe)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-white/80">
                <div className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full w-[85%] shadow-xs" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>E-Commerce Platform (Blue-Green)</span>
                <span className="text-emerald-600 font-semibold font-mono">100%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-white/80">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[100%] shadow-xs" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1.5 font-medium">
                <span>Authentication API (Rolling)</span>
                <span className="text-emerald-600 font-semibold font-mono">100%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-white/80">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[100%] shadow-xs" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Real-time Error Rate Waveform */}
        <GlassCard className="p-5" glow="rose">
          <div className="flex items-center justify-between mb-4 border-b border-rose-200/60 pb-3">
            <div>
              <h3 className="text-sm font-bold font-display tracking-wide text-slate-900">
                Payment Service Regression Waveform
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Telemetry anomaly detection</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-rose-600 font-mono font-display">18.4%</span>
              <p className="text-[11px] text-slate-500">SLO: &lt; 5%</p>
            </div>
          </div>

          <div className="h-28 w-full bg-white/60 rounded-xl p-3 border border-white/80 relative overflow-hidden flex items-end shadow-xs">
            <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d overflow-visible">
              <defs>
                <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,85 Q 50,83 100,84 T 200,85 T 280,82 Q 320,30 360,20 L 400,18 L 400,100 L 0,100 Z"
                fill="url(#errorGrad)"
              />
              <path
                d="M 0,85 Q 50,83 100,84 T 200,85 T 280,82 Q 320,30 360,20 L 400,18"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
              />
              <circle cx="400" cy="18" r="4" fill="#f43f5e" className="shadow-lg animate-pulse" />
            </svg>
            <div className="absolute top-2.5 left-3.5 text-[10px] text-slate-600 font-mono bg-white/80 px-2 py-0.5 rounded border border-white shadow-xs">
              Event: Deployment v2.14.0 canary rollout
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={onCreateProject}
      />
    </div>
  );
};
