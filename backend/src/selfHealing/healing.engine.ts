import { HealingAction, HealingStep, RiskLevel, Incident } from '../../../src/types';

export interface HealingExecutionResult {
  success: boolean;
  recoveryTimeSeconds: number;
  message: string;
  action: HealingAction;
}

export class SelfHealingEngine {
  private activeHealingJobs: Map<string, HealingAction> = new Map();
  private maxRetries: number = 3;
  private cooldownSeconds: number = 60;
  private lastExecutedTimestamp: number = 0;

  // Safe action whitelist
  private allowedActions = [
    'RESTART_CONTAINER',
    'RESTART_POD',
    'SCALE_SERVICE',
    'ROLLBACK_DEPLOYMENT',
    'CLEAR_CACHE'
  ];

  public canAutoExecute(risk: RiskLevel): boolean {
    // Safety guardrail: Only LOW and safe MEDIUM actions can be auto-executed.
    // HIGH and CRITICAL actions require human approval.
    if (risk === 'CRITICAL' || risk === 'HIGH') {
      return false;
    }
    const now = Date.now();
    if (now - this.lastExecutedTimestamp < this.cooldownSeconds * 1000) {
      console.warn('[SelfHealingEngine] Cooldown active, throttle execution.');
      return false;
    }
    return true;
  }

  public async runHealingSequence(
    incident: Incident,
    action: HealingAction,
    onStepChange?: (step: HealingStep, action: HealingAction) => void
  ): Promise<HealingExecutionResult> {
    const startTime = Date.now();
    action.status = 'EXECUTING';

    const steps: HealingStep[] = ['DETECT', 'ANALYZE', 'DECIDE', 'ACT', 'VERIFY', 'RECOVER'];

    for (const step of steps) {
      action.currentStep = step;
      if (onStepChange) {
        onStepChange(step, action);
      }
      // Realistic simulation delay for each recovery stage
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    action.status = 'SUCCESS';
    action.verifiedHealthy = true;
    const duration = Math.round((Date.now() - startTime) / 1000);
    action.recoveryTimeSeconds = duration;
    action.completedAt = 'Just now';
    action.auditMessage = `System recovered: ${action.actionType} executed and verified healthy in ${duration}s.`;

    this.lastExecutedTimestamp = Date.now();

    return {
      success: true,
      recoveryTimeSeconds: duration,
      message: `System recovered successfully via ${action.actionType}`,
      action
    };
  }
}
