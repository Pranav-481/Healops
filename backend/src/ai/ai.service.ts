import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, RiskLevel, Project, Pipeline, Deployment, Vulnerability, Incident, ServiceHealth } from '../../../src/types';

export interface AIActionProposal {
  type: 'TRIGGER_PIPELINE' | 'ROLLBACK' | 'RESTART_POD' | 'SECURITY_SCAN' | 'RESOLVE_VULN' | 'CREATE_PROJECT' | 'SIMULATE_INCIDENT';
  title: string;
  description: string;
  serviceName?: string;
  payload?: any;
}

export interface AIChatResult {
  explanation: string;
  evidence: string[];
  recommendations: string[];
  confidence: number;
  risk: RiskLevel;
  action?: AIActionProposal;
}

export interface SystemPlatformContext {
  projects?: Project[];
  pipelines?: Pipeline[];
  deployments?: Deployment[];
  vulnerabilities?: Vulnerability[];
  incidents?: Incident[];
  servicesHealth?: ServiceHealth[];
}

export class AIService {
  private aiClient: GoogleGenAI | null = null;
  private hasRealKey: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        this.hasRealKey = true;
      } catch (err) {
        console.warn('[AIService] Failed to initialize Google GenAI, using mock AI provider fallback:', err);
      }
    }
  }

  public isUsingRealAI(): boolean {
    return this.hasRealKey && this.aiClient !== null;
  }

  public async analyzeIncident(incidentData: {
    title: string;
    service: string;
    errorRate: number;
    latencyMs: number;
    logs?: string[];
  }): Promise<AIAnalysis> {
    if (this.hasRealKey && this.aiClient) {
      try {
        const prompt = `You are a Senior DevSecOps & SRE Autonomous Incident Diagnostic AI.
Analyze the following production incident:
Service: ${incidentData.service}
Title: ${incidentData.title}
Error Rate: ${incidentData.errorRate}%
Latency: ${incidentData.latencyMs}ms
Logs snippet: ${JSON.stringify(incidentData.logs || [])}

Respond with a JSON object matching this schema:
{
  "rootCause": "precise technical explanation of what broke",
  "confidence": 92,
  "impact": "user facing impact and revenue risk",
  "affectedServices": ["ServiceA", "ServiceB"],
  "evidence": ["evidence point 1", "evidence point 2", "evidence point 3"],
  "recommendedAction": "exact remediation step (e.g. restart container, rollback to vX.X)",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            id: `ai-ana-${Date.now()}`,
            incidentId: 'inc-auto',
            rootCause: parsed.rootCause || 'Database connection pool exhausted after deployment.',
            confidence: parsed.confidence || 93,
            impact: parsed.impact || 'Payment authorization requests failing.',
            affectedServices: parsed.affectedServices || [incidentData.service],
            evidence: parsed.evidence || ['Connection pool limits hit', 'Latency surge past 300ms'],
            recommendedAction: parsed.recommendedAction || 'Execute zero-downtime container restart or rollback.',
            riskLevel: (parsed.riskLevel as RiskLevel) || 'HIGH',
            timestamp: 'Just now'
          };
        }
      } catch (error) {
        console.warn('[AIService] Gemini API call failed, falling back to deterministic mock AI provider:', error);
      }
    }

    // Contextual Mock AI Provider (Deterministic, highly realistic DevSecOps output)
    return {
      id: `ai-ana-${Date.now()}`,
      incidentId: 'inc-auto',
      rootCause: incidentData.service.includes('Payment')
        ? 'Database connection pool exhausted after v2.14.0 deployment due to keep-alive leak in transaction worker.'
        : `Memory leak or resource exhaustion observed in ${incidentData.service} thread pool.`,
      confidence: 94,
      impact: `Up to ${incidentData.errorRate}% of customer requests are timing out with 504 Gateway errors.`,
      affectedServices: [incidentData.service, 'Checkout API', 'API Gateway'],
      evidence: [
        'Active DB connection count reached configured pool ceiling (120/120)',
        `Synthetic latency probe spiked to ${incidentData.latencyMs}ms`,
        'Regression identified after commit 8f9a12c',
        'Incoming traffic volume remains normal; issue is purely architectural'
      ],
      recommendedAction: 'Restart unhealthy container instances to flush leaked connections; escalate to rollback if degradation persists.',
      riskLevel: 'HIGH',
      timestamp: 'Just now'
    };
  }

  public async chatAssistant(
    message: string,
    history: Array<{ role: string; text?: string; parts?: Array<{ text: string }> }>,
    context?: SystemPlatformContext
  ): Promise<AIChatResult> {
    const lower = (message || '').toLowerCase().trim();

    // 1. If Gemini API is available, ask the model with platform context and action function schema
    if (this.hasRealKey && this.aiClient) {
      try {
        const sysContextStr = JSON.stringify({
          activeIncidents: context?.incidents?.map(i => ({ id: i.id, title: i.title, status: i.status, service: i.service })) || [],
          servicesHealth: context?.servicesHealth?.map(s => ({ name: s.name, status: s.status, latency: s.latencyMs, errorRate: s.errorRate })) || [],
          projects: context?.projects?.map(p => ({ id: p.id, name: p.name, status: p.status })) || [],
          recentDeployments: context?.deployments?.slice(0, 3).map(d => ({ id: d.id, project: d.projectName, version: d.version, status: d.status })) || []
        });

        const prompt = `You are HealOps Copilot, an autonomous DevSecOps and SRE platform agent.
Current Platform Telemetry State:
${sysContextStr}

User instruction / question: "${message}"

Determine if the user is asking to execute an action (e.g. rollback, restart pod, run pipeline, scan security, create project, resolve vulnerability) or asking an engineering question.
Respond strictly with a JSON object in this format:
{
  "explanation": "Clear, direct engineering response addressing user's request",
  "evidence": ["telemetry point 1", "telemetry point 2"],
  "recommendations": ["step 1", "step 2"],
  "confidence": 0.95,
  "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "action": null or {
    "type": "ROLLBACK" | "RESTART_POD" | "TRIGGER_PIPELINE" | "SECURITY_SCAN" | "RESOLVE_VULN" | "CREATE_PROJECT" | "SIMULATE_INCIDENT",
    "title": "Action Title",
    "description": "Short explanation of what will be performed",
    "serviceName": "Affected service name",
    "payload": {}
  }
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return {
            explanation: parsed.explanation || 'Request processed successfully.',
            evidence: parsed.evidence || [],
            recommendations: parsed.recommendations || parsed.recommendation ? [parsed.recommendation] : [],
            confidence: parsed.confidence || 0.95,
            risk: parsed.risk || 'LOW',
            action: parsed.action || undefined
          };
        }
      } catch (err) {
        console.warn('[AIService] Gemini Chat generation error, using intelligent agentic fallback:', err);
      }
    }

    // 2. Intelligent agentic rule-based execution engine
    // Check if the user is requesting specific actions:

    // A. ROLLBACK REQUEST
    if (lower.includes('rollback') || lower.includes('revert') || lower.includes('undo deploy')) {
      const targetDep = context?.deployments?.find(d => d.status === 'FAILED' || d.projectName.toLowerCase().includes('payment')) || context?.deployments?.[0];
      return {
        explanation: `Understood. Rollback sequence identified for ${targetDep ? targetDep.projectName : 'Payment Service'} (from ${targetDep?.version || 'v2.14.0'} to ${targetDep?.rollbackVersion || 'v2.13.9'}). This will shift live Kubernetes cluster ingress traffic back to the verified stable release in ~38 seconds.`,
        evidence: [
          `Current version ${targetDep?.version || 'v2.14.0'} telemetry has elevated error rate (18.4%)`,
          `Target rollback baseline ${targetDep?.rollbackVersion || 'v2.13.9'} maintained 99.98% uptime with 28ms latency`,
          'Zero-downtime blue/green traffic switch verified'
        ],
        recommendations: [
          'Click the button below to execute production cluster rollback',
          'Synthetic health checks will validate ingress traffic post-switch'
        ],
        confidence: 0.98,
        risk: 'HIGH',
        action: {
          type: 'ROLLBACK',
          title: `Rollback ${targetDep?.projectName || 'Payment Service'}`,
          description: `Execute rolling rollback from ${targetDep?.version || 'v2.14.0'} to ${targetDep?.rollbackVersion || 'v2.13.9'}`,
          serviceName: targetDep?.projectName || 'Payment Service',
          payload: { id: targetDep?.id || 'dep-102', deployment: targetDep }
        }
      };
    }

    // B. RESTART POD / SELF-HEAL REQUEST
    if (lower.includes('restart') || lower.includes('heal') || lower.includes('pod') || lower.includes('fix incident') || lower.includes('remediate')) {
      const activeInc = context?.incidents?.find(i => i.status !== 'RESOLVED') || context?.incidents?.[0];
      const restartAction = activeInc?.healingActions?.find(a => a.actionType === 'RESTART_POD') || activeInc?.healingActions?.[0];

      return {
        explanation: `Executing container pod recycle for ${activeInc?.service || 'Payment Service'}. This flushes orphaned database connection pool sockets and resets keep-alive handles without interrupting healthy replicas.`,
        evidence: [
          'Active DB connection count reached ceiling (120/120)',
          'Thread starvation detected across worker processes',
          'Rolling restart will cycle 1 pod at a time behind cluster Service'
        ],
        recommendations: [
          'Execute container restart sequence now',
          'Observe error rate regression waveform in live telemetry'
        ],
        confidence: 0.96,
        risk: 'LOW',
        action: {
          type: 'RESTART_POD',
          title: `Restart ${activeInc?.service || 'Payment Service'} Pods`,
          description: 'Recycle Kubernetes pods to clear leaked connection handles',
          serviceName: activeInc?.service || 'Payment Service',
          payload: { incident: activeInc, action: restartAction }
        }
      };
    }

    // C. RUN CI/CD PIPELINE REQUEST
    if (lower.includes('pipeline') || lower.includes('build') || lower.includes('deploy') || lower.includes('run pipe')) {
      const project = context?.projects?.[0];
      const shouldFail = lower.includes('fail') || lower.includes('test fail') || lower.includes('break');

      return {
        explanation: `Ready to trigger the automated 10-stage CI/CD pipeline for ${project?.name || 'Payment Service'}. Stages include Source Checkout, Dependency Audit, Semgrep SAST, Trivy Container CVE scan, and Synthetic Canary Health Check.`,
        evidence: [
          '10 deterministic stages configured in pipeline engine',
          'Semgrep and Gitleaks rulesets validated',
          'Kubernetes rolling deployment target: Production cluster'
        ],
        recommendations: [
          shouldFail ? 'Pipeline will simulate health probe failure for diagnostic testing' : 'Standard clean build and deployment',
          'Real-time stage execution and terminal logs will stream to the console'
        ],
        confidence: 0.95,
        risk: 'MEDIUM',
        action: {
          type: 'TRIGGER_PIPELINE',
          title: `Run CI/CD Pipeline (${project?.name || 'Payment Service'})`,
          description: `Dispatches 10-stage build & deployment for ${project?.name || 'Payment Service'}`,
          serviceName: project?.name || 'Payment Service',
          payload: { pipelineId: 'pipe-501', failHealthCheck: shouldFail }
        }
      };
    }

    // D. RUN SECURITY SCAN REQUEST
    if (lower.includes('scan') || lower.includes('audit') || lower.includes('security') || lower.includes('trivy') || lower.includes('semgrep')) {
      return {
        explanation: 'Initiating full multi-scanner security audit across SAST (Semgrep), SCA (Trivy), and Secret Scanning (Gitleaks) for all active microservices.',
        evidence: [
          'Container base images and lockfiles queued for inspection',
          'Zero-day signature databases synchronized',
          '412 packages across container layers targeted'
        ],
        recommendations: [
          'Run multi-scanner audit now to update security posture score',
          'Check findings table for available automated patch recipes'
        ],
        confidence: 0.99,
        risk: 'LOW',
        action: {
          type: 'SECURITY_SCAN',
          title: 'Execute Multi-Scanner Security Audit',
          description: 'Scan containers, dependencies, and git trees with Trivy, Semgrep & Gitleaks'
        }
      };
    }

    // E. RESOLVE VULNERABILITY REQUEST
    if (lower.includes('cve') || lower.includes('patch') || lower.includes('fix vuln') || lower.includes('resolve vuln')) {
      const targetVuln = context?.vulnerabilities?.find(v => v.status === 'OPEN') || context?.vulnerabilities?.[0];
      return {
        explanation: `Ready to apply automated remediation patch for ${targetVuln?.cveId || 'CVE-2024-3094'} (${targetVuln?.packageName || 'xz-utils'}). This will update Dockerfile base layer and mark the CVE as resolved.`,
        evidence: [
          `Current vulnerable version: ${targetVuln?.currentVersion || '5.6.0'}`,
          `Patched target version: ${targetVuln?.fixedVersion || '5.6.1'}`,
          `Impact: ${targetVuln?.impact || 'Remote code execution risk mitigated'}`
        ],
        recommendations: [
          'Apply patch to container image configuration',
          'Verify container scanner status on next build'
        ],
        confidence: 0.97,
        risk: 'MEDIUM',
        action: {
          type: 'RESOLVE_VULN',
          title: `Patch & Resolve ${targetVuln?.cveId || 'CVE-2024-3094'}`,
          description: `Update ${targetVuln?.packageName || 'package'} to safe version and update inventory`,
          payload: { id: targetVuln?.id || 'vuln-1' }
        }
      };
    }

    // F. CREATE PROJECT REQUEST
    if (lower.includes('create project') || lower.includes('add project') || lower.includes('new project') || lower.includes('new service') || lower.includes('add service')) {
      // Extract project name if user specified one (e.g. "create project api-gateway" or "add project Payment Gateway")
      let extractedName = 'Analytics Ingestion Service';
      const match = message.match(/(?:project|service)\s+(?:called\s+|named\s+)?([A-Za-z0-9-_ ]+)/i);
      if (match && match[1] && match[1].trim().length > 2) {
        extractedName = match[1].trim().replace(/^(called|named)\s+/i, '');
      }

      return {
        explanation: `I can provision and register the new microservice **${extractedName}** into HealOps with Git repository linkage, automated CI/CD pipeline triggers, and Prometheus synthetic probes.`,
        evidence: [
          'Cloud-native Kubernetes deployment template prepared',
          'Default 10-stage DevSecOps pipeline template attached',
          'Synthetic health endpoint /healthz monitoring configured'
        ],
        recommendations: [
          'Confirm microservice creation to onboard repository',
          'Configure environment variables and deployment targets'
        ],
        confidence: 0.96,
        risk: 'LOW',
        action: {
          type: 'CREATE_PROJECT',
          title: `Create Project: ${extractedName}`,
          description: `Register and initialize ${extractedName} microservice in HealOps`,
          serviceName: extractedName,
          payload: {
            name: extractedName,
            repository: `github.com/enterprise/${extractedName.toLowerCase().replace(/\s+/g, '-')}`,
            branch: 'main',
            environment: 'production',
            description: `Autonomous cloud-native microservice ${extractedName}`
          }
        }
      };
    }

    // G. SIMULATE INCIDENT REQUEST
    if (lower.includes('simulate') || lower.includes('incident') || lower.includes('trigger issue') || lower.includes('break')) {
      return {
        explanation: 'I can trigger an end-to-end incident simulation on the Payment Service to demonstrate Prometheus anomaly detection, automated Gemini root cause analysis, and self-healing recovery.',
        evidence: [
          'Simulates synthetic canary latency spike to 342ms',
          'Generates Prometheus alert: HTTP 500 error rate > 18%',
          'Initiates automated 6-step self-healing sequence'
        ],
        recommendations: [
          'Trigger simulation to test on-call alerting and MTTR metrics',
          'Observe live telemetry waveform and self-healing execution'
        ],
        confidence: 0.98,
        risk: 'HIGH',
        action: {
          type: 'SIMULATE_INCIDENT',
          title: 'Simulate Payment Service Incident',
          description: 'Trigger synthetic latency regression, Prometheus alert & AI analysis',
          serviceName: 'Payment Service'
        }
      };
    }

    // H. HEALTH & TELEMETRY INQUIRIES
    if (lower.includes('health') || lower.includes('status') || lower.includes('metric') || lower.includes('system') || lower.includes('cluster')) {
      const degraded = context?.servicesHealth?.filter(s => s.status !== 'HEALTHY') || [];
      const healthy = context?.servicesHealth?.filter(s => s.status === 'HEALTHY') || [];

      return {
        explanation: `System Posture Overview: ${healthy.length} of ${(context?.servicesHealth || []).length} services are currently HEALTHY. ${degraded.length > 0 ? `${degraded.map(d => d.name).join(', ')} is in a DEGRADED state with active incidents.` : 'All production services are passing SLO targets.'}`,
        evidence: [
          `Active Incidents: ${context?.incidents?.filter(i => i.status !== 'RESOLVED').length || 0}`,
          `Critical Vulnerabilities: ${context?.vulnerabilities?.filter(v => v.severity === 'CRITICAL' && v.status !== 'RESOLVED').length || 0}`,
          `Average Cluster Response Probe: 34ms`
        ],
        recommendations: [
          degraded.length > 0 ? 'Execute self-healing restart or rollback for degraded services' : 'System healthy. No remediation required.',
          'Review CI/CD pipeline runs and container scan reports'
        ],
        confidence: 0.95,
        risk: degraded.length > 0 ? 'HIGH' : 'LOW',
        action: degraded.length > 0 ? {
          type: 'RESTART_POD',
          title: `Heal ${degraded[0].name}`,
          description: `Execute container recycle to restore ${degraded[0].name}`,
          serviceName: degraded[0].name
        } : undefined
      };
    }

    // DEFAULT CONTEXTUAL COPILOT RESPONSE
    return {
      explanation: `I am your HealOps DevSecOps Copilot. I can execute platform requests such as:
- **Run CI/CD Pipelines** ("Run pipeline for Payment Service")
- **Autonomous Rollbacks** ("Rollback Payment deployment")
- **Container Self-Healing** ("Restart payment pods to clear connection leak")
- **Security Audits** ("Run security scan for CVEs")
- **Microservice Provisioning** ("Create new project Billing Service")
- **Incident Diagnostics** ("Why is the payment service slow?")

What would you like me to execute or diagnose for you?`,
      evidence: [
        'Live connection to Express DevSecOps Runtime & Vite Engine',
        'Prometheus metrics and Kubernetes state synchronized',
        'Direct action execution enabled'
      ],
      recommendations: [
        'Ask me to execute any operation or click the suggested action chips below',
        'Review the incident and deployment centers for recommended remediations'
      ],
      confidence: 0.99,
      risk: 'LOW'
    };
  }
}

