import { Pipeline, PipelineStage, PipelineStatus, StageName } from '../../../src/types';

export class PipelineEngine {
  private runningPipelines: Map<string, boolean> = new Map();

  public createDefaultStages(): PipelineStage[] {
    const stageDefs: Array<{ name: StageName; displayName: string }> = [
      { name: 'SOURCE', displayName: 'Source Code Checkout' },
      { name: 'BUILD', displayName: 'Compile & Dependencies' },
      { name: 'UNIT_TEST', displayName: 'Unit & Contract Tests' },
      { name: 'SAST', displayName: 'Semgrep SAST Scan' },
      { name: 'DEPENDENCY_SCAN', displayName: 'Trivy SCA Audit' },
      { name: 'SECRET_SCAN', displayName: 'Gitleaks Secret Audit' },
      { name: 'DOCKER_BUILD', displayName: 'Multi-Arch Docker Build' },
      { name: 'CONTAINER_SCAN', displayName: 'Container CVE Scan' },
      { name: 'DEPLOY', displayName: 'Kubernetes Rolling Rollout' },
      { name: 'HEALTH_CHECK', displayName: 'Synthetic Health Check' }
    ];

    return stageDefs.map((def, idx) => ({
      id: `stg-${idx + 1}-${Date.now()}`,
      name: def.name,
      displayName: def.displayName,
      status: 'PENDING' as PipelineStatus,
      durationSeconds: 0,
      logs: []
    }));
  }

  public async executePipeline(
    pipeline: Pipeline,
    shouldFailAtHealthCheck: boolean = false,
    onProgress?: (updatedPipeline: Pipeline, newLog: string) => void
  ): Promise<Pipeline> {
    pipeline.status = 'RUNNING';
    pipeline.startedAt = 'Just now';
    this.runningPipelines.set(pipeline.id, true);

    const logMessages: Record<StageName, string[]> = {
      SOURCE: [
        `[${new Date().toLocaleTimeString()}] Cloning repository ${pipeline.projectName}...`,
        `[${new Date().toLocaleTimeString()}] Checked out branch ${pipeline.branch} at commit ${pipeline.commitHash}`,
        `[${new Date().toLocaleTimeString()}] Git LFS and submodules synchronized`
      ],
      BUILD: [
        `[${new Date().toLocaleTimeString()}] Initializing build runtime (Node v20.12.0 LTS)...`,
        `[${new Date().toLocaleTimeString()}] Running npm ci with lockfile validation...`,
        `[${new Date().toLocaleTimeString()}] TypeScript compilation succeeded with 0 errors`
      ],
      UNIT_TEST: [
        `[${new Date().toLocaleTimeString()}] Running unit test suites in parallel...`,
        `[${new Date().toLocaleTimeString()}] 48 suites passed (312 tests total, 0 failed)`,
        `[${new Date().toLocaleTimeString()}] Line coverage: 92.4% (Threshold: 80.0%)`
      ],
      SAST: [
        `[${new Date().toLocaleTimeString()}] Invoking Semgrep ruleset security-audit-2024...`,
        `[${new Date().toLocaleTimeString()}] Scanned 142 source files for injection & deserialization bugs`,
        `[${new Date().toLocaleTimeString()}] SAST Status: Clean (0 High/Critical)`
      ],
      DEPENDENCY_SCAN: [
        `[${new Date().toLocaleTimeString()}] Trivy filesystem SCA audit initiated...`,
        `[${new Date().toLocaleTimeString()}] Verified 384 direct & transitive package hashes`,
        `[${new Date().toLocaleTimeString()}] Zero vulnerable dependencies found in lockfile`
      ],
      SECRET_SCAN: [
        `[${new Date().toLocaleTimeString()}] Gitleaks scanner scanning git history...`,
        `[${new Date().toLocaleTimeString()}] High-entropy regex checks: AWS, Stripe, RSA, JWT secrets`,
        `[${new Date().toLocaleTimeString()}] 0 hardcoded credentials detected`
      ],
      DOCKER_BUILD: [
        `[${new Date().toLocaleTimeString()}] Building container image linux/amd64 and linux/arm64...`,
        `[${new Date().toLocaleTimeString()}] Layer cache hit on base Debian runtime`,
        `[${new Date().toLocaleTimeString()}] Pushed image to registry.internal/${pipeline.projectName.toLowerCase().replace(/\s+/g, '-')}:${pipeline.commitHash}`
      ],
      CONTAINER_SCAN: [
        `[${new Date().toLocaleTimeString()}] Scanning final container layers with Trivy & Grype...`,
        `[${new Date().toLocaleTimeString()}] Base OS vulnerability count: 0 Critical, 0 High`,
        `[${new Date().toLocaleTimeString()}] Container image approved for production admission controller`
      ],
      DEPLOY: [
        `[${new Date().toLocaleTimeString()}] Initiating Kubernetes rolling update deployment...`,
        `[${new Date().toLocaleTimeString()}] Pod readiness probes active: 12/12 pods running`,
        `[${new Date().toLocaleTimeString()}] Traffic switch routed to new pods`
      ],
      HEALTH_CHECK: [
        `[${new Date().toLocaleTimeString()}] Dispatching synthetic canary probes across global regions...`,
        `[${new Date().toLocaleTimeString()}] Probe P99 latency: 34ms`,
        `[${new Date().toLocaleTimeString()}] All synthetic transactions confirmed 200 OK`
      ]
    };

    let totalDuration = 0;

    for (let i = 0; i < pipeline.stages.length; i++) {
      if (!this.runningPipelines.get(pipeline.id)) {
        pipeline.status = 'CANCELLED';
        break;
      }

      const stage = pipeline.stages[i];
      stage.status = 'RUNNING';

      const stageLogs = logMessages[stage.name] || ['Executing stage tasks...'];
      for (const log of stageLogs) {
        stage.logs.push(log);
        if (onProgress) {
          onProgress(pipeline, log);
        }
        await new Promise((r) => setTimeout(r, 350));
      }

      // Check if this is health check and failure is requested
      if (stage.name === 'HEALTH_CHECK' && shouldFailAtHealthCheck) {
        stage.status = 'FAILED';
        stage.error = 'Synthetic canary probe timed out: HTTP 504 Gateway Timeout';
        stage.logs.push(`[${new Date().toLocaleTimeString()}] ERROR: Synthetic probe failed. Latency exceeded SLA.`);
        pipeline.status = 'FAILED';
        pipeline.completedAt = 'Just now';
        this.runningPipelines.delete(pipeline.id);
        if (onProgress) {
          onProgress(pipeline, stage.logs[stage.logs.length - 1]);
        }
        return pipeline;
      }

      stage.status = 'SUCCESS';
      stage.durationSeconds = Math.floor(Math.random() * 8) + 4;
      totalDuration += stage.durationSeconds;

      if (onProgress) {
        onProgress(pipeline, `[${new Date().toLocaleTimeString()}] Stage ${stage.displayName} completed successfully.`);
      }
    }

    if ((pipeline.status as PipelineStatus) !== 'CANCELLED') {
      pipeline.status = 'SUCCESS';
      pipeline.completedAt = 'Just now';
    }

    pipeline.durationSeconds = totalDuration;
    this.runningPipelines.delete(pipeline.id);
    return pipeline;
  }

  public cancelPipeline(id: string): boolean {
    if (this.runningPipelines.has(id)) {
      this.runningPipelines.set(id, false);
      return true;
    }
    return false;
  }
}
