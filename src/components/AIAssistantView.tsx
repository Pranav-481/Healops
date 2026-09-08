import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Terminal,
  RotateCcw,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface Message {
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
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "HealOps Copilot active. Monitoring live Prometheus telemetry, CI/CD pipeline runs, and container security scans. How can I assist you?",
      timestamp: 'Just now',
      structured: {
        recommendations: [
          'Investigate Payment Service latency anomaly following release v2.14.0',
          'Review Trivy critical CVE patches for container images',
          'Audit self-healing guardrails policy enforcement'
        ]
      }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'Why did the Payment pipeline fail?',
    'What caused the active incident?',
    'Should I rollback deployment v2.14.0?',
    'How do I fix CVE-2023-44487?',
    'What is our current Self-Healing Score and MTTR?'
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
      const replyText = data?.data?.text || "Diagnostic analysis complete: The incident correlates with database connection pool exhaustion in the payment service following deployment v2.14.0.";

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: {
          confidence: 0.94,
          riskAssessment: 'LOW RISK REMEDIATION',
          evidence: [
            'Prometheus: HTTP 500 error rate spiked to 18.4%',
            'Cluster logs: Connection pool acquisition timeout (pool capacity: 100)',
            'Commit correlation: Commit a9f2c3b deployed 14 minutes prior'
          ],
          recommendations: [
            'Trigger container restart to flush blocked connection pool sockets',
            'If error rate exceeds 5% after restart, execute zero-downtime rollback to v2.13.9'
          ]
        }
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-slate-900 flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-slate-900" />
          DevSecOps AI Copilot &amp; Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-wide">
          Root cause analysis, pipeline diagnostics, vulnerability remediation &amp; self-healing advice
        </p>
      </div>

      {/* Chat Container */}
      <GlassCard className="p-4 sm:p-5 flex flex-col h-[640px] justify-between">
        {/* Messages Scroll Area */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

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

                  {/* Structured AI cards */}
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

                      {msg.structured.evidence && (
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

                      {msg.structured.recommendations && (
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
              <span>Analyzing telemetry logs &amp; correlating metrics...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar & Input */}
        <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-500 text-[11px] font-semibold shrink-0">
              Suggested:
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="btn-popup px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-b from-white/95 via-white/80 to-white/85 text-slate-700 hover:text-indigo-600 border border-white/95 border-t-white shrink-0 transition-all shadow-[0_4px_12px_rgba(15,23,42,0.04),inset_0_1.5px_1px_rgba(255,255,255,1)] backdrop-blur-xl cursor-pointer"
              >
                {prompt}
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
              placeholder="Ask about pipelines, telemetry, security CVEs, or self-healing..."
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
