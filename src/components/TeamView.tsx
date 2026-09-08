import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Mail, 
  CheckCircle2, 
  MoreVertical,
  KeyRound,
  Shield
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/25 shadow-xs">
            Admin
          </span>
        );
      case 'SECURITY_ENGINEER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/25 shadow-xs">
            Security Eng
          </span>
        );
      case 'DEVOPS_ENGINEER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 border border-blue-500/25 shadow-xs">
            DevOps Eng
          </span>
        );
      case 'DEVELOPER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 shadow-xs">
            Developer
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600" />
            Team &amp; Access Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            Role-Based Access Control (RBAC), engineering organization directory &amp; privilege auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => alert('Invite Dialog: Add team member by enterprise email and assign RBAC role')}
          >
            Invite Member
          </GlassButton>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Engineers</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 font-mono">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">100% active SSO</div>
        </GlassCard>

        <GlassCard className="p-4" glow="purple">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Admins &amp; Leads</div>
          <div className="text-2xl font-bold font-display text-purple-600 mt-1 font-mono">1</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Full cluster root</div>
        </GlassCard>

        <GlassCard className="p-4" glow="blue">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">SecOps &amp; DevOps</div>
          <div className="text-2xl font-bold font-display text-blue-600 mt-1 font-mono">2</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Pipeline &amp; deploy rights</div>
        </GlassCard>

        <GlassCard className="p-4" glow="emerald">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Sessions</div>
          <div className="text-2xl font-bold font-display text-emerald-600 mt-1 font-mono">4</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">MFA verified</div>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white/75 border border-white/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 font-medium shadow-xs"
          />
        </div>

        <div className="flex items-center bg-white/70 border border-white/90 rounded-xl p-1 text-xs backdrop-blur-md shadow-xs">
          {['ALL', 'ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER', 'DEVELOPER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`btn-popup px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                roleFilter === r
                  ? 'bg-blue-600/15 text-blue-700 border border-blue-400/40 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 border border-transparent'
              }`}
            >
              {r === 'ALL' ? 'All' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-white/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/90 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {user.lastActive}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Manage permissions and API credentials for ${user.name}`)}
                      className="btn-popup p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* RBAC Matrix Guide */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold font-display tracking-wide text-slate-900 flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600" />
          Enterprise RBAC Permissions Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
            <div className="font-bold text-slate-900">Administrator</div>
            <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
              Full cluster management, automated self-healing approval overrides, team invitation, and secret rotation.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
            <div className="font-bold text-slate-900">DevOps &amp; SecOps Engineers</div>
            <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
              Deployments, rollbacks, triggering 10-stage pipelines, vulnerability triage, and Prometheus alerting.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/65 border border-white/90 shadow-xs">
            <div className="font-bold text-slate-900">Developers &amp; Viewers</div>
            <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
              Source inspection, read-only telemetry, staging builds, personal access token generation.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
