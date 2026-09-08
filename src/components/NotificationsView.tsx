import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  ShieldAlert, 
  GitCommit, 
  Zap, 
  Check, 
  Trash2,
  ExternalLink
} from 'lucide-react';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications: initialNotifications,
  onNavigateTab
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'INCIDENT' | 'PIPELINE' | 'SECURITY'>('ALL');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'CRITICAL') return n.severity === 'CRITICAL';
    if (filter === 'INCIDENT') return n.type === 'INCIDENT';
    if (filter === 'PIPELINE') return n.type === 'PIPELINE';
    if (filter === 'SECURITY') return n.type === 'SECURITY';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type'], severity: NotificationItem['severity']) => {
    if (type === 'INCIDENT' || severity === 'CRITICAL') {
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
    if (type === 'SECURITY') {
      return <ShieldAlert className="w-4 h-4 text-amber-600" />;
    }
    if (type === 'SELF_HEALING') {
      return <Zap className="w-4 h-4 text-emerald-600" />;
    }
    return <GitCommit className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/25 shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
            System alerts, pipeline failure warnings, CVE audits, and automated healing triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<CheckCheck className="w-3.5 h-3.5" />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </GlassButton>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2.5 overflow-x-auto no-scrollbar text-xs">
        {(['ALL', 'UNREAD', 'CRITICAL', 'INCIDENT', 'PIPELINE', 'SECURITY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`btn-popup px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap shadow-xs ${
              filter === tab
                ? 'bg-blue-600/15 text-blue-700 border border-blue-400/40 font-bold'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white border border-white/80'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold font-display text-slate-900">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You're all caught up! No notifications matching the current filter.
            </p>
          </GlassCard>
        ) : (
          filteredNotifications.map((notif) => (
            <GlassCard
              key={notif.id}
              className={`p-4 transition-all ${
                !notif.read ? 'border-blue-400/50 bg-white/85 shadow-sm' : ''
              }`}
              glow={!notif.read ? 'blue' : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs shrink-0 mt-0.5 backdrop-blur-md">
                    {getIcon(notif.type, notif.severity)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold font-display text-slate-900">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border border-slate-200/70 bg-white/70 text-slate-600 uppercase shadow-xs">
                        {notif.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {notif.message}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
                      <span>{notif.timestamp}</span>
                      {notif.relatedEntityId && (
                        <span>&bull; Ref: {notif.relatedEntityId}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {notif.type === 'INCIDENT' && onNavigateTab && (
                    <GlassButton
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('incidents')}
                    >
                      Investigate
                    </GlassButton>
                  )}
                  {notif.type === 'PIPELINE' && onNavigateTab && (
                    <GlassButton
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('pipelines')}
                    >
                      View Run
                    </GlassButton>
                  )}
                  {notif.type === 'SECURITY' && onNavigateTab && (
                    <GlassButton
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('security')}
                    >
                      Inspect CVE
                    </GlassButton>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="btn-popup p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-black/5"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="btn-popup p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-black/5"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
