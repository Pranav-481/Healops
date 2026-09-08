import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle,
  FileCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  Cpu,
  Check
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Vulnerability } from '../types';

interface SecurityViewProps {
  vulnerabilities: Vulnerability[];
  onTriggerScan: () => void;
  onResolveVuln: (id: string) => void;
  isScanning: boolean;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  vulnerabilities,
  onTriggerScan,
  onResolveVuln,
  isScanning,
}) => {
  const [selectedScanner, setSelectedScanner] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scanners = ['ALL', 'Trivy', 'Semgrep', 'Gitleaks', 'SonarQube'];

  const filteredVulns = vulnerabilities.filter((v) => {
    const matchesScanner = selectedScanner === 'ALL' || v.scanner === selectedScanner;
    const matchesSeverity = severityFilter === 'ALL' || v.severity === severityFilter;
    const matchesSearch =
      v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScanner && matchesSeverity && matchesSearch;
  });

  const criticalCount = vulnerabilities.filter((v) => v.severity === 'CRITICAL' && v.status !== 'RESOLVED').length;
  const highCount = vulnerabilities.filter((v) => v.severity === 'HIGH' && v.status !== 'RESOLVED').length;
  const mediumCount = vulnerabilities.filter((v) => v.severity === 'MEDIUM' && v.status !== 'RESOLVED').length;
  const lowCount = vulnerabilities.filter((v) => v.severity === 'LOW' && v.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header & Scan Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            Security &amp; Vulnerability Posture
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Static analysis (SAST), software composition analysis (SCA), secrets detection &amp; container CVE audits
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          isLoading={isScanning}
          onClick={onTriggerScan}
        >
          {isScanning ? 'Running Security Audit...' : 'Trigger Multi-Scanner Audit'}
        </GlassButton>
      </div>

      {/* Security Score Banner & Severity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Score Card */}
        <GlassCard className="p-5 flex items-center justify-between" glow="emerald">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enterprise Security Score
            </span>
            <div className="text-3xl font-bold font-display text-emerald-600 mt-1 font-mono">
              87 / 100
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero secrets leaked &bull; 2 container patches available
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </GlassCard>

        {/* Severity Breakdown Card */}
        <GlassCard className="md:col-span-2 p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Vulnerability Severity Breakdown
          </span>
          <div className="grid grid-cols-4 gap-2.5 mt-3">
            <button
              onClick={() => setSeverityFilter(severityFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
              className={`btn-popup p-3 rounded-xl border text-left transition-all backdrop-blur-md ${
                severityFilter === 'CRITICAL'
                  ? 'bg-rose-50/90 border-rose-400/60 shadow-xs'
                  : 'bg-white/60 border-white/80 hover:border-white shadow-xs'
              }`}
            >
              <div className="text-[11px] font-bold text-rose-600">CRITICAL</div>
              <div className="text-xl font-bold font-display text-slate-900 font-mono mt-0.5">{criticalCount}</div>
              <div className="text-[10px] text-slate-400 font-mono">CVSS &ge; 9.0</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'HIGH' ? 'ALL' : 'HIGH')}
              className={`btn-popup p-3 rounded-xl border text-left transition-all backdrop-blur-md ${
                severityFilter === 'HIGH'
                  ? 'bg-amber-50/90 border-amber-400/60 shadow-xs'
                  : 'bg-white/60 border-white/80 hover:border-white shadow-xs'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-600">HIGH</div>
              <div className="text-xl font-bold font-display text-slate-900 font-mono mt-0.5">{highCount}</div>
              <div className="text-[10px] text-slate-400 font-mono">CVSS 7.0-8.9</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
              className={`btn-popup p-3 rounded-xl border text-left transition-all backdrop-blur-md ${
                severityFilter === 'MEDIUM'
                  ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                  : 'bg-white/60 border-white/80 hover:border-white shadow-xs'
              }`}
            >
              <div className="text-[11px] font-bold opacity-80">MEDIUM</div>
              <div className="text-xl font-bold font-display font-mono mt-0.5">{mediumCount}</div>
              <div className="text-[10px] opacity-60 font-mono">CVSS 4.0-6.9</div>
            </button>

            <button
              onClick={() => setSeverityFilter(severityFilter === 'LOW' ? 'ALL' : 'LOW')}
              className={`btn-popup p-3 rounded-xl border text-left transition-all backdrop-blur-md ${
                severityFilter === 'LOW'
                  ? 'bg-slate-100 border-slate-300 shadow-xs'
                  : 'bg-white/60 border-white/80 hover:border-white shadow-xs'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-600">LOW</div>
              <div className="text-xl font-bold font-display text-slate-900 font-mono mt-0.5">{lowCount}</div>
              <div className="text-[10px] text-slate-400 font-mono">CVSS &lt; 4.0</div>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Filter and Scanner Tabs */}
      <GlassCard className="p-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scanner Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-600 font-bold mr-1 text-xs">Scanners:</span>
            <div className="flex items-center gap-1 bg-white/40 p-1 rounded-full border border-white/60 backdrop-blur-xl">
              {scanners.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScanner(sc)}
                  className={`btn-apple-glass px-3 py-1 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                    selectedScanner === sc
                      ? 'btn-glass-primary font-bold shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60 font-semibold border border-transparent'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CVE, package, or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/85 border border-white text-xs text-slate-800 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 w-full md:w-64 placeholder:text-slate-400 shadow-xs"
            />
          </div>
        </div>
      </GlassCard>

      {/* Vulnerabilities List */}
      <div className="space-y-3.5">
        {filteredVulns.map((vuln) => {
          const isResolved = vuln.status === 'RESOLVED';
          const isCritical = vuln.severity === 'CRITICAL';
          const isHigh = vuln.severity === 'HIGH';

          return (
            <GlassCard
              key={vuln.id}
              className={`p-5 transition-all ${isResolved ? 'opacity-60' : ''}`}
              glow={isCritical ? 'rose' : isHigh ? 'amber' : undefined}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-700 border-rose-500/25 shadow-xs'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/25 shadow-xs'
                          : 'bg-slate-900 text-white border-slate-800 shadow-xs'
                      }`}
                    >
                      {vuln.severity}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-900 bg-white/70 px-2.5 py-0.5 rounded-lg border border-white/90 shadow-xs">
                      {vuln.cveId}
                    </span>

                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg border border-slate-200/80 text-slate-600 bg-slate-50/60 font-medium">
                      {vuln.scanner}
                    </span>

                    <span className="text-xs text-slate-500 font-mono">
                      CVSS: <strong className="text-slate-900 font-bold">{vuln.cvssScore}</strong>
                    </span>

                    {isResolved && (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 shadow-xs">
                        ✓ Resolved
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    {vuln.description}
                  </p>

                  <div className="text-xs text-slate-500 flex items-center gap-4 flex-wrap font-mono">
                    <div>
                      Package: <strong className="text-slate-800 font-bold">{vuln.package}</strong> ({vuln.installedVersion})
                    </div>
                    {vuln.fixedVersion && (
                      <div className="text-emerald-700 font-bold">
                        Fixed in: {vuln.fixedVersion}
                      </div>
                    )}
                    {vuln.filePath && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <FileCode className="w-3.5 h-3.5 text-slate-700" />
                        {vuln.filePath}{vuln.lineNumber ? `:${vuln.lineNumber}` : ''}
                      </div>
                    )}
                  </div>

                  {/* AI Remediation Recommendation */}
                  {vuln.aiMitigation && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white/65 border border-white/90 text-xs shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                        Automated Remediation Advisory:
                      </div>
                      <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                        {vuln.aiMitigation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col items-center gap-2">
                  {!isResolved && (
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => onResolveVuln(vuln.id)}
                    >
                      Mark Resolved
                    </GlassButton>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
