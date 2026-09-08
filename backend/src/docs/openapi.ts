export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Intelligent DevSecOps CI/CD & Self-Healing Deployment Platform API',
    version: '1.0.0',
    description: 'REST API documentation for real-time CI/CD pipelines, automated security scanning, container monitoring, and autonomous AI self-healing workflows.'
  },
  paths: {
    '/api/auth/sync': {
      post: {
        summary: 'Synchronize authenticated user with backend DB',
        responses: { 200: { description: 'User profile synced' } }
      }
    },
    '/api/projects': {
      get: {
        summary: 'List all managed DevSecOps projects',
        responses: { 200: { description: 'Array of projects' } }
      },
      post: {
        summary: 'Create a new project',
        responses: { 201: { description: 'Project created' } }
      }
    },
    '/api/pipelines': {
      get: {
        summary: 'List recent CI/CD pipeline runs',
        responses: { 200: { description: 'Array of pipelines' } }
      }
    },
    '/api/pipelines/{id}/run': {
      post: {
        summary: 'Trigger execution of a CI/CD pipeline',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Pipeline started' } }
      }
    },
    '/api/deployments': {
      get: {
        summary: 'List deployments across environments',
        responses: { 200: { description: 'Array of deployments' } }
      }
    },
    '/api/deployments/{id}/rollback': {
      post: {
        summary: 'Rollback a deployment to previous stable version',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Rollback triggered' } }
      }
    },
    '/api/security/vulnerabilities': {
      get: {
        summary: 'List all detected vulnerabilities from Trivy, Semgrep, and Gitleaks',
        responses: { 200: { description: 'Array of vulnerabilities' } }
      }
    },
    '/api/security/scan': {
      post: {
        summary: 'Initiate a security scan across repositories and container registries',
        responses: { 200: { description: 'Security scan started' } }
      }
    },
    '/api/monitoring/metrics': {
      get: {
        summary: 'Retrieve Prometheus time-series metrics (CPU, Memory, Latency, Error Rate)',
        responses: { 200: { description: 'Metric time-series points' } }
      }
    },
    '/api/monitoring/health': {
      get: {
        summary: 'Get overall system health and individual service statuses',
        responses: { 200: { description: 'System health summary' } }
      }
    },
    '/api/incidents': {
      get: {
        summary: 'List active and resolved production incidents',
        responses: { 200: { description: 'Array of incidents' } }
      },
      post: {
        summary: 'Create an incident manually or via webhook',
        responses: { 201: { description: 'Incident created' } }
      }
    },
    '/api/incidents/simulate': {
      post: {
        summary: 'Simulate Payment API latency & error rate incident for presentation demo',
        responses: { 200: { description: 'Incident demo workflow triggered' } }
      }
    },
    '/api/self-healing/actions': {
      get: {
        summary: 'List self-healing actions and verification audit trails',
        responses: { 200: { description: 'Array of healing actions' } }
      }
    },
    '/api/self-healing/execute': {
      post: {
        summary: 'Execute a self-healing action (container restart, pod scale, rollback)',
        responses: { 200: { description: 'Healing action executed' } }
      }
    },
    '/api/ai/analyze-incident': {
      post: {
        summary: 'Trigger AI Root Cause Analysis on an incident',
        responses: { 200: { description: 'AI analysis with root cause, confidence, evidence' } }
      }
    },
    '/api/ai/chat': {
      post: {
        summary: 'Chat with the DevSecOps AI Assistant',
        responses: { 200: { description: 'AI assistant response' } }
      }
    },
    '/api/logs': {
      get: {
        summary: 'Retrieve real-time consolidated system and pipeline logs',
        responses: { 200: { description: 'Array of log entries' } }
      }
    },
    '/api/notifications': {
      get: {
        summary: 'List user notifications and alerts',
        responses: { 200: { description: 'Array of notifications' } }
      }
    },
    '/api/audit-logs': {
      get: {
        summary: 'Query immutable DevSecOps audit logs',
        responses: { 200: { description: 'Array of audit logs' } }
      }
    }
  }
};

export function renderSwaggerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevSecOps Platform API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0b0f19; font-family: system-ui, sans-serif; }
    .topbar { display: none; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .wrapper { max-width: 1200px; margin: 0 auto; padding: 24px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
}
