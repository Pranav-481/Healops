import 'dotenv/config';
import path from 'node:path';

const booleanValue = (value: string | undefined) => value?.toLowerCase() === 'true';

export const config = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  demoMode: booleanValue(process.env.DEMO_MODE),
  dataDir: path.resolve(process.env.DATA_DIR || '.data'),
  workspaceRoot: path.resolve(process.env.WORKSPACE_ROOT || '.workspaces'),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',').map((value) => value.trim()).filter(Boolean),
  apiTokens: (process.env.API_TOKENS || '').split(',').map((entry) => entry.trim()).filter(Boolean),
  prometheusUrl: process.env.PROMETHEUS_URL?.replace(/\/$/, ''),
  kubectlBin: process.env.KUBECTL_BIN || 'kubectl',
  namespace: process.env.KUBERNETES_NAMESPACE || 'default',
  containerRegistry: process.env.CONTAINER_REGISTRY || '',
  requireLiveIntegrations: !booleanValue(process.env.DEMO_MODE),
};

if (!Number.isFinite(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}
