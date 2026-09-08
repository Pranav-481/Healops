import {
  Project,
  Pipeline,
  Vulnerability,
  Deployment,
  Incident,
  HealingAction,
  MonitoringMetricPoint,
  ServiceHealth,
  LogEntry,
  NotificationItem,
  AuditLog,
  User
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'alex.vance@devsecops.local',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    lastActive: 'Just now'
  },
  {
    id: 'usr-2',
    name: 'Marcus Chen',
    email: 'marcus.c@devsecops.local',
    role: 'DEVOPS_ENGINEER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    lastActive: '5m ago'
  },
  {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena.r@devsecops.local',
    role: 'SECURITY_ENGINEER',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    lastActive: '12m ago'
  },
  {
    id: 'usr-4',
    name: 'David Kim',
    email: 'david.k@devsecops.local',
    role: 'DEVELOPER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    lastActive: '1h ago'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Payment Service',
    repository: 'github.com/enterprise/payment-gateway',
    branch: 'main',
    healthScore: 68,
    securityScore: 84,
    status: 'DEGRADED',
    lastDeployment: 'v2.14.0 (20m ago)',
    lastPipelineStatus: 'FAILED',
    description: 'Core PCI-DSS compliant credit card and bank settlement engine.',
    environment: 'production'
  },
  {
    id: 'proj-2',
    name: 'E-Commerce Platform',
    repository: 'github.com/enterprise/ecommerce-core',
    branch: 'release/v4.2',
    healthScore: 98,
    securityScore: 92,
    status: 'HEALTHY',
    lastDeployment: 'v4.2.1 (2h ago)',
    lastPipelineStatus: 'SUCCESS',
    description: 'High-throughput customer storefront & inventory checkout service.',
    environment: 'production'
  },
  {
    id: 'proj-3',
    name: 'Authentication API',
    repository: 'github.com/enterprise/auth-identity-svc',
    branch: 'main',
    healthScore: 99,
    securityScore: 95,
    status: 'HEALTHY',
    lastDeployment: 'v1.9.8 (5h ago)',
    lastPipelineStatus: 'SUCCESS',
    description: 'OAuth2/OIDC Zero-Trust tokens and biometric session gatekeeper.',
    environment: 'production'
  },
  {
    id: 'proj-4',
    name: 'Analytics Service',
    repository: 'github.com/enterprise/telemetry-stream',
    branch: 'main',
    healthScore: 91,
    securityScore: 89,
    status: 'HEALTHY',
    lastDeployment: 'v3.0.4 (1d ago)',
    lastPipelineStatus: 'SUCCESS',
    description: 'Kafka event stream processor for real-time customer behavior analytics.',
    environment: 'staging'
  }
];

