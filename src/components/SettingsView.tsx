import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Shield,
  Sliders,
  Bell,
  KeyRound,
  Database,
  Webhook
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

const healOpsLogo = '/healops_logo.jpg';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [allowLowRiskAuto, setAllowLowRiskAuto] = useState(true);
  const [requireProdApproval, setRequireProdApproval] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [maxRetries, setMaxRetries] = useState(3);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXXX');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900">
          Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
          Configure interface appearance, autonomous self-healing guardrails, and notification integrations
        </p>
      </div>

      {/* Brand & Platform Architecture Overview */}
      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/90 bg-white/80 p-1 flex items-center justify-center shrink-0 shadow-xs backdrop-blur-md">
              <img
                src={healOpsLogo}
                alt="HealOps Logo"
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-slate-900">HealOps Enterprise</h2>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-white/70 text-slate-800 border border-white/90 shadow-xs">
                  v2.14.0
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Autonomous DevSecOps &bull; Kubernetes Zero-Downtime Engine &bull; Gemini Diagnostic Core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Theme & Display Mode */}
      <GlassCard className="p-5 space-y-4">
        <div className="border-b border-slate-200/60 pb-3">
          <h3 className="text-sm font-bold font-display text-slate-900">Interface Appearance</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select preferred enterprise visual theme mode
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onThemeChange('light')}
            className={`btn-popup p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 shadow-xs ${
              currentTheme === 'light'
                ? 'bg-blue-600/15 border-blue-400/40 shadow-sm ring-1 ring-blue-400/30'
                : 'bg-white/60 border-white/90 hover:bg-white/80'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white/80 text-blue-600 border border-white/90 shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Light Glass</span>
                {currentTheme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                iPhone translucent white glass style
              </p>
            </div>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`btn-popup p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 shadow-xs ${
              currentTheme === 'dark'
                ? 'bg-blue-600/15 border-blue-400/40 shadow-sm ring-1 ring-blue-400/30'
                : 'bg-white/60 border-white/90 hover:bg-white/80'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white/80 text-slate-700 border border-white/90 shadow-xs">
              <Moon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Dark Mode</span>
                {currentTheme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                Deep neutral zinc palette for low-light
              </p>
            </div>
          </button>

          <button
            onClick={() => onThemeChange('system')}
            className={`btn-popup p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 shadow-xs ${
              currentTheme === 'system'
                ? 'bg-blue-600/15 border-blue-400/40 shadow-sm ring-1 ring-blue-400/30'
                : 'bg-white/60 border-white/90 hover:bg-white/80'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white/80 text-slate-700 border border-white/90 shadow-xs">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>System Sync</span>
                {currentTheme === 'system' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                Sync with OS color preference
              </p>
            </div>
          </button>
        </div>
      </GlassCard>

      {/* Autonomous Guardrails & Safety Policies */}
      <GlassCard className="p-5 space-y-4">
        <div className="border-b border-slate-200/60 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900">Self-Healing Safety Policies</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure autonomous action thresholds and required human approval gates
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
            <div>
              <div className="font-bold text-slate-900">
                Auto-Execute Low &amp; Medium Risk Remediations
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                Automatically restart pods and scale replica sets upon anomaly confirmation
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowLowRiskAuto}
              onChange={(e) => setAllowLowRiskAuto(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
            <div>
              <div className="font-bold text-slate-900">
                Require Human Gate for Production Rollbacks
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                Pause automated rollback to ensure an on-call engineer signs off on traffic diversion
              </div>
            </div>
            <input
              type="checkbox"
              checked={requireProdApproval}
              onChange={(e) => setRequireProdApproval(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
              <label className="text-[11px] font-bold text-slate-800 block mb-1">
                Anti-Flapping Cooldown Window
              </label>
              <select
                value={cooldownSeconds}
                onChange={(e) => setCooldownSeconds(Number(e.target.value))}
                className="w-full bg-white/80 border border-white/90 text-slate-900 rounded-xl p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-xs"
              >
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds (Recommended)</option>
                <option value={120}>120 Seconds</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
              <label className="text-[11px] font-bold text-slate-800 block mb-1">
                Max Autonomous Retries
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full bg-white/80 border border-white/90 text-slate-900 rounded-xl p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-xs"
              >
                <option value={1}>1 Attempt</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts (Default)</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Webhook & Incident Dispatch Integration */}
      <GlassCard className="p-5 space-y-4">
        <div className="border-b border-slate-200/60 pb-3 flex items-center gap-2">
          <Webhook className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900">Incident Webhook Dispatch</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send automated alerts to Slack, PagerDuty, or Microsoft Teams
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-800 mb-1">
              Outgoing Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-white/80 border border-white/90 rounded-xl p-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 font-mono">
              Events: incidents.created, selfhealing.executed, cve.critical
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleSaveSettings}
            >
              {isSaved ? 'Settings Saved' : 'Save Changes'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
