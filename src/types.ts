export type UserRole = 'ADMIN' | 'DEVOPS_ENGINEER' | 'DEVELOPER' | 'SECURITY_ENGINEER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
}

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  repository: string;
  branch: string;
  healthScore: number;
  securityScore: number;
  status: HealthStatus;
  lastDeployment: string;
  lastPipelineStatus: PipelineStatus;
  description: string;
  environment: 'development' | 'testing' | 'staging' | 'production';
}

export type PipelineStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'WARNING' | 'CANCELLED';

export type StageName = 
  | 'SOURCE'
  | 'BUILD'
  | 'UNIT_TEST'
  | 'SAST'
  | 'DEPENDENCY_SCAN'
  | 'SECRET_SCAN'
  | 'DOCKER_BUILD'
  | 'CONTAINER_SCAN'
  | 'DEPLOY'
  | 'HEALTH_CHECK';

export interface PipelineStage {
  id: string;
  name: StageName;
  displayName: string;
  status: PipelineStatus;
  durationSeconds: number;
  logs: string[];
  error?: string;
}

export interface Pipeline {
  id: string;
  projectId: string;
  projectName: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  branch: string;
  status: PipelineStatus;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  stages: PipelineStage[];
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Vulnerability {
  id: string;
  cveId: string;
  severity: VulnerabilitySeverity;
  packageName: string;
  currentVersion: string;
  fixedVersion?: string;
  filePath: string;
  lineNumber?: number;
  description: string;
  impact: string;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
  scanner: 'Trivy' | 'Semgrep' | 'Gitleaks' | 'SonarQube' | 'OWASP';
  aiRecommendation?: string;
  detectedAt: string;
}

export interface SecurityScan {
  id: string;
  projectId: string;
  scanType: 'SAST' | 'SCA' | 'SECRET_SCAN' | 'CONTAINER_SCAN' | 'IAC';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  securityScore: number;
  vulnerabilitiesCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scannedAt: string;
  findings: Vulnerability[];
}

export type DeploymentEnvironment = 'Development' | 'Testing' | 'Staging' | 'Production';
export type DeploymentStrategy = 'Rolling' | 'Blue-Green' | 'Canary';
export type DeploymentStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  version: string;
  environment: DeploymentEnvironment;
  strategy: DeploymentStrategy;
  commitHash: string;
  commitMessage: string;
  deployedBy: string;
  status: DeploymentStatus;
  deployedAt: string;
  durationSeconds: number;
  activePods?: number;
  rollbackVersion?: string;
}

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'HEALING' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  service: string;
  environment: DeploymentEnvironment;
  status: IncidentStatus;
  detectedTime: string;
  resolvedTime?: string;
  assignedEngineer: string;
  description: string;
  errorRate: number;
  latencyMs: number;
  aiAnalysis?: AIAnalysis;
  healingActions: HealingAction[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HealingStep = 'DETECT' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'VERIFY' | 'RECOVER';

export interface HealingAction {
  id: string;
  incidentId: string;
  actionType: 'RESTART_CONTAINER' | 'RESTART_POD' | 'SCALE_SERVICE' | 'ROLLBACK_DEPLOYMENT' | 'CLEAR_CACHE' | 'DRAIN_NODE';
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  currentStep: HealingStep;
  executedAt?: string;
  completedAt?: string;
  recoveryTimeSeconds?: number;
  verifiedHealthy: boolean;
  auditMessage: string;
}

export interface AIAnalysis {
  id: string;
  incidentId?: string;
  pipelineId?: string;
  rootCause: string;
  confidence: number;
  impact: string;
  affectedServices: string[];
  evidence: string[];
  recommendedAction: string;
  riskLevel: RiskLevel;
  timestamp: string;
}

export interface MonitoringMetricPoint {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  networkInMB: number;
  networkOutMB: number;
  requestRate: number;
  errorRatePercent: number;
  latencyMs: number;
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  uptime: number;
  latencyMs: number;
  errorRate: number;
  lastChecked: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  service: string;
  environment: DeploymentEnvironment;
  message: string;
  traceId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'PIPELINE' | 'DEPLOYMENT' | 'SECURITY' | 'INCIDENT' | 'SELF_HEALING';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  read: boolean;
  timestamp: string;
  relatedEntityId?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details?: string;
}
