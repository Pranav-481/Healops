<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# HealOps

HealOps runs in two deliberately separate modes:

- `DEMO_MODE=true` is a safe presentation environment. It stores state locally and simulates infrastructure actions.
- `DEMO_MODE=false` requires a valid Bearer token and executes configured Git, test, security-scanner, Docker, Kubernetes, and Prometheus operations. Never use a production cluster until you have reviewed the access policies and tested in a non-production namespace.

## Run locally

1. Copy `.env.example` to `.env` and keep `DEMO_MODE=true`.
2. Run `npm install` and `npm run dev`.
3. Build with `npm run build`; serve the production bundle with `npm start`.

## Enabling live operations

Set `DEMO_MODE=false`, define a strong `API_TOKENS` value, restrict `ALLOWED_ORIGINS`, configure `PROMETHEUS_URL`, `KUBERNETES_NAMESPACE`, and `CONTAINER_REGISTRY`, then deploy the backend where these executables are installed and authenticated: `git`, `npm`, `semgrep`, `trivy`, `gitleaks`, `docker`, and `kubectl`.

All write operations require an authenticated role. Rollbacks and any action marked `requiresApproval` additionally require `approved: true` from an `ADMIN` user. Pipeline repositories must be HTTPS or SSH Git URLs. Pipeline source is isolated under `WORKSPACE_ROOT`; it is not executed through a shell.

## API usage

In live mode send `Authorization: Bearer <token>` with every `/api` request. Create a project with its Git repository, then trigger a pipeline using `POST /api/pipelines/:id/run` with `{ "projectId": "..." }` (or a previous pipeline id). The backend returns `202` immediately and emits server-sent events as stages progress.
