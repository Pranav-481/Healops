import React from 'react';
import { Flame, Sun, Moon, Laptop, Bell, FileCode2, Sparkles } from 'lucide-react';
import { GlassButton } from './GlassButton';

const healOpsLogo = '/healops_logo.jpg';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadNotifications: number;
  onSimulateIncident: () => void;
  isSimulating: boolean;
  onOpenApiDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifications,
  onSimulateIncident,
  isSimulating,
  onOpenApiDocs,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pipelines', label: 'Pipelines' },
    { id: 'security', label: 'Security Center' },
    { id: 'deployments', label: 'Deployments' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'selfHealing', label: 'Self-Healing' },
    { id: 'aiAssistant', label: 'AI Assistant' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-3xl bg-white/75 border-b border-white/90 px-4 lg:px-8 py-3.5 shadow-[0_8px_30px_0_rgba(15,23,42,0.03),inset_0_1.5px_0_rgba(255,255,255,1)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Brand & Live Pulse */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-popup flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            title="HealOps Dashboard"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/95 shadow-xs bg-white/90 p-1 flex items-center justify-center transition-all duration-200 group-hover:border-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] backdrop-blur-md">
                <img
                  src={healOpsLogo}
                  alt="HealOps Logo"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wide text-slate-900 text-xl sm:text-2xl">
                  Heal<span className="text-indigo-600 font-black">Ops</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium tracking-wide">
                Self-Healing CI/CD &amp; DevSecOps Platform
              </p>
            </div>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Cluster Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/70 shadow-xs backdrop-blur-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-emerald-800">Cluster 100% Online</span>
          </div>

          {/* Simulate Incident Button with spring popup */}
          <GlassButton
            variant="danger"
            size="sm"
            icon={<Flame className="w-4 h-4 text-amber-200" />}
            isLoading={isSimulating}
            onClick={onSimulateIncident}
            title="Trigger end-to-end incident, AI root-cause diagnostic & self-healing demo"
          >
            {isSimulating ? 'Simulating...' : 'Simulate Incident'}
          </GlassButton>

          {/* API Docs Button */}
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<FileCode2 className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={onOpenApiDocs}
          >
            API Docs
          </GlassButton>

          {/* Notifications Bell (iOS 18 Control Center Circular Glass Button) */}
          <div className="relative inline-flex items-center justify-center">
            <button
              onClick={() => setActiveTab('incidents')}
              className="btn-apple-glass w-9 h-9 rounded-full bg-gradient-to-b from-white/95 via-white/75 to-white/85 hover:from-white hover:to-white/95 border border-white/80 border-t-white border-b-white/40 text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-[0_6px_20px_-2px_rgba(15,23,42,0.08),inset_0_1.5px_1px_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.7)] backdrop-blur-[36px] flex items-center justify-center relative overflow-hidden"
              title="View active alerts and incidents"
            >
              {/* iOS 18 3D Glass Dome Convex Curved Specular Highlight */}
              <span className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/50 via-white/15 to-transparent rounded-t-full pointer-events-none" />
              {/* iOS 18 Edge Light Chamfer Rim */}
              <span className="absolute inset-x-1.5 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-95" />
              <Bell className="w-4 h-4 relative z-10" />
            </button>
            {unreadNotifications > 0 && (
              <span
                onClick={() => setActiveTab('incidents')}
                className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-gradient-to-b from-[#ff3b30] to-[#e02620] text-[11px] font-broad font-black tracking-wider text-white flex items-center justify-center border-2 border-white shadow-[0_2px_8px_rgba(235,35,35,0.7)] pointer-events-auto cursor-pointer z-30 animate-pulse"
              >
                {unreadNotifications}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs - iOS 18 Glass Segmented Dock */}
      <div className="max-w-7xl mx-auto mt-3.5 overflow-x-auto no-scrollbar">
        <nav className="flex items-center space-x-1.5 p-1 rounded-full bg-white/45 border border-white/70 shadow-[0_4px_16px_rgba(15,23,42,0.03),inset_0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-2xl w-fit">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  btn-apple-glass
                  px-4 py-1.5 rounded-full text-xs sm:text-sm font-broad tracking-wide whitespace-nowrap
                  cursor-pointer select-none relative overflow-hidden group
                  ${
                    isActive
                      ? 'bg-gradient-to-b from-[#1b84ff] via-[#0066f5] to-[#0052d4] text-white border border-white/40 border-t-white/95 border-b-blue-900/50 shadow-[0_6px_20px_-2px_rgba(0,102,245,0.4),inset_0_1.5px_1.5px_#ffffff,inset_0_0_0_1px_rgba(255,255,255,0.25)] font-bold backdrop-blur-[36px]'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white/65 border border-transparent hover:border-white/60 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] font-semibold'
                  }
                `}
              >
                {/* Specular top highlight */}
                {isActive && (
                  <>
                    <span className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-t-full pointer-events-none" />
                    <span className="absolute inset-x-1.5 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-95" />
                  </>
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
