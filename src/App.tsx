/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { PipelinesView } from './components/PipelinesView';
import { SecurityView } from './components/SecurityView';
import { DeploymentsView } from './components/DeploymentsView';
import { MonitoringView } from './components/MonitoringView';
import { IncidentsView } from './components/IncidentsView';
import { SelfHealingView } from './components/SelfHealingView';
import { LogsView } from './components/LogsView';
import { AuditLogsView } from './components/AuditLogsView';
import { AIAssistantView } from './components/AIAssistantView';
import { TeamView } from './components/TeamView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { ApiDocsModal } from './components/ApiDocsModal';
import {
  Project,
  Pipeline,
  Deployment,
  Vulnerability,
  Incident,
  ServiceHealth,
  LogEntry,
  MonitoringMetricPoint,
  HealingAction,
  NotificationItem
} from './types';
import {
  mockProjects,
  mockPipelines,
  mockDeployments,
  mockVulnerabilities,
  mockIncidents,
  initialServicesHealth,
  mockTerminalLogs,
  mockNotifications,
  generateMetricPoints
} from './data/mockData';
import { CheckCircle2, Zap, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // Theme initialization for iPhone translucent frosted white glass
  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = 'light';
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Core State
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(mockVulnerabilities);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [servicesHealth, setServicesHealth] = useState<ServiceHealth[]>(initialServicesHealth);
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>(mockTerminalLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [metrics, setMetrics] = useState<MonitoringMetricPoint[]>(generateMetricPoints(24));

  // Action states
  const [isSimulatingIncident, setIsSimulatingIncident] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [isHealingExecuting, setIsHealingExecuting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'heal' } | null>(null);

  // Initial fetch from backend server
  useEffect(() => {
    async function loadData() {
      try {
        await ensureFirebaseAuth();

        const projectSnapshot = await getDocs(
          collection(db, 'projects')
        );

        const firestoreProjects = projectSnapshot.docs.map(
          (docSnap) => docSnap.data() as Project
        );

        if (firestoreProjects.length > 0) {
          setProjects(firestoreProjects);
        }

        const [pipeRes, depRes, vulnRes, incRes, healthRes] = await Promise.all([
          fetch('/api/pipelines').then((r) => r.json()).catch(() => null),
          fetch('/api/deployments').then((r) => r.json()).catch(() => null),
          fetch('/api/security/vulnerabilities').then((r) => r.json()).catch(() => null),
          fetch('/api/incidents').then((r) => r.json()).catch(() => null),
          fetch('/api/monitoring/health').then((r) => r.json()).catch(() => null),
        ]);

        if (pipeRes?.data) setPipelines(pipeRes.data);
        if (depRes?.data) setDeployments(depRes.data);
        if (vulnRes?.data) setVulnerabilities(vulnRes.data);
        if (incRes?.data) setIncidents(incRes.data);
        if (healthRes?.data?.services) {
          setServicesHealth(healthRes.data.services);
        }

      } catch (err) {
        console.warn('Firebase/backend load warning:', err);
      }
    }

    loadData();
  }, []);

  // Server-Sent Events (SSE) for Real-Time Telemetry & Progress Broadcasting
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('pipeline:started', (e: any) => {
        const pipeline: Pipeline = JSON.parse(e.data).payload;
        setPipelines((prev) => [pipeline, ...prev.filter((p) => p.id !== pipeline.id)]);
      });

      eventSource.addEventListener('pipeline:stage', (e: any) => {
        const { pipeline, log } = JSON.parse(e.data).payload;
        setPipelines((prev) => [pipeline, ...prev.filter((p) => p.id !== pipeline.id)]);
        setTerminalLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'INFO',
            service: pipeline.projectName,
            environment: 'Production',
            message: log
          }
        ]);
      });

      eventSource.addEventListener('pipeline:completed', (e: any) => {
        const pipeline: Pipeline = JSON.parse(e.data).payload;
        setPipelines((prev) => [pipeline, ...prev.filter((p) => p.id !== pipeline.id)]);
        setIsPipelineRunning(false);
      });

      eventSource.addEventListener('incident:created', (e: any) => {
        const incident: Incident = JSON.parse(e.data).payload;
        setIncidents((prev) => [incident, ...prev.filter((i) => i.id !== incident.id)]);
        showToast('CRITICAL Anomaly Detected', `${incident.service}: Latency spiked to ${incident.latencyMs}ms`, 'alert');
      });

      eventSource.addEventListener('monitoring:update', (e: any) => {
        const updatedServices: ServiceHealth[] = JSON.parse(e.data).payload;
        setServicesHealth(updatedServices);
      });

      eventSource.addEventListener('healing:step', (e: any) => {
        const { step, action } = JSON.parse(e.data).payload;
        setIncidents((prev) =>
          prev.map((inc) => ({
            ...inc,
            healingActions: inc.healingActions.map((a) => (a.id === action.id ? { ...action, currentStep: step } : a))
          }))
        );
      });

      eventSource.addEventListener('healing:completed', (e: any) => {
        const { action, incident } = JSON.parse(e.data).payload;
        setIncidents((prev) => [incident, ...prev.filter((i) => i.id !== incident.id)]);
        setIsHealingExecuting(false);
        showToast('Self-Healing Verified', `${action.actionType} completed. Cluster healthy.`, 'heal');
      });

      eventSource.addEventListener('project:created', (e: any) => {
        const project: Project = JSON.parse(e.data).payload;
        setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
      });
    } catch (err) {
      console.warn('SSE stream inactive, using direct event hooks:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' | 'heal') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Simulate Incident Workflow
  const handleSimulateIncident = async () => {
    setIsSimulatingIncident(true);
    try {
      const res = await fetch('/api/incidents/simulate', { method: 'POST' });
      const data = await res.json();
      if (data?.data) {
        setIncidents((prev) => [data.data, ...prev.filter((i) => i.id !== data.data.id)]);
        setActiveTab('incidents');
      }
    } catch (err) {
      console.error('Failed to simulate incident:', err);
    } finally {
      setIsSimulatingIncident(false);
    }
  };

  // 2. Trigger Pipeline Workflow
  const handleTriggerPipeline = async (
    failHealthCheck: boolean = false,
    customOptions?: { projectId?: string; projectName?: string; commitMessage?: string; branch?: string }
  ) => {
    setIsPipelineRunning(true);
    try {
      const res = await fetch('/api/pipelines/pipe-501/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failHealthCheck,
          projectId: customOptions?.projectId,
          projectName: customOptions?.projectName,
          commitMessage: customOptions?.commitMessage,
          branch: customOptions?.branch
        })
      });
      const data = await res.json();
      if (data?.data) {
        setPipelines((prev) => [data.data, ...prev.filter((p) => p.id !== data.data.id)]);
        showToast('CI/CD Pipeline Dispatched', `Build started for ${data.data.projectName}`, 'success');
      }
    } catch (err) {
      console.error('Pipeline run error:', err);
      setIsPipelineRunning(false);
    }
  };

  // 3. Rollback Deployment Workflow
  const handleRollbackDeployment = async (dep: Deployment) => {
    setIsRollingBack(true);
    try {
      const res = await fetch(`/api/deployments/${dep.id}/rollback`, { method: 'POST' });
      const data = await res.json();
      if (data?.data) {
        setDeployments((prev) => prev.map((d) => (d.id === dep.id ? data.data : d)));
        showToast('Deployment Rolled Back', `Traffic shifted to ${dep.rollbackVersion || 'v2.13.9'}`, 'heal');
      }
    } catch (err) {
      console.error('Rollback error:', err);
    } finally {
      setIsRollingBack(false);
    }
  };

  // 4. Execute Self-Healing Action Workflow
  const handleExecuteHealing = async (incident: Incident, action: HealingAction) => {
    setIsHealingExecuting(true);
    try {
      const res = await fetch('/api/self-healing/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id, actionId: action.id })
      });
      const data = await res.json();
      if (data?.data?.action) {
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === incident.id
              ? {
                ...inc,
                status: 'RESOLVED',
                healingActions: inc.healingActions.map((a) => (a.id === action.id ? data.data.action : a))
              }
              : inc
          )
        );
      }
    } catch (err) {
      console.error('Healing execution error:', err);
    } finally {
      setIsHealingExecuting(false);
    }
  };

  // 5. Trigger Security Scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await fetch('/api/security/scan', { method: 'POST' });
      showToast('Security Audit Completed', 'Scanned 412 packages across container layers.', 'success');
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // 6. Resolve Vulnerability
  const handleResolveVuln = async (id: string) => {
    try {
      await fetch(`/api/security/vulnerabilities/${id}/resolve`, { method: 'PUT' });
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'RESOLVED' } : v))
      );
      showToast('Vulnerability Resolved', 'CVE status updated in inventory', 'success');
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  // 7. Create Project Workflow
  const handleCreateProject = async (projectData: Partial<Project>) => {
    let repo = projectData.repository || '';

    if (!repo) {
      repo = `https://github.com/enterprise/${(projectData.name || 'service')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;
    } else if (
      !repo.startsWith('http://') &&
      !repo.startsWith('https://') &&
      !repo.startsWith('git@')
    ) {
      repo = `https://${repo}`;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'New Service',
      repository: repo,
      branch: projectData.branch || 'main',
      environment: projectData.environment || 'production',
      description:
        projectData.description ||
        `Managed microservice ${projectData.name || 'New Service'}`,
      healthScore: 100,
      securityScore: 0,
      status: 'HEALTHY',
      lastDeployment: 'Never',
      lastPipelineStatus: 'PENDING',
    };

    try {
      await ensureFirebaseAuth();

      await setDoc(
        doc(db, 'projects', newProject.id),
        newProject
      );

      setProjects((prev) => [
        newProject,
        ...prev.filter((p) => p.id !== newProject.id),
      ]);

      showToast(
        'Project Created',
        `${newProject.name} registered and stored in Firebase`,
        'success'
      );

    } catch (err: any) {
      console.error('Firebase project creation failed:', err);

      showToast(
        'Project Creation Failed',
        err?.message || 'Unable to save project to Firebase',
        'alert'
      );
    }
  };

  const unreadCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col font-sans selection:bg-slate-200/60 antialiased relative overflow-x-hidden">
      {/* Crystal Clear Translucent Ambient Light Refractions behind Glass Surfaces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] left-[10%] w-[850px] h-[850px] rounded-full bg-gradient-to-br from-indigo-200/40 via-sky-200/35 to-transparent blur-[140px] animate-glass-orb-1" />
        <div className="absolute top-[15%] right-[-8%] w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-purple-200/35 via-pink-100/30 to-transparent blur-[150px] animate-glass-orb-2" />
        <div className="absolute top-[48%] left-[-10%] w-[820px] h-[820px] rounded-full bg-gradient-to-tr from-sky-200/35 via-teal-100/30 to-transparent blur-[140px] animate-glass-orb-3" />
        <div className="absolute bottom-[2%] right-[5%] w-[780px] h-[780px] rounded-full bg-gradient-to-tl from-amber-200/30 via-rose-100/25 to-transparent blur-[150px] animate-glass-orb-1" />
        <div className="absolute bottom-[-15%] left-[20%] w-[750px] h-[750px] rounded-full bg-gradient-to-r from-blue-200/35 via-indigo-100/30 to-transparent blur-[140px] animate-glass-orb-2" />
        {/* Subtle crystalline glass grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_75%,transparent_100%)] opacity-50" />
      </div>

      {/* Top Navbar */}
      <div className="relative z-20">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotifications={unreadCount}
          onSimulateIncident={handleSimulateIncident}
          isSimulating={isSimulatingIncident}
          onOpenApiDocs={() => setIsApiDocsOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            pipelines={pipelines}
            incidents={incidents}
            servicesHealth={servicesHealth}
            onNavigateTab={setActiveTab}
            onOpenAIAnalysis={() => setActiveTab('incidents')}
            onCreateProject={handleCreateProject}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            onNavigateTab={setActiveTab}
            onCreateProject={handleCreateProject}
          />
        )}

        {activeTab === 'pipelines' && (
          <PipelinesView
            pipelines={pipelines}
            terminalLogs={terminalLogs}
            onTriggerPipeline={handleTriggerPipeline}
            isRunning={isPipelineRunning}
            projects={projects}
          />
        )}

        {activeTab === 'deployments' && (
          <DeploymentsView
            deployments={deployments}
            onRollback={handleRollbackDeployment}
            isRollingBack={isRollingBack}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            vulnerabilities={vulnerabilities}
            onTriggerScan={handleTriggerScan}
            onResolveVuln={handleResolveVuln}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringView
            servicesHealth={servicesHealth}
            metrics={metrics}
            onRefreshMetrics={() => setMetrics(generateMetricPoints(24))}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onExecuteHealing={handleExecuteHealing}
            isHealingExecuting={isHealingExecuting}
            onOpenAIAnalysis={() => setActiveTab('aiAssistant')}
          />
        )}

        {activeTab === 'selfHealing' && (
          <SelfHealingView
            healingActions={incidents.flatMap((i) => i.healingActions)}
            incidents={incidents}
            onTriggerSimulatedHealing={() => {
              const activeInc = incidents.find((i) => i.status !== 'RESOLVED') || incidents[0];
              if (activeInc && activeInc.healingActions.length > 0) {
                handleExecuteHealing(activeInc, activeInc.healingActions[0]);
              }
            }}
            isHealingActive={isHealingExecuting}
          />
        )}

        {activeTab === 'logs' && (
          <LogsView logs={terminalLogs} />
        )}

        {activeTab === 'audit' && (
          <AuditLogsView />
        )}

        {activeTab === 'aiAssistant' && (
          <AIAssistantView onCreateProject={handleCreateProject} />
        )}

        {activeTab === 'team' && (
          <TeamView />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        )}
      </main>

      {/* Floating Enterprise Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`
              btn-popup p-4 rounded-2xl border backdrop-blur-3xl shadow-xl flex items-center gap-3.5 max-w-sm sm:max-w-md bg-white/80 border-white/90 text-slate-800
              ${toastMessage.type === 'alert' ? 'border-l-4 border-l-rose-500 shadow-[0_12px_36px_rgba(244,63,94,0.18)]' : toastMessage.type === 'heal' ? 'border-l-4 border-l-emerald-500 shadow-[0_12px_36px_rgba(16,185,129,0.18)]' : 'border-l-4 border-l-blue-500 shadow-[0_12px_36px_rgba(59,130,246,0.18)]'}
            `}
          >
            {toastMessage.type === 'alert' && (
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />
            )}
            {toastMessage.type === 'heal' && (
              <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold tracking-wide text-slate-900 truncate">{toastMessage.title}</div>
              <div className="text-xs text-slate-600 truncate font-medium">{toastMessage.desc}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="btn-popup p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-black/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* API Documentation Modal */}
      <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />
    </div>
  );
}
