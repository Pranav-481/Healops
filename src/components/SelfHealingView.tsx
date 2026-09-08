import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Play,
  Flame,
  Activity,
  Check,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { HealingAction, HealingStep, Incident } from '../types';

interface SelfHealingViewProps {
  healingActions: HealingAction[];
  incidents: Incident[];
  onTriggerSimulatedHealing: () => void;
  isHealingActive: boolean;
}

export const SelfHealingView: React.FC<SelfHealingViewProps> = ({
  healingActions,
  incidents,
  onTriggerSimulatedHealing,
  isHealingActive,
}) => {
  const [currentAction] = useState<HealingAction | null>(
    healingActions.find((a) => a.status === 'EXECUTING') || healingActions[0] || null
  );

  const steps: Array<{ step: HealingStep; label: string; desc: string }> = [
    { step: 'DETECT', label: '1. Detect', desc: 'Prometheus metric anomaly & P99 alert' },
    { step: 'ANALYZE', label: '2. Analyze', desc: 'Gemini AI root-cause diagnostic' },
    { step: 'DECIDE', label: '3. Decide', desc: 'Guardrail & risk level evaluation' },
    { step: 'ACT', label: '4. Act', desc: 'Execute container / pod restart' },
    { step: 'VERIFY', label: '5. Verify', desc: 'Synthetic probes & latency check' },
    { step: 'RECOVER', label: '6. Recover', desc: 'Cluster marked healthy & audit logged' },
  ];

  const currentStep = currentAction?.currentStep || 'RECOVER';
  const currentStepIndex = steps.findIndex((s) => s.step === currentStep);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-slate-900" />
            Autonomous Self-Healing Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Closed-loop automated detection, remediation &amp; verification with strict safety guardrails
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<Zap className="w-3.5 h-3.5" />}
          isLoading={isHealingActive}
          onClick={onTriggerSimulatedHealing}
        >
          {isHealingActive ? 'Executing Recovery...' : 'Simulate Auto-Healing Run'}
        </GlassButton>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4" glow="emerald">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Self-Healing Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-600 mt-1 font-mono">94.7%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">18 / 19 auto-recovered</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Time to Recover</span>
            <Clock className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 font-mono">38s</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-bold">&darr; 84% vs manual triage</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Automated Recoveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 font-mono">18</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">0 manual escalations</div>
        </GlassCard>

        <GlassCard className="p-4" glow="purple">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cooldown Guard</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-display text-purple-600 mt-1 font-mono">60s</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Anti-flapping throttle</div>
        </GlassCard>
      </div>

      {/* Interactive 6-Stage Recovery Visualizer */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display tracking-wide text-slate-900">
              Autonomous 6-Step Self-Healing Workflow
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">Closed-loop recovery orchestration sequence</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM VERIFIED HEALTHY
            </span>
          </div>
        </div>

        {/* The 6 Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {steps.map((st, idx) => {
            const isPassed = currentStepIndex > idx || currentAction?.status === 'SUCCESS';
            const isCurrent = currentStepIndex === idx && currentAction?.status === 'EXECUTING';

            return (
              <div
                key={st.step}
                className={`
                  btn-popup p-3.5 rounded-xl border flex flex-col justify-between transition-all backdrop-blur-md shadow-xs
                  ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-700 ring-2 ring-slate-900/20'
                      : isPassed
                      ? 'bg-white/80 border-white/95 text-slate-900'
                      : 'bg-white/40 border-white/60 opacity-60 text-slate-700'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold opacity-60">
                      0{idx + 1}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold font-display tracking-wide">{st.label}</h4>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug font-medium">{st.desc}</p>
                </div>

                <div className="mt-3 pt-1.5 border-t border-current/15 text-[10px] font-mono opacity-60 font-medium">
                  {isPassed ? 'Completed' : isCurrent ? 'Active...' : 'Standby'}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Safety Guardrails Configuration Panel */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200/60 pb-3">
          <Sliders className="w-4 h-4 text-slate-900" />
          <h3 className="text-sm font-bold font-display tracking-wide text-slate-900">Safety Guardrails &amp; Policy Whitelist</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/65 border border-white/90 space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center justify-between">
              <span>Automated Action Whitelist</span>
              <span className="text-[11px] text-emerald-700 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">Enforced</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-white/90 shadow-xs">
                <span className="font-medium text-slate-800">Restart Container / Pod</span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">LOW RISK &bull; Auto</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-white/90 shadow-xs">
                <span className="font-medium text-slate-800">Scale Replica Set</span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">MED RISK &bull; Auto</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-white/90 shadow-xs">
                <span className="font-medium text-slate-800">Rollback Kubernetes Deployment</span>
                <span className="text-amber-700 font-bold font-mono text-[11px]">HIGH RISK &bull; Human Gate</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 shadow-xs">
                <span className="font-medium text-rose-800">Drop Database / Delete Persistent Volumes</span>
                <span className="text-rose-700 font-bold font-mono text-[11px]">FORBIDDEN</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/65 border border-white/90 space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center justify-between">
              <span>Verification Service Engine</span>
              <span className="text-[11px] text-slate-900 font-bold font-mono bg-white px-2 py-0.5 rounded-md border border-white shadow-xs">Active</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Post-action synthetic verification continuously samples cluster health before marking incident resolved:
            </p>
            <div className="space-y-2 font-mono text-slate-700">
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span>&bull; Pod Readiness Probe:</span>
                <span className="text-emerald-700 font-bold">12/12 Pods Ready</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span>&bull; HTTP Synthetic Latency P99:</span>
                <span className="text-emerald-700 font-bold">&lt; 50ms verified</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span>&bull; Error Rate Threshold:</span>
                <span className="text-emerald-700 font-bold">&lt; 0.1% confirmed</span>
              </div>
              <div className="flex justify-between">
                <span>&bull; Max Retry Limit:</span>
                <span className="text-slate-800 font-bold">3 attempts then escalate</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
