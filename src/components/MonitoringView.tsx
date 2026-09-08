import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Server,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { ServiceHealth, MonitoringMetricPoint } from '../types';

interface MonitoringViewProps {
  servicesHealth: ServiceHealth[];
  metrics: MonitoringMetricPoint[];
  onRefreshMetrics: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  servicesHealth,
  metrics,
  onRefreshMetrics,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'latency' | 'errorRate'>('latency');

  const latest = metrics[metrics.length - 1] || {
    cpuPercent: 42,
    memoryPercent: 64,
    latencyMs: 38,
    errorRatePercent: 0.05,
    requestsPerSec: 1240
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-slate-900" />
            Infrastructure Telemetry &amp; Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Prometheus node metrics, synthetic latency probes &amp; microservices SLO tracking
          </p>
        </div>

        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRefreshMetrics}
        >
          Refresh Probes
        </GlassButton>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard
          className={`p-4 cursor-pointer transition-all ${
            selectedMetric === 'cpu' ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white shadow-md' : ''
          }`}
          onClick={() => setSelectedMetric('cpu')}
          interactive
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide">Cluster CPU</span>
            <Cpu className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1.5 font-mono">{latest.cpuPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">16 Nodes &bull; Normal</div>
        </GlassCard>

        <GlassCard
          className={`p-4 cursor-pointer transition-all ${
            selectedMetric === 'memory' ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white shadow-md' : ''
          }`}
          onClick={() => setSelectedMetric('memory')}
          interactive
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide">Cluster Memory</span>
            <HardDrive className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1.5 font-mono">{latest.memoryPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">128GB Allocated</div>
        </GlassCard>

        <GlassCard
          className={`p-4 cursor-pointer transition-all ${
            selectedMetric === 'latency' ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white shadow-md' : ''
          }`}
          onClick={() => setSelectedMetric('latency')}
          interactive
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide">Global P99 Latency</span>
            <Clock className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1.5 font-mono">{latest.latencyMs}ms</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">SLO: &lt; 100ms</div>
        </GlassCard>

        <GlassCard
          className={`p-4 cursor-pointer transition-all ${
            selectedMetric === 'errorRate' ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white shadow-md' : ''
          }`}
          onClick={() => setSelectedMetric('errorRate')}
          interactive
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wide">HTTP Error Rate</span>
            <Activity className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1.5 font-mono">{latest.errorRatePercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{latest.requestsPerSec} req/sec</div>
        </GlassCard>
      </div>

      {/* SVG Time Series Graph */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display tracking-wide text-slate-900 capitalize">
              Prometheus Metric: {selectedMetric.replace(/([A-Z])/g, ' $1')} (24-Hour Window)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sample Interval: 1h &bull; Aggregation: Avg</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Metric: <span className="font-bold text-slate-900">{selectedMetric}</span>
          </div>
        </div>

        {/* SVG Metric Chart */}
        <div className="h-44 w-full bg-white/60 rounded-xl p-3 border border-white/85 relative overflow-hidden flex items-end shadow-xs">
          <svg viewBox="0 0 800 160" className="w-full h-full preserve-3d overflow-visible">
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="currentColor" className="text-slate-200" strokeDasharray="4" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="currentColor" className="text-slate-200" strokeDasharray="4" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="currentColor" className="text-slate-200" strokeDasharray="4" />

            {/* Metric Polyline */}
            {metrics.length > 0 && (
              <>
                <path
                  d={`
                    M 0,${160 - (metrics[0][selectedMetric === 'cpu' ? 'cpuPercent' : selectedMetric === 'memory' ? 'memoryPercent' : selectedMetric === 'latency' ? 'latencyMs' : 'errorRatePercent'] || 20) * (selectedMetric === 'latency' ? 0.8 : 1.4)}
                    ${metrics.map((m, i) => {
                      const val = selectedMetric === 'cpu' ? m.cpuPercent : selectedMetric === 'memory' ? m.memoryPercent : selectedMetric === 'latency' ? m.latencyMs : m.errorRatePercent * 8;
                      const x = (i / (metrics.length - 1)) * 800;
                      const y = Math.max(10, Math.min(150, 150 - val * (selectedMetric === 'latency' ? 0.35 : 1.2)));
                      return `L ${x},${y}`;
                    }).join(' ')}
                    L 800,160 L 0,160 Z
                  `}
                  fill="url(#metricGrad)"
                />
                <path
                  d={`
                    M 0,${160 - (metrics[0][selectedMetric === 'cpu' ? 'cpuPercent' : selectedMetric === 'memory' ? 'memoryPercent' : selectedMetric === 'latency' ? 'latencyMs' : 'errorRatePercent'] || 20) * (selectedMetric === 'latency' ? 0.8 : 1.4)}
                    ${metrics.map((m, i) => {
                      const val = selectedMetric === 'cpu' ? m.cpuPercent : selectedMetric === 'memory' ? m.memoryPercent : selectedMetric === 'latency' ? m.latencyMs : m.errorRatePercent * 8;
                      const x = (i / (metrics.length - 1)) * 800;
                      const y = Math.max(10, Math.min(150, 150 - val * (selectedMetric === 'latency' ? 0.35 : 1.2)));
                      return `L ${x},${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              </>
            )}
          </svg>
        </div>
      </GlassCard>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {servicesHealth.map((svc) => (
          <GlassCard key={svc.name} className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900">{svc.name}</span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                svc.status === 'HEALTHY'
                  ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25 shadow-xs'
                  : 'text-amber-700 bg-amber-500/10 border-amber-500/25 shadow-xs'
              }`}>
                {svc.status}
              </span>
            </div>

            <div className="space-y-1.5 mt-3.5 pt-2.5 border-t border-slate-200/50 text-xs text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="font-semibold text-slate-800">{svc.latencyMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className={`font-semibold ${svc.errorRate > 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {svc.errorRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-semibold text-emerald-600">{svc.uptime}%</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
