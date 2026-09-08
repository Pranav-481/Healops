import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  mockProjects,
  mockPipelines,
  mockDeployments,
  mockVulnerabilities,
  mockIncidents,
  mockNotifications,
  mockAuditLogs,
  mockTerminalLogs,
  initialServicesHealth,
  mockUsers,
  generateMetricPoints
} from './src/data/mockData';
import {
  Project,
  Pipeline,
  Deployment,
  Vulnerability,
  Incident,
  HealingAction,
  NotificationItem,
  AuditLog,
  LogEntry,
  ServiceHealth
} from './src/types';
import { AIService } from './backend/src/ai/ai.service';
import { SelfHealingEngine } from './backend/src/selfHealing/healing.engine';
import { PipelineEngine } from './backend/src/pipeline/pipeline.engine';
import { openApiSpec, renderSwaggerHtml } from './backend/src/docs/openapi';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory runtime state
  let projects: Project[] = [...mockProjects];
  let pipelines: Pipeline[] = [...mockPipelines];
  let deployments: Deployment[] = [...mockDeployments];
  let vulnerabilities: Vulnerability[] = [...mockVulnerabilities];
  let incidents: Incident[] = [...mockIncidents];
  let notifications: NotificationItem[] = [...mockNotifications];
  let auditLogs: AuditLog[] = [...mockAuditLogs];
  let terminalLogs: LogEntry[] = [...mockTerminalLogs];
  let servicesHealth: ServiceHealth[] = [...initialServicesHealth];
  let users = [...mockUsers];

  const aiService = new AIService();
  const healingEngine = new SelfHealingEngine();
  const pipelineEngine = new PipelineEngine();

  // Connected SSE clients for real-time push
  const sseClients: Response[] = [];

  function broadcastEvent(eventName: string, payload: any) {
    const data = JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() });
    for (const client of sseClients) {
      client.write(`event: ${eventName}\ndata: ${data}\n\n`);
    }
  }

  // SSE endpoint for live updates
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ event: 'connected', message: 'Connected to DevSecOps Real-Time Engine' })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // API Documentation
  app.get('/api-docs', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderSwaggerHtml());
  });

  app.get('/api-docs/json', (req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  // AUTH ROUTES
  app.post('/api/auth/sync', (req: Request, res: Response) => {
    const { email, name, role } = req.body;
    const user = {
      id: `usr-${Date.now()}`,
      name: name || 'DevSecOps Engineer',
      email: email || 'engineer@devsecops.local',
      role: role || 'DEVOPS_ENGINEER',
      status: 'ACTIVE' as const,
      lastActive: 'Just now'
    };
    res.json({ success: true, message: 'User synced successfully', data: user });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({ success: true, data: users[0] });
  });

  // PROJECTS ROUTES
  app.get('/api/projects', (req: Request, res: Response) => {
    res.json({ success: true, data: projects });
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: req.body.name || 'New Microservice',
      repository: req.body.repository || 'github.com/enterprise/new-service',
      branch: req.body.branch || 'main',
      healthScore: 100,
      securityScore: 95,
      status: 'HEALTHY',
      lastDeployment: 'Never',
      lastPipelineStatus: 'PENDING',
      description: req.body.description || 'Newly created microservice project',
      environment: req.body.environment || 'development'
    };
    projects.unshift(newProject);
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user: 'admin@devsecops.local',
      action: 'PROJECT_CREATED',
      resource: newProject.name,
      resourceId: newProject.id,
      timestamp: 'Just now',
      result: 'SUCCESS'
    });
    broadcastEvent('project:created', newProject);
    res.status(201).json({ success: true, data: newProject });
  });

  app.get('/api/projects/:id', (req: Request, res: Response) => {
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  });

  // PIPELINES ROUTES
  app.get('/api/pipelines', (req: Request, res: Response) => {
    res.json({ success: true, data: pipelines });
  });

  app.get('/api/pipelines/:id', (req: Request, res: Response) => {
    const pipeline = pipelines.find((p) => p.id === req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
    res.json({ success: true, data: pipeline });
  });

  app.post('/api/pipelines/:id/run', async (req: Request, res: Response) => {
    const existing = pipelines.find((p) => p.id === req.params.id);
    const targetProject = existing ? projects.find((p) => p.id === existing.projectId) : projects[0];

    const newPipeline: Pipeline = {
      id: `pipe-${Date.now()}`,
      projectId: targetProject?.id || 'proj-1',
      projectName: targetProject?.name || 'Payment Service',
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: req.body.commitMessage || 'feat: autonomous pipeline trigger via API',
      author: req.body.author || 'DevOps Engineer',
      branch: targetProject?.branch || 'main',
      status: 'PENDING',
      startedAt: 'Just now',
      durationSeconds: 0,
      stages: pipelineEngine.createDefaultStages()
    };

    pipelines.unshift(newPipeline);
    broadcastEvent('pipeline:started', newPipeline);

    // Respond immediately, continue execution in background
    res.json({ success: true, message: 'Pipeline started successfully', data: newPipeline });

    const shouldFail = req.body.failHealthCheck === true;
    pipelineEngine.executePipeline(newPipeline, shouldFail, (updatedPipeline, logLine) => {
      terminalLogs.push({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: updatedPipeline.status === 'FAILED' ? 'ERROR' : 'INFO',
        service: updatedPipeline.projectName,
        environment: 'Production',
        message: logLine
      });
      broadcastEvent('pipeline:stage', { pipeline: updatedPipeline, log: logLine });
    }).then((finishedPipeline) => {
      if (targetProject) {
        targetProject.lastPipelineStatus = finishedPipeline.status;
      }
      broadcastEvent('pipeline:completed', finishedPipeline);
    });
  });

  app.post('/api/pipelines/:id/cancel', (req: Request, res: Response) => {
    const cancelled = pipelineEngine.cancelPipeline(req.params.id);
    const pipeline = pipelines.find((p) => p.id === req.params.id);
    if (pipeline) pipeline.status = 'CANCELLED';
    broadcastEvent('pipeline:cancelled', { id: req.params.id });
    res.json({ success: true, message: cancelled ? 'Pipeline cancelled' : 'Pipeline was not running' });
  });

  // DEPLOYMENTS ROUTES
  app.get('/api/deployments', (req: Request, res: Response) => {
    res.json({ success: true, data: deployments });
  });

  app.post('/api/deployments/:id/rollback', async (req: Request, res: Response) => {
    const deployment = deployments.find((d) => d.id === req.params.id);
    if (!deployment) return res.status(404).json({ success: false, message: 'Deployment not found' });

    deployment.status = 'ROLLED_BACK';
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user: 'devops@enterprise.local',
      action: 'DEPLOYMENT_ROLLED_BACK',
      resource: deployment.projectName,
      resourceId: deployment.id,
      timestamp: 'Just now',
      result: 'SUCCESS',
      details: `Rolled back to ${deployment.rollbackVersion || 'previous stable release'}`
    });

    // Update service health back to healthy
    const service = servicesHealth.find((s) => s.name === deployment.projectName);
    if (service) {
      service.status = 'HEALTHY';
      service.errorRate = 0.02;
      service.latencyMs = 32;
    }

    broadcastEvent('deployment:rollback', deployment);
    broadcastEvent('monitoring:update', servicesHealth);

    res.json({
      success: true,
      message: `Deployment ${deployment.id} rolled back to ${deployment.rollbackVersion || 'v2.13.9'}`,
      data: deployment
    });
  });

  // SECURITY ROUTES
  app.get('/api/security/vulnerabilities', (req: Request, res: Response) => {
    res.json({ success: true, data: vulnerabilities });
  });

  app.post('/api/security/scan', (req: Request, res: Response) => {
    const scanId = `scan-${Date.now()}`;
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Security Scan Completed',
      message: 'Scanned 412 packages across container layers. 0 new critical CVEs.',
      type: 'SECURITY',
      severity: 'INFO',
      read: false,
      timestamp: 'Just now'
    });
    res.json({
      success: true,
      message: 'Comprehensive Trivy, Semgrep, and Gitleaks scan completed',
      data: {
        scanId,
        securityScore: 87,
        findingsCount: vulnerabilities.length
      }
    });
  });

  app.put('/api/security/vulnerabilities/:id/resolve', (req: Request, res: Response) => {
    const vuln = vulnerabilities.find((v) => v.id === req.params.id);
    if (vuln) {
      vuln.status = 'RESOLVED';
      broadcastEvent('security:updated', vuln);
      return res.json({ success: true, message: `Vulnerability ${vuln.cveId} marked as resolved`, data: vuln });
    }
    res.status(404).json({ success: false, message: 'Vulnerability not found' });
  });

  // MONITORING ROUTES
  app.get('/api/monitoring/metrics', (req: Request, res: Response) => {
    const hours = parseInt(req.query.hours as string) || 24;
    res.json({ success: true, data: generateMetricPoints(hours) });
  });

  app.get('/api/monitoring/health', (req: Request, res: Response) => {
    const healthyCount = servicesHealth.filter((s) => s.status === 'HEALTHY').length;
    const overallScore = Math.round((healthyCount / servicesHealth.length) * 100);
    res.json({
      success: true,
      data: {
        systemScore: overallScore,
        status: overallScore > 80 ? 'HEALTHY' : 'DEGRADED',
        services: servicesHealth
      }
    });
  });

  // INCIDENT ROUTES & SIMULATE INCIDENT WORKFLOW
  app.get('/api/incidents', (req: Request, res: Response) => {
    res.json({ success: true, data: incidents });
  });

  // ONE-CLICK INCIDENT SIMULATION (Section 50 & 68)
  app.post('/api/incidents/simulate', async (req: Request, res: Response) => {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: 'Payment API error rate spiked to 18.4% post-deployment v2.14.0',
      severity: 'CRITICAL',
      service: 'Payment Service',
      environment: 'Production',
      status: 'INVESTIGATING',
      detectedTime: 'Just now',
      assignedEngineer: 'Marcus Chen',
      description: 'Prometheus alert: HTTP 500 error rate exceeded 5% critical threshold. Database connection pool starved.',
      errorRate: 18.4,
      latencyMs: 342,
      healingActions: [
        {
          id: `heal-${Date.now()}-1`,
          incidentId: `inc-${Date.now()}`,
          actionType: 'RESTART_POD',
          description: 'Restart Kubernetes payment pods to flush leaked connection sockets',
          riskLevel: 'LOW',
          requiresApproval: false,
          status: 'PENDING',
          currentStep: 'DETECT',
          verifiedHealthy: false,
          auditMessage: 'Awaiting container restart sequence'
        },
        {
          id: `heal-${Date.now()}-2`,
          incidentId: `inc-${Date.now()}`,
          actionType: 'ROLLBACK_DEPLOYMENT',
          description: 'Rollback production cluster from v2.14.0 to stable release v2.13.9',
          riskLevel: 'HIGH',
          requiresApproval: true,
          status: 'PENDING',
          currentStep: 'DETECT',
          verifiedHealthy: false,
          auditMessage: 'Requires human engineer confirmation for production rollback'
        }
      ]
    };

    // Degrade service health
    const paymentSvc = servicesHealth.find((s) => s.name === 'Payment Service');
    if (paymentSvc) {
      paymentSvc.status = 'DEGRADED';
      paymentSvc.errorRate = 18.4;
      paymentSvc.latencyMs = 342;
    }

    incidents.unshift(newIncident);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'CRITICAL Incident Triggered',
      message: newIncident.title,
      type: 'INCIDENT',
      severity: 'CRITICAL',
      read: false,
      timestamp: 'Just now',
      relatedEntityId: newIncident.id
    });

    broadcastEvent('incident:created', newIncident);
    broadcastEvent('monitoring:update', servicesHealth);

    // AI Root Cause Analysis automatically kicks off
    const aiAnalysis = await aiService.analyzeIncident({
      title: newIncident.title,
      service: newIncident.service,
      errorRate: newIncident.errorRate,
      latencyMs: newIncident.latencyMs
    });
    newIncident.aiAnalysis = aiAnalysis;
    broadcastEvent('ai:analysis', { incidentId: newIncident.id, analysis: aiAnalysis });

    res.json({
      success: true,
      message: 'Simulated incident created with automated AI Root Cause Analysis',
      data: newIncident
    });
  });

  // SELF-HEALING ROUTES
  app.get('/api/self-healing/actions', (req: Request, res: Response) => {
    const allActions = incidents.flatMap((inc) => inc.healingActions);
    res.json({ success: true, data: allActions });
  });

  app.post('/api/self-healing/execute', async (req: Request, res: Response) => {
    const { incidentId, actionId } = req.body;
    const targetIncident = incidents.find((inc) => inc.id === incidentId) || incidents[0];
    const targetAction = targetIncident?.healingActions.find((a) => a.id === actionId) || targetIncident?.healingActions[0];

    if (!targetAction || !targetIncident) {
      return res.status(404).json({ success: false, message: 'Incident or Action not found' });
    }

    broadcastEvent('healing:started', targetAction);

    // Run 6-step recovery
    const result = await healingEngine.runHealingSequence(targetIncident, targetAction, (step, action) => {
      broadcastEvent('healing:step', { step, action });
    });

    // Mark incident resolved and restore service
    targetIncident.status = 'RESOLVED';
    targetIncident.resolvedTime = 'Just now';
    const paymentSvc = servicesHealth.find((s) => s.name === targetIncident.service);
    if (paymentSvc) {
      paymentSvc.status = 'HEALTHY';
      paymentSvc.errorRate = 0.02;
      paymentSvc.latencyMs = 36;
    }

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'System Self-Healing Succeeded',
      message: `${targetAction.actionType} completed in ${result.recoveryTimeSeconds}s. System verified healthy.`,
      type: 'SELF_HEALING',
      severity: 'INFO',
      read: false,
      timestamp: 'Just now'
    });

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user: 'system/self-healing-engine',
      action: 'SELF_HEALING_RECOVERED',
      resource: targetIncident.service,
      resourceId: targetAction.id,
      timestamp: 'Just now',
      result: 'SUCCESS',
      details: targetAction.auditMessage
    });

    broadcastEvent('healing:completed', { action: targetAction, incident: targetIncident });
    broadcastEvent('monitoring:update', servicesHealth);

    res.json({ success: true, message: result.message, data: result });
  });

  // AI ROUTES
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, history } = req.body;
    const reply = await aiService.chatAssistant(message || 'Hello', history || []);
    res.json({ success: true, data: reply });
  });

  app.post('/api/ai/analyze-incident', async (req: Request, res: Response) => {
    const { incidentId } = req.body;
    const incident = incidents.find((i) => i.id === incidentId) || incidents[0];
    const analysis = await aiService.analyzeIncident({
      title: incident.title,
      service: incident.service,
      errorRate: incident.errorRate,
      latencyMs: incident.latencyMs
    });
    res.json({ success: true, data: analysis });
  });

  // LOGS, NOTIFICATIONS, AUDIT & TEAM
  app.get('/api/logs', (req: Request, res: Response) => {
    res.json({ success: true, data: terminalLogs });
  });

  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json({ success: true, data: notifications });
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const n = notifications.find((item) => item.id === req.params.id);
    if (n) n.read = true;
    res.json({ success: true });
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json({ success: true, data: auditLogs });
  });

  app.get('/api/team', (req: Request, res: Response) => {
    res.json({ success: true, data: users });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevSecOps Server] Ready on http://localhost:${PORT}`);
  });
}

startServer();
