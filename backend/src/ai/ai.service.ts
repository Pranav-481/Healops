import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, RiskLevel } from '../../../src/types';

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

  public async chatAssistant(message: string, history: Array<{ role: string; text: string }>): Promise<{
    explanation: string;
    evidence: string[];
    recommendation: string;
    confidence: number;
    risk: RiskLevel;
  }> {
    if (this.hasRealKey && this.aiClient) {
      try {
        const prompt = `You are the DevSecOps Autonomous Self-Healing Platform Assistant.
User question: "${message}"

Respond strictly with a JSON object:
{
  "explanation": "Clear, concise engineering diagnostic explanation",
  "evidence": ["point 1", "point 2"],
  "recommendation": "Prescriptive remediation step",
  "confidence": 95,
  "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err) {
        console.warn('[AIService] Chat generation fallback triggered:', err);
      }
    }

    // Mock Provider responses for standard DevSecOps queries
    const lower = message.toLowerCase();
    if (lower.includes('pipeline') || lower.includes('fail')) {
      return {
        explanation: 'Pipeline pipe-501 failed at the Synthetic Health Check stage because the canary probe exceeded the 800ms SLA threshold (received 2,400ms HTTP 504).',
        evidence: [
          'Stage 1 through 9 (Source to Deploy) succeeded in 164s',
          'Stage 10 Health Check timed out during synthetic checkout simulation',
          'Database query latency increased by 312% post-build'
        ],
        recommendation: 'Run automated container restart or rollback to v2.13.9 to restore API availability.',
        confidence: 96,
        risk: 'HIGH'
      };
    }

    if (lower.includes('production') || lower.includes('unhealthy') || lower.includes('incident')) {
      return {
        explanation: 'Production is currently in a DEGRADED state because Payment Service error rate spiked to 18.4%.',
        evidence: [
          'Prometheus alert firing: HTTP 500 error rate > 5%',
          'Database connection pool starvation detected on payment pods',
          'Canary rollout version v2.14.0 introduced unclosed socket handles'
        ],
        recommendation: 'Trigger the Self-Healing Engine to restart the payment pods or approve the pending production rollback.',
        confidence: 94,
        risk: 'HIGH'
      };
    }

    if (lower.includes('rollback')) {
      return {
        explanation: 'A rollback to v2.13.9 is strongly recommended. Telemetry confirms v2.13.9 operated with 99.98% uptime and 28ms average response latency.',
        evidence: [
          'Stable baseline version v2.13.9 had zero connection pool exhaustion errors',
          'Current v2.14.0 canary pods are dropping 18.4% of transactions'
        ],
        recommendation: 'Click "Approve Rollback" in the Self-Healing or Deployment center. It executes in approximately 38 seconds.',
        confidence: 98,
        risk: 'HIGH'
      };
    }

    if (lower.includes('vulnerabilit') || lower.includes('critical') || lower.includes('security')) {
      return {
        explanation: 'Two CRITICAL vulnerabilities require immediate attention: CVE-2024-3094 in xz-utils (container layer) and GL-SECRET-8821 (hardcoded AWS key in cloud-storage.ts).',
        evidence: [
          'Trivy scanner detected CVE-2024-3094 in base Docker image',
          'Gitleaks scanner found active AWS Access Key ID committed to repository branch'
        ],
        recommendation: 'Rotate the compromised AWS secret immediately via IAM, and update base Dockerfile to Debian 12.5 bookworm.',
        confidence: 99,
        risk: 'CRITICAL'
      };
    }

    return {
      explanation: 'DevSecOps telemetry indicates 3 of 4 production services are Healthy. Payment Service is experiencing an active incident with automated healing available.',
      evidence: [
        'E-Commerce, Auth, and Analytics services running at 99.9% health',
        'Self-Healing engine is standing by with a verified 38s MTTR'
      ],
      recommendation: 'Review the active incident #inc-9021 or trigger the self-healing workflow from the dashboard.',
      confidence: 91,
      risk: 'LOW'
    };
  }
}
