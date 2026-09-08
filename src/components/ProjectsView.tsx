import React, { useState } from 'react';
import { Project } from '../types';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  FolderGit2, 
  GitBranch, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject?: (projectId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onNavigateTab
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'DEGRADED' | 'CRITICAL'>('ALL');
  const [envFilter, setEnvFilter] = useState<'ALL' | 'production' | 'staging' | 'development'>('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.repository.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesEnv = envFilter === 'ALL' || p.environment === envFilter;
    return matchesSearch && matchesStatus && matchesEnv;
  });

  const healthyCount = projects.filter(p => p.status === 'HEALTHY').length;
  const degradedCount = projects.filter(p => p.status === 'DEGRADED').length;
  const criticalCount = projects.filter(p => p.status === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900">
            Projects &amp; Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Managed microservices, Git repositories, health benchmarks, and deployment targets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton 
            variant="primary" 
            size="sm" 
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => alert('New Service Onboarding: Connect GitHub / GitLab repository via webhook')}
          >
            New Project
          </GlassButton>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Services</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 font-mono">{projects.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">100% cloud-native</div>
        </GlassCard>

        <GlassCard className="p-4" glow="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-600 mt-1 font-mono">{healthyCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">Passing all SLOs</div>
        </GlassCard>

        <GlassCard className="p-4" glow="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Degraded</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-600 mt-1 font-mono">{degradedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">Elevated latency / rate</div>
        </GlassCard>

        <GlassCard className="p-4" glow="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Critical</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-600 mt-1 font-mono">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">Attention required</div>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, repo, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white/85 border border-white rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white/40 border border-white/60 rounded-full p-1 text-xs backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="px-2 text-slate-600 flex items-center gap-1 font-bold">
              <Filter className="w-3 h-3 text-indigo-600" /> Status:
            </span>
            {(['ALL', 'HEALTHY', 'DEGRADED', 'CRITICAL'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`btn-apple-glass px-3 py-1 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'btn-glass-primary font-bold shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60 font-semibold'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const isHealthy = project.status === 'HEALTHY';
          const isDegraded = project.status === 'DEGRADED';
          
          return (
            <GlassCard key={project.id} className="p-5 flex flex-col justify-between" interactive glow={isHealthy ? 'emerald' : isDegraded ? 'amber' : 'rose'}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FolderGit2 className="w-4 h-4 text-slate-800 shrink-0" />
                      <h3 className="text-sm sm:text-base font-bold font-display tracking-wide text-slate-900">
                        {project.name}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 bg-slate-50 font-semibold">
                        {project.environment}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-medium">
                      {project.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 shadow-xs'
                        : isDegraded
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/25 shadow-xs'
                        : 'bg-rose-500/10 text-rose-700 border-rose-500/25 shadow-xs'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    {project.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1.5 truncate max-w-[220px]">
                    <GitBranch className="w-3.5 h-3.5 text-slate-700" />
                    {project.repository} ({project.branch})
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {project.lastDeployment}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Health</span>
                    <span className={`font-mono font-bold ${project.healthScore >= 90 ? 'text-emerald-600' : project.healthScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {project.healthScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Security</span>
                    <span className="font-mono font-bold text-blue-600">
                      {project.securityScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Pipeline</span>
                    <span className={`font-mono font-bold ${project.lastPipelineStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {project.lastPipelineStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateTab && onNavigateTab('pipelines')}
                  >
                    View CI/CD
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />}
                    onClick={() => onNavigateTab && onNavigateTab('monitoring')}
                  >
                    Telemetry
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
