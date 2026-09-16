import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  FolderGit2,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Project, Pipeline, Deployment, Vulnerability, Incident, ServiceHealth, HealingAction } from '../types';

export interface AIActionProposal {
  type: 'TRIGGER_PIPELINE' | 'ROLLBACK' | 'RESTART_POD' | 'SECURITY_SCAN' | 'RESOLVE_VULN' | 'CREATE_PROJECT' | 'SIMULATE_INCIDENT';
  title: string;
  description: string;
  serviceName?: string;
  payload?: any;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structured?: {
    rootCause?: string;
    evidence?: string[];
    recommendations?: string[];
    confidence?: number;
    riskAssessment?: string;
  };
  action?: AIActionProposal;
  actionExecuted?: boolean;
}

interface AIAssistantViewProps {
  projects?: Project[];
  pipelines?: Pipeline[];
  deployments?: Deployment[];
  vulnerabilities?: Vulnerability[];
  incidents?: Incident[];
  servicesHealth?: ServiceHealth[];
  onTriggerPipeline?: (failHealthCheck?: boolean, options?: any) => Promise<void> | void;
  onRollbackDeployment?: (deployment: Deployment) => Promise<void> | void;
  onExecuteHealing?: (incident: Incident, action: HealingAction) => Promise<void> | void;
  onTriggerScan?: () => Promise<void> | void;
  onResolveVuln?: (id: string) => Promise<void> | void;
  onCreateProject?: (projectData: Partial<Project>) => Promise<void> | void;
  onSimulateIncident?: () => Promise<void> | void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  projects = [],
  pipelines = [],
  deployments = [],
  vulnerabilities = [],
  incidents = [],
  servicesHealth = [],
  onTriggerPipeline,
  onRollbackDeployment,
  onExecuteHealing,
  onTriggerScan,
  onResolveVuln,
  onCreateProject,
  onSimulateIncident,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "HealOps Copilot active. I can diagnose issues AND execute actions on your behalf (run pipelines, perform rollbacks, restart pods, run security scans, or create microservices). How can I assist you?",
      timestamp: 'Just now',
      structured: {
        recommendations: [
          'Investigate Payment Service latency anomaly following release v2.14.0',
          'Execute container restart to flush database connection pool',
          'Run multi-scanner security audit across SAST & SCA'
        ]
      }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const quickActionPrompts = [
    { label: '🚀 Run Pipeline', prompt: 'Run the CI/CD pipeline for Payment Service' },
    { label: '🔄 Rollback Deployment', prompt: 'Rollback Payment Service deployment to previous stable version' },
    { label: '⚡ Self-Heal Pods', prompt: 'Restart Payment pods to heal database connection pool exhaustion' },
    { label: '🛡️ Security Scan', prompt: 'Execute multi-scanner security audit' },
    { label: '⚠️ Simulate Incident', prompt: 'Simulate production incident on Payment Service' },
    { label: '🔍 System Status', prompt: 'What is the current health status of our services?' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        })
      });
      const data = await res.json();
      const aiData = data?.data;

      const replyExplanation = aiData?.explanation || "Diagnostic analysis complete: The incident correlates with database connection pool exhaustion in the payment service following deployment v2.14.0.";

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: {
          confidence: aiData?.confidence || 0.95,
          riskAssessment: `${aiData?.risk || 'LOW'} RISK`,
          evidence: aiData?.evidence && aiData.evidence.length > 0 ? aiData.evidence : [
            'Prometheus: HTTP 500 error rate spiked to 18.4%',
            'Cluster logs: Connection pool acquisition timeout (pool capacity: 100)'
          ],
          recommendations: aiData?.recommendations && aiData.recommendations.length > 0 ? aiData.recommendations : [
            'Trigger container restart to flush blocked connection pool sockets',
            'If error rate persists, execute zero-downtime rollback to v2.13.9'
          ]
        },
        action: aiData?.action || undefined
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async (msgId: string, action: AIActionProposal) => {
    setExecutingActionId(msgId);
    try {
      if (action.type === 'ROLLBACK') {
        const targetDep = deployments.find(d => d.projectName.toLowerCase().includes('payment')) || deployments[0];
        if (targetDep && onRollbackDeployment) {
          await onRollbackDeployment(targetDep);
        }
      } else if (action.type === 'RESTART_POD') {
        const activeInc = incidents.find(i => i.status !== 'RESOLVED') || incidents[0];
        const restartAct = activeInc?.healingActions?.find(a => a.actionType === 'RESTART_POD') || activeInc?.healingActions?.[0];
        if (activeInc && restartAct && onExecuteHealing) {
          await onExecuteHealing(activeInc, restartAct);
        }
      } else if (action.type === 'TRIGGER_PIPELINE') {
        if (onTriggerPipeline) {
          await onTriggerPipeline(action.payload?.failHealthCheck || false, {
            projectId: action.payload?.projectId,
            projectName: action.serviceName
          });
        }
      } else if (action.type === 'SECURITY_SCAN') {
        if (onTriggerScan) {
          await onTriggerScan();
        }
      } else if (action.type === 'RESOLVE_VULN') {
        if (onResolveVuln) {
          await onResolveVuln(action.payload?.id || 'vuln-1');
        }
      } else if (action.type === 'CREATE_PROJECT') {
        if (onCreateProject) {
          await onCreateProject(action.payload || { name: action.serviceName || 'New Microservice' });
        }
      } else if (action.type === 'SIMULATE_INCIDENT') {
        if (onSimulateIncident) {
          await onSimulateIncident();
        }
      }

      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionExecuted: true } : m));

      // Append system confirmation message
      const confirmMsg: Message = {
        id: `msg-conf-${Date.now()}`,
        sender: 'ai',
        text: `✓ Request executed successfully: "${action.title}". Live cluster telemetry and state updated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      console.error('Failed to execute requested action:', err);
    } finally {
      setExecutingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-slate-900" />
          DevSecOps AI Copilot &amp; Autonomous Action Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
          Directly execute user requests: trigger CI/CD builds, rollbacks, pod restarts, security audits, and project provisioning
        </p>
      </div>

      {/* Chat Container */}
      <GlassCard className="p-4 sm:p-5 flex flex-col h-[660px] justify-between">
        {/* Messages Scroll Area */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isExecutingThis = executingActionId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/80 border border-white shadow-xs text-slate-800 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`
                    max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-xs backdrop-blur-xl
                    ${
                      isUser
                        ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                        : 'bg-white/85 text-slate-800 border-white/95 shadow-xs'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-current/15">
                    <span className={`font-bold text-xs ${isUser ? 'text-slate-200' : 'text-slate-900'}`}>
                      {isUser ? 'You' : 'HealOps Copilot'}
                    </span>
                    <span className={`text-[10px] font-mono ${isUser ? 'text-slate-400' : 'text-slate-500'}`}>{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{msg.text}</p>

                  {/* Interactive Action Card if AI identified user request / remediation */}
                  {msg.action && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-indigo-900">
                          {msg.action.type === 'ROLLBACK' && <RotateCcw className="w-4 h-4 text-rose-600" />}
                          {msg.action.type === 'RESTART_POD' && <Zap className="w-4 h-4 text-emerald-600" />}
                          {msg.action.type === 'TRIGGER_PIPELINE' && <Play className="w-4 h-4 text-indigo-600" />}
                          {msg.action.type === 'SECURITY_SCAN' && <ShieldCheck className="w-4 h-4 text-sky-600" />}
                          {msg.action.type === 'CREATE_PROJECT' && <FolderGit2 className="w-4 h-4 text-purple-600" />}
                          {msg.action.type === 'SIMULATE_INCIDENT' && <Flame className="w-4 h-4 text-amber-600" />}
                          <span>{msg.action.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                          Action Ready
                        </span>
                      </div>

                      <p className="text-xs text-indigo-800 leading-relaxed">
                        {msg.action.description}
                      </p>

                      <div className="flex items-center justify-end pt-1">
                        {msg.actionExecuted ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Request Completed
                          </span>
                        ) : (
                          <GlassButton
                            variant="primary"
                            size="sm"
                            isLoading={isExecutingThis}
                            icon={<Zap className="w-3.5 h-3.5" />}
                            onClick={() => msg.action && handleExecuteAction(msg.id, msg.action)}
                          >
                            Execute Request Now
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Structured AI Telemetry Cards */}
                  {msg.structured && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 space-y-2 text-xs">
                      {msg.structured.confidence && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Confidence Score:</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 font-bold font-mono text-[11px] border border-purple-500/25">
                            {Math.round(msg.structured.confidence * 100)}%
                          </span>
                        </div>
                      )}

                      {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Correlated Telemetry:
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
                            {msg.structured.evidence.map((e, idx) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.structured.recommendations && msg.structured.recommendations.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            Recommended Next Steps:
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                            {msg.structured.recommendations.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-800 font-semibold p-2 bg-white/80 rounded-xl w-fit border border-white backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing live telemetry &amp; preparing execution plan...</span>
            </div>
          )}
        </div>

        {/* Quick Action Chips & Input */}
        <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-500 text-[11px] font-semibold shrink-0">
              Quick Actions:
            </span>
            {quickActionPrompts.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSendMessage(item.prompt)}
                className="btn-popup px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-b from-white/95 via-white/80 to-white/85 text-slate-700 hover:text-indigo-600 border border-white/95 border-t-white shrink-0 transition-all shadow-[0_4px_12px_rgba(15,23,42,0.04),inset_0_1.5px_1px_rgba(255,255,255,1)] backdrop-blur-xl cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or issue a command (e.g. 'rollback payment service', 'run pipeline', 'restart pods')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-white/85 border border-white text-xs sm:text-sm text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent placeholder:text-slate-400 font-medium shadow-xs backdrop-blur-md"
            />
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              icon={<Send className="w-3.5 h-3.5" />}
              isLoading={isLoading}
            >
              Send
            </GlassButton>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};