export const initialServicesHealth: ServiceHealth[] = [
  {
    name: 'API Gateway',
    status: 'HEALTHY',
    uptime: 99.98,
    latencyMs: 38,
    errorRate: 0.02,
    lastChecked: 'Just now'
  },
  {
    name: 'Database Cluster',
    status: 'HEALTHY',
    uptime: 99.99,
    latencyMs: 14,
    errorRate: 0.0,
    lastChecked: 'Just now'
  },
  {
    name: 'Payment Service',
    status: 'DEGRADED',
    uptime: 94.2,
    latencyMs: 342,
    errorRate: 18.4,
    lastChecked: 'Just now'
  },
  {
    name: 'Authentication API',
    status: 'HEALTHY',
    uptime: 99.95,
    latencyMs: 45,
    errorRate: 0.01,
    lastChecked: 'Just now'
  }
];

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: 'vuln-1',
    cveId: 'CVE-2024-3094',
    severity: 'CRITICAL',
    packageName: 'xz-utils',
    currentVersion: '5.6.0',
    fixedVersion: '5.6.1',
    filePath: 'deploy/Dockerfile',
    lineNumber: 14,
    description: 'Malicious backdoor in upstream xz package compromising sshd authentication.',
    impact: 'Remote unauthorized code execution on root container layer.',
    status: 'OPEN',
    scanner: 'Trivy',
    aiRecommendation: 'Pin container base image to Debian 12.5 or downgrade xz-utils to 5.4.5 immediately.',
    detectedAt: '2h ago'
  },
  {
    id: 'vuln-2',
    cveId: 'CVE-2023-4863',
    severity: 'HIGH',
    packageName: 'libwebp',
    currentVersion: '1.2.4',
    fixedVersion: '1.3.2',
    filePath: 'services/media-processor/package.json',
    lineNumber: 48,
    description: 'Heap buffer overflow in WebP lossless decoding parser.',
    impact: 'Denial of service and potential arbitrary memory manipulation via crafted images.',
    status: 'OPEN',
    scanner: 'OWASP',
    aiRecommendation: 'Execute npm audit fix --force to bump libwebp-dev to version >= 1.3.2.',
    detectedAt: '5h ago'
  },
  {
    id: 'vuln-3',
    cveId: 'GL-SECRET-8821',
    severity: 'CRITICAL',
    packageName: 'aws-sdk',
    currentVersion: 'v2.110',
    filePath: 'config/cloud-storage.ts',
    lineNumber: 22,
    description: 'Hardcoded AWS Production Access Key ID detected in client repository tree.',
    impact: 'Exposes S3 production customer receipts bucket to external exfiltration.',
    status: 'OPEN',
    scanner: 'Gitleaks',
    aiRecommendation: 'Rotate AWS IAM credential immediately, delete key from IAM console, and use AWS Secrets Manager.',
    detectedAt: '1h ago'
  },
  {
    id: 'vuln-4',
    cveId: 'CVE-2023-38606',
    severity: 'MEDIUM',
    packageName: 'axios',
    currentVersion: '0.27.2',
    fixedVersion: '1.6.0',
    filePath: 'package.json',
    lineNumber: 29,
    description: 'Server-side request forgery (SSRF) bypass when parsing absolute URLs.',
    impact: 'Internal network reconnaissance via forged webhook triggers.',
    status: 'OPEN',
    scanner: 'Semgrep',
    aiRecommendation: 'Upgrade axios to v1.6.8 or implement strict URL protocol validation in webhook handler.',
    detectedAt: '1d ago'
  },
  {
    id: 'vuln-5',
    cveId: 'SQ-CODE-0492',
    severity: 'LOW',
    packageName: 'express-rate-limit',
    currentVersion: '6.7.0',
    filePath: 'src/middleware/rate-limiter.ts',
    lineNumber: 12,
    description: 'Default in-memory store allows distributed memory leak under heavy traffic spike.',
    impact: 'Memory degradation when serving unauthenticated bot crawlers.',
    status: 'RESOLVED',
    scanner: 'SonarQube',
    aiRecommendation: 'Switch rate limiting backend to Redis store provider with 60-second TTL eviction.',
    detectedAt: '3d ago'
  }
];

export const mockDeployments: Deployment[] = [
  {
    id: 'dep-101',
    projectId: 'proj-1',
    projectName: 'Payment Service',
    version: 'v2.14.0',
    environment: 'Production',
    strategy: 'Canary',
    commitHash: '8f9a12c',
    commitMessage: 'feat(db): optimize connection pool for fast settlement',
    deployedBy: 'Marcus Chen',
    status: 'FAILED',
    deployedAt: '25m ago',
    durationSeconds: 142,
    activePods: 8,
    rollbackVersion: 'v2.13.9'
  },
  {
    id: 'dep-100',
    projectId: 'proj-2',
    projectName: 'E-Commerce Platform',
    version: 'v4.2.1',
    environment: 'Production',
    strategy: 'Blue-Green',
    commitHash: '3a1d94b',
    commitMessage: 'perf(cache): add redis tiered cache for flash sales',
    deployedBy: 'Alex Vance',
    status: 'SUCCESS',
    deployedAt: '2h ago',
    durationSeconds: 88,
    activePods: 24
  },
  {
    id: 'dep-099',
    projectId: 'proj-3',
    projectName: 'Authentication API',
    version: 'v1.9.8',
    environment: 'Production',
    strategy: 'Rolling',
    commitHash: '19c8f0e',
    commitMessage: 'security: rotate jwt signers and enforce sha-256',
    deployedBy: 'Elena Rostova',
    status: 'SUCCESS',
    deployedAt: '5h ago',
    durationSeconds: 64,
    activePods: 12
  },
  {
    id: 'dep-098',
    projectId: 'proj-4',
    projectName: 'Analytics Service',
    version: 'v3.0.4',
    environment: 'Staging',
    strategy: 'Rolling',
    commitHash: '98e12fa',
    commitMessage: 'chore(deps): update kafka client to 3.6',
    deployedBy: 'David Kim',
    status: 'SUCCESS',
    deployedAt: '1d ago',
    durationSeconds: 45,
    activePods: 4
  }
];

