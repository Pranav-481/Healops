import React from 'react';
import { FileCode2, ExternalLink, X, Check, Copy } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const endpoints = [
    { method: 'POST', path: '/api/auth/sync', desc: 'Sync authenticated user with RBAC profile' },
    { method: 'GET', path: '/api/projects', desc: 'Retrieve all managed DevSecOps projects' },
    { method: 'POST', path: '/api/projects', desc: 'Create new microservice or repository definition' },
    { method: 'GET', path: '/api/pipelines', desc: 'List active and historical CI/CD pipeline runs' },
    { method: 'POST', path: '/api/pipelines/:id/run', desc: 'Trigger execution of a 10-stage pipeline' },
    { method: 'POST', path: '/api/deployments/:id/rollback', desc: 'Trigger rolling rollback of deployment' },
    { method: 'GET', path: '/api/security/vulnerabilities', desc: 'List Trivy, Semgrep & Gitleaks CVEs' },
    { method: 'POST', path: '/api/security/scan', desc: 'Execute container and code security scan' },
    { method: 'GET', path: '/api/monitoring/metrics', desc: 'Fetch Prometheus time-series metrics' },
    { method: 'GET', path: '/api/incidents', desc: 'List active and resolved production incidents' },
    { method: 'POST', path: '/api/incidents/simulate', desc: 'Simulate end-to-end incident & self-healing' },
    { method: 'POST', path: '/api/self-healing/execute', desc: 'Execute 6-stage self-healing recovery' },
    { method: 'POST', path: '/api/ai/analyze-incident', desc: 'Run Gemini AI Root Cause Analysis' },
    { method: 'POST', path: '/api/ai/chat', desc: 'DevSecOps copilot assistant' },
    { method: 'GET', path: '/api/events', desc: 'Server-Sent Events (SSE) real-time streaming' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
      <GlassCard className="max-w-3xl w-full p-6 max-h-[85vh] flex flex-col justify-between shadow-2xl border-white/90 bg-white/85" glow="blue">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-400/25 flex items-center justify-center shadow-xs">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  HealOps Platform API Reference
                </h2>
                <p className="text-xs text-slate-500 font-mono">OpenAPI 3.0.3 REST Specification</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api-docs"
                target="_blank"
                rel="noreferrer"
                className="btn-popup px-3 py-1.5 rounded-xl text-xs font-bold border border-white/95 border-t-white bg-gradient-to-b from-white/95 via-white/80 to-white/85 text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,1)] backdrop-blur-xl cursor-pointer"
              >
                <span>Swagger UI</span>
                <ExternalLink className="w-3 h-3 text-indigo-600" />
              </a>
              <button
                onClick={onClose}
                className="btn-popup p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-white/90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3.5 overflow-y-auto max-h-[55vh] pr-1 space-y-2 font-mono text-xs no-scrollbar">
            {endpoints.map((ep, idx) => {
              const isPost = ep.method === 'POST';
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-white/80 bg-white/65 hover:bg-white/90 flex items-center justify-between gap-3 text-xs shadow-xs transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        isPost
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25'
                          : 'bg-blue-500/10 text-blue-700 border border-blue-500/25'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-slate-800 font-semibold truncate">{ep.path}</span>
                  </div>
                  <span className="text-slate-600 text-[11px] font-sans truncate text-right">
                    {ep.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-sans mt-3">
          <span>Raw spec available at <code className="text-blue-600 font-mono font-semibold">/api-docs/json</code></span>
          <GlassButton variant="secondary" size="sm" onClick={onClose}>
            Close
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
