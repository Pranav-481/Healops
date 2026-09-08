import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  Lock, 
  Laptop, 
  Bell, 
  GitBranch,
  RefreshCw,
  Plus
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [patList, setPatList] = useState([
    { id: 'pat-1', name: 'CLI CI/CD token', prefix: 'hl_pat_9a4f...', created: '2026-08-12', expires: '90 days' },
    { id: 'pat-2', name: 'Terraform Provider Sync', prefix: 'hl_pat_7b2c...', created: '2026-07-01', expires: '30 days' },
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
          <User className="w-5 h-5 text-blue-600" />
          User Profile &amp; Developer Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
          Identity credentials, active SSO sessions, and Personal Access Tokens (PATs)
        </p>
      </div>

      {/* User Information Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Alex Vance"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/90 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold font-display text-slate-900">Alex Vance</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/25 shadow-xs">
                  ADMIN / LEAD DEVOPS
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                alex.vance@devsecops.local
              </p>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Organization: Enterprise DevSecOps Fleet (ID: org-89120)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="outline"
              size="sm"
              onClick={() => alert('Profile edited successfully')}
            >
              Edit Profile
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Personal Access Tokens (PAT) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              Personal Access Tokens (CLI &amp; SDK)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scoped API credentials for the HealOps CLI, kubectl plugins, and automated Terraform workflows
            </p>
          </div>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              const newToken = {
                id: `pat-${Date.now()}`,
                name: 'New DevSecOps Key',
                prefix: `hl_pat_${Math.random().toString(36).substring(2, 8)}...`,
                created: 'Just now',
                expires: '90 days'
              };
              setPatList([newToken, ...patList]);
            }}
          >
            Generate Token
          </GlassButton>
        </div>

        <div className="divide-y divide-slate-200/40 border border-white/80 rounded-2xl bg-white/50 backdrop-blur-md overflow-hidden shadow-xs">
          {patList.map((pat) => (
            <div key={pat.id} className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-white/60 transition-colors">
              <div>
                <div className="font-bold text-slate-900">{pat.name}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                  {pat.prefix} &bull; Created {pat.created} &bull; Expires in {pat.expires}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(pat.prefix, pat.id)}
                  className="btn-popup p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5"
                  title="Copy token"
                >
                  {copiedKey === pat.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setPatList(patList.filter((p) => p.id !== pat.id))}
                  className="text-[11px] font-bold text-rose-600 hover:underline px-2 py-1 rounded-lg hover:bg-rose-50/50"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security & Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5 space-y-3" glow="emerald">
          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Zero-Trust Authentication
          </h3>
          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
              <span>Hardware MFA (FIDO2/WebAuthn)</span>
              <span className="font-bold text-emerald-700">Enforced</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
              <span>Identity Provider (OIDC)</span>
              <span className="font-mono text-slate-800">Google Workspace SSO</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span>SSH Key Signing</span>
              <span className="font-mono font-bold text-emerald-700">Verified (ed25519)</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-3" glow="blue">
          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600" />
            Active Session Devices
          </h3>
          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/40">
              <div>
                <div className="font-bold text-slate-900">macOS / Chrome 128</div>
                <div className="text-[10px] text-slate-500 font-mono">us-east (Current session)</div>
              </div>
              <span className="text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">Active Now</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <div>
                <div className="font-bold text-slate-900">Linux / HealOps CLI</div>
                <div className="text-[10px] text-slate-500 font-mono">AWS EC2 worker pool</div>
              </div>
              <span className="text-slate-500 text-[11px] font-mono">2h ago</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