export const mockPipelines: Pipeline[] = [
  {
    id: 'pipe-501',
    projectId: 'proj-1',
    projectName: 'Payment Service',
    commitHash: '8f9a12c',
    commitMessage: 'feat(db): optimize connection pool for fast settlement',
    author: 'Marcus Chen',
    branch: 'main',
    status: 'FAILED',
    startedAt: '28m ago',
    completedAt: '25m ago',
    durationSeconds: 180,
    stages: [
      { id: 's-1', name: 'SOURCE', displayName: 'Source Code Checkout', status: 'SUCCESS', durationSeconds: 6, logs: ['Cloning repo git@github.com:enterprise/payment-gateway.git', 'Checked out commit 8f9a12c', 'Git submodules initialized'] },
      { id: 's-2', name: 'BUILD', displayName: 'Compile & Dependencies', status: 'SUCCESS', durationSeconds: 24, logs: ['node v20.12.0 detected', 'npm ci completed in 18s', 'TypeScript compile: 0 errors'] },
      { id: 's-3', name: 'UNIT_TEST', displayName: 'Unit & Contract Tests', status: 'SUCCESS', durationSeconds: 18, logs: ['Running Jest test suite (48 suites, 312 tests)', 'Tests: 312 passed, 100% total', 'Coverage: 91.4% lines'] },
      { id: 's-4', name: 'SAST', displayName: 'Semgrep SAST Scan', status: 'SUCCESS', durationSeconds: 12, logs: ['Semgrep ruleset v2024.08 executed', '0 high/critical issues found in payment routing'] },
      { id: 's-5', name: 'DEPENDENCY_SCAN', displayName: 'Trivy SCA Audit', status: 'SUCCESS', durationSeconds: 15, logs: ['Scanned 412 direct and transitive npm dependencies', 'Verified zero unpatched CVEs in lockfile'] },
      { id: 's-6', name: 'SECRET_SCAN', displayName: 'Gitleaks Secret Audit', status: 'SUCCESS', durationSeconds: 8, logs: ['Gitleaks scan across 14 commits: 0 leaks identified'] },
      { id: 's-7', name: 'DOCKER_BUILD', displayName: 'Multi-Arch Docker Build', status: 'SUCCESS', durationSeconds: 42, logs: ['Building image payment-service:v2.14.0', 'Layer caching verified', 'Pushed image to registry.internal/payment:v2.14.0'] },
      { id: 's-8', name: 'CONTAINER_SCAN', displayName: 'Container CVE Scan', status: 'WARNING', durationSeconds: 14, logs: ['Trivy image scan: 1 medium severity vulnerability in libssl3 (acceptable)'] },
      { id: 's-9', name: 'DEPLOY', displayName: 'Kubernetes Rolling Rollout', status: 'SUCCESS', durationSeconds: 25, logs: ['kubectl set image deployment/payment-service payment=registry.internal/payment:v2.14.0', '8/8 pods reached Running state'] },
      { id: 's-10', name: 'HEALTH_CHECK', displayName: 'Synthetic Synthetic Health Check', status: 'FAILED', durationSeconds: 16, logs: ['POST /api/health/canary responded HTTP 504 Gateway Timeout', 'Database pool latency spike: 2,400ms', 'FAILED: Error rate exceeded 15% threshold'], error: 'Synthetic canary probe failed: latency exceeded SLA' }
    ]
  },
  {
    id: 'pipe-500',
    projectId: 'proj-2',
    projectName: 'E-Commerce Platform',
    commitHash: '3a1d94b',
    commitMessage: 'perf(cache): add redis tiered cache for flash sales',
    author: 'Alex Vance',
    branch: 'release/v4.2',
    status: 'SUCCESS',
    startedAt: '2h ago',
    completedAt: '2h ago',
    durationSeconds: 162,
    stages: [
      { id: 's-1', name: 'SOURCE', displayName: 'Source Code Checkout', status: 'SUCCESS', durationSeconds: 5, logs: ['Cloning repo git@github.com:enterprise/ecommerce-core.git', 'Checked out commit 3a1d94b'] },
      { id: 's-2', name: 'BUILD', displayName: 'Compile & Dependencies', status: 'SUCCESS', durationSeconds: 21, logs: ['npm ci completed', 'Vite production build bundled cleanly'] },
      { id: 's-3', name: 'UNIT_TEST', displayName: 'Unit & Contract Tests', status: 'SUCCESS', durationSeconds: 22, logs: ['184 tests passed in 19s'] },
      { id: 's-4', name: 'SAST', displayName: 'Semgrep SAST Scan', status: 'SUCCESS', durationSeconds: 10, logs: ['No high/critical static analysis violations'] },
      { id: 's-5', name: 'DEPENDENCY_SCAN', displayName: 'Trivy SCA Audit', status: 'SUCCESS', durationSeconds: 14, logs: ['All package licenses and signatures validated'] },
      { id: 's-6', name: 'SECRET_SCAN', displayName: 'Gitleaks Secret Audit', status: 'SUCCESS', durationSeconds: 6, logs: ['Zero hardcoded credentials detected'] },
      { id: 's-7', name: 'DOCKER_BUILD', displayName: 'Multi-Arch Docker Build', status: 'SUCCESS', durationSeconds: 38, logs: ['Pushed image ecommerce-core:v4.2.1'] },
      { id: 's-8', name: 'CONTAINER_SCAN', displayName: 'Container CVE Scan', status: 'SUCCESS', durationSeconds: 11, logs: ['Image security rating: A+ (0 CVEs)'] },
      { id: 's-9', name: 'DEPLOY', displayName: 'Kubernetes Rolling Rollout', status: 'SUCCESS', durationSeconds: 20, logs: ['Blue/Green switch executed smoothly'] },
      { id: 's-10', name: 'HEALTH_CHECK', displayName: 'Synthetic Synthetic Health Check', status: 'SUCCESS', durationSeconds: 15, logs: ['All 24 endpoints healthy. Response time: 28ms avg'] }
    ]
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 'inc-9021',
    title: 'Payment API error rate spiked to 18.4% post-deployment v2.14.0',
    severity: 'CRITICAL',
    service: 'Payment Service',
    environment: 'Production',
    status: 'INVESTIGATING',
    detectedTime: '22m ago',
    assignedEngineer: 'Marcus Chen',
    description: 'Prometheus alert: HTTP 500 error rate exceeded 5% critical boundary. Database connection pool starvation observed on payment-svc-pod-7.',
    errorRate: 18.4,
    latencyMs: 342,
    aiAnalysis: {
      id: 'ai-ana-101',
      incidentId: 'inc-9021',
      rootCause: 'Database connection pool exhausted after v2.14.0 deployment due to aggressive unclosed keep-alive sockets in transaction worker.',
      confidence: 94,
      impact: 'Up to 18.4% of credit card authorization requests are failing with timeout 504. High revenue loss risk.',
      affectedServices: ['Payment Service', 'Checkout API', 'Stripe Proxy'],
      evidence: [
        'Postgres active connections: 120/120 (max limit reached)',
        'Worker thread pool blocked waiting for DB client lease',
        'Regression introduced in commit 8f9a12c (db connection pool config change)',
        'No spikes in customer order volume; purely infrastructural defect'
      ],
      recommendedAction: 'Execute automated zero-downtime rollback to previous stable version v2.13.9 or restart worker pods with pool limit clamp.',
      riskLevel: 'HIGH',
      timestamp: '20m ago'
    },
    healingActions: [
      {
        id: 'heal-1',
        incidentId: 'inc-9021',
        actionType: 'RESTART_POD',
        description: 'Restart Kubernetes deployment pods to flush leaked connection handles',
        riskLevel: 'LOW',
        requiresApproval: false,
        status: 'PENDING',
        currentStep: 'DETECT',
        verifiedHealthy: false,
        auditMessage: 'Initiated container drain and recycle sequence'
      },
      {
        id: 'heal-2',
        incidentId: 'inc-9021',
        actionType: 'ROLLBACK_DEPLOYMENT',
        description: 'Rollback production cluster from v2.14.0 to stable release v2.13.9',
        riskLevel: 'HIGH',
        requiresApproval: true,
        status: 'PENDING',
        currentStep: 'DETECT',
        verifiedHealthy: false,
        auditMessage: 'Awaiting human DevOps engineer approval for production rollback'
      }
    ]
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Production Incident Detected',
    message: 'Payment API error rate spiked to 18.4% following deployment v2.14.0.',
    type: 'INCIDENT',
    severity: 'CRITICAL',
    read: false,
    timestamp: '22m ago',
    relatedEntityId: 'inc-9021'
  },
  {
    id: 'notif-2',
    title: 'Pipeline Health Check Failed',
    message: 'Pipeline pipe-501 (Payment Service) health probe failed on main branch.',
    type: 'PIPELINE',
    severity: 'WARNING',
    read: false,
    timestamp: '25m ago',
    relatedEntityId: 'pipe-501'
  },
  {
    id: 'notif-3',
    title: 'Self-Healing Verification Complete',
    message: 'Authentication API pod memory threshold auto-rebalanced in 34s.',
    type: 'SELF_HEALING',
    severity: 'INFO',
    read: true,
    timestamp: '3h ago'
  },
  {
    id: 'notif-4',
    title: 'Critical CVE Flagged in Trivy',
    message: 'CVE-2024-3094 detected in upstream image base layer.',
    type: 'SECURITY',
    severity: 'CRITICAL',
    read: true,
    timestamp: '5h ago',
    relatedEntityId: 'vuln-1'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'aud-10',
    user: 'system/self-healing-daemon',
    action: 'SELF_HEALING_TRIGGERED',
    resource: 'Payment Service',
    resourceId: 'inc-9021',
    timestamp: '21m ago',
    result: 'SUCCESS',
    details: 'AI root cause model analyzed telemetry (94% confidence: DB pool exhaustion).'
  },
  {
    id: 'aud-9',
    user: 'marcus.c@devsecops.local',
    action: 'DEPLOYMENT_TRIGGERED',
    resource: 'Payment Service',
    resourceId: 'dep-101',
    timestamp: '28m ago',
    result: 'SUCCESS',
    details: 'Triggered Canary deployment v2.14.0'
  },
  {
    id: 'aud-8',
    user: 'alex.vance@devsecops.local',
    action: 'DEPLOYMENT_SUCCESS',
    resource: 'E-Commerce Platform',
    resourceId: 'dep-100',
    timestamp: '2h ago',
    result: 'SUCCESS',
    details: 'Blue-Green switch completed without packet loss.'
  },
  {
    id: 'aud-7',
    user: 'elena.r@devsecops.local',
    action: 'SECURITY_SCAN_COMPLETED',
    resource: 'Container Registry',
    resourceId: 'scan-881',
    timestamp: '5h ago',
    result: 'SUCCESS',
    details: 'Trivy + Gitleaks scan run across all staging and production pods.'
  }
];

