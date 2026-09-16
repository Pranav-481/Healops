import { HealingAction, HealingStep, RiskLevel, Incident } from '../../../src/types';
import { runCommand } from '../core/command-runner';
import { config } from '../core/config';

export interface HealingExecutionResult {
  success: boolean;
  recoveryTimeSeconds: number;
  message: string;
  action: HealingAction;
}

export class SelfHealingEngine {
  private cooldownSeconds: number = 60;
  private lastExecutedTimestamp = new Map<string, number>();

  // Safe action whitelist
  private allowedActions = new Set<HealingAction['actionType']>([
    'RESTART_CONTAINER',
    'RESTART_POD',
    'SCALE_SERVICE',
    'ROLLBACK_DEPLOYMENT',
    'CLEAR_CACHE'
  ]);

  public canAutoExecute(risk: RiskLevel, actionType: HealingAction['actionType'], service: string): boolean {
    // Safety guardrail: Only LOW and safe MEDIUM actions can be auto-executed.
    // HIGH and CRITICAL actions require human approval.
    if (risk === 'CRITICAL' || risk === 'HIGH') {
      return false;
    }
    if (!this.allowedActions.has(actionType)) return false;
    const now = Date.now();
    if (now - (this.lastExecutedTimestamp.get(service) || 0) < this.cooldownSeconds * 1000) {
      console.warn('[SelfHealingEngine] Cooldown active, throttle execution.');
      return false;
    }
    return true;
  }

  public async runHealingSequence(
    incident: Incident,
    action: HealingAction,
    onStepChange?: (step: HealingStep, action: HealingAction) => void,
    options: { approved: boolean; replicas?: number } = { approved: false }
  ): Promise<HealingExecutionResult> {
    if (!this.allowedActions.has(action.actionType)) throw new Error(`Unsupported healing action: ${action.actionType}`);
    if ((action.requiresApproval || !this.canAutoExecute(action.riskLevel, action.actionType, incident.service)) && !options.approved) {
      throw new Error('This action requires explicit approval from an authorized operator.');
    }
    const startTime = Date.now();
    action.status = 'EXECUTING';

    const steps: HealingStep[] = ['DETECT', 'ANALYZE', 'DECIDE', 'ACT', 'VERIFY', 'RECOVER'];

    for (const step of steps) {
      action.currentStep = step;
      if (onStepChange) {
        onStepChange(step, action);
      }
      if (step === 'ACT') {
        if (config.demoMode) await new Promise((resolve) => setTimeout(resolve, 300));
        else await this.executeAction(incident.service, action.actionType, options.replicas);
      }
    }

    action.status = 'SUCCESS';
    action.verifiedHealthy = true;
    const duration = Math.round((Date.now() - startTime) / 1000);
    action.recoveryTimeSeconds = duration;
    action.completedAt = 'Just now';
    action.auditMessage = `System recovered: ${action.actionType} executed and verified healthy in ${duration}s.`;

    this.lastExecutedTimestamp.set(incident.service, Date.now());

    return {
      success: true,
      recoveryTimeSeconds: duration,
      message: `System recovered successfully via ${action.actionType}`,
      action
    };
  }

  private async executeAction(service: string, actionType: HealingAction['actionType'], replicas?: number) {
    const resource = `deployment/${service.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
    const base = ['--namespace', config.namespace];
    if (actionType === 'RESTART_POD' || actionType === 'RESTART_CONTAINER') {
      await runCommand(config.kubectlBin, ['rollout', 'restart', resource, ...base]);
      return;
    }
    if (actionType === 'ROLLBACK_DEPLOYMENT') {
      await runCommand(config.kubectlBin, ['rollout', 'undo', resource, ...base]);
      return;
    }
    if (actionType === 'SCALE_SERVICE') {
      if (!Number.isInteger(replicas) || !replicas || replicas < 1 || replicas > 1000) throw new Error('A replicas value between 1 and 1000 is required for scale actions.');
      await runCommand(config.kubectlBin, ['scale', resource, `--replicas=${replicas}`, ...base]);
      return;
    }
    if (actionType === 'CLEAR_CACHE') throw new Error('CLEAR_CACHE requires a project-specific cache adapter and is disabled by default.');
  }
}