export const mockTerminalLogs: LogEntry[] = [
  { id: 'log-1', timestamp: '10:31:04', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:04] Starting DevSecOps CI/CD pipeline #pipe-501 (commit 8f9a12c)...' },
  { id: 'log-2', timestamp: '10:31:07', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:07] Installing dependencies via clean npm ci install...' },
  { id: 'log-3', timestamp: '10:31:14', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:14] Running Jest test suite (312 tests passed)...' },
  { id: 'log-4', timestamp: '10:31:20', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:20] Tests passed. Coverage verified at 91.4%.' },
  { id: 'log-5', timestamp: '10:31:23', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:23] Running multi-layer security scan (Trivy, Semgrep, Gitleaks)...' },
  { id: 'log-6', timestamp: '10:31:27', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:27] Security scan completed. Zero hardcoded secrets identified.' },
  { id: 'log-7', timestamp: '10:31:31', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:31] Building Docker container image payment:v2.14.0...' },
  { id: 'log-8', timestamp: '10:31:48', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:31:48] Deployment started in Production via Canary strategy...' },
  { id: 'log-9', timestamp: '10:32:02', level: 'WARNING', service: 'Payment Service', environment: 'Production', message: '[10:32:02] Health probe warning: Response latency spiked to 1,240ms.' },
  { id: 'log-10', timestamp: '10:32:15', level: 'ERROR', service: 'Payment Service', environment: 'Production', message: '[10:32:15] CRITICAL: Synthetic canary probe failed (HTTP 504 Gateway Timeout).' },
  { id: 'log-11', timestamp: '10:32:18', level: 'ERROR', service: 'Payment Service', environment: 'Production', message: '[10:32:18] Error rate = 18.4%. Triggering automated incident detector.' },
  { id: 'log-12', timestamp: '10:32:20', level: 'INFO', service: 'Payment Service', environment: 'Production', message: '[10:32:20] AI Root Cause Analysis daemon invoked for incident #inc-9021...' }
];

export function generateMetricPoints(hours: number = 24): MonitoringMetricPoint[] {
  const points: MonitoringMetricPoint[] = [];
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / 20;

  for (let i = 20; i >= 0; i--) {
    const time = new Date(now - i * stepMs);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Simulate normal pattern, with an elevation spike at the end for incident demo
    const isRecentSpike = i <= 2;
    points.push({
      timestamp: timeStr,
      cpuPercent: isRecentSpike ? 82 + Math.random() * 8 : 34 + Math.random() * 12,
      memoryPercent: isRecentSpike ? 88 + Math.random() * 5 : 52 + Math.random() * 8,
      diskPercent: 44,
      networkInMB: isRecentSpike ? 240 + Math.random() * 40 : 120 + Math.random() * 20,
      networkOutMB: isRecentSpike ? 310 + Math.random() * 50 : 160 + Math.random() * 30,
      requestRate: isRecentSpike ? 4200 : 2800 + Math.random() * 400,
      errorRatePercent: isRecentSpike ? 18.4 : 0.04 + Math.random() * 0.08,
      latencyMs: isRecentSpike ? 342 : 38 + Math.random() * 10
    });
  }
  return points;
}
