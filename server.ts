import { db } from "./firebaseAdmin";
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

import {
  mockProjects,
  mockPipelines,
  mockDeployments,
  mockVulnerabilities,
  mockIncidents,
  mockNotifications,
  mockAuditLogs,
  mockTerminalLogs,
  initialServicesHealth,
  mockUsers,
  generateMetricPoints
} from './src/data/mockData';

import {
  AuditLog,
  Deployment,
  HealingAction,
  Incident,
  LogEntry,
  NotificationItem,
  Pipeline,
  Project,
  ServiceHealth,
  User,
  UserRole,
  Vulnerability
} from './src/types';

import { AIService } from './backend/src/ai/ai.service';
import { SelfHealingEngine } from './backend/src/selfHealing/healing.engine';
import { PipelineEngine } from './backend/src/pipeline/pipeline.engine';
import { openApiSpec, renderSwaggerHtml } from './backend/src/docs/openapi';
import { authenticate, authorize } from './backend/src/core/auth';
import { config } from './backend/src/core/config';
import { JsonStore } from './backend/src/core/store';
import { runCommand } from './backend/src/core/command-runner';

const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const now = () => new Date().toISOString();

const fail = (
  res: Response,
  status: number,
  message: string
) => res.status(status).json({
  success: false,
  message
});

const text = (
  value: unknown,
  field: string,
  max = 300
) => {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > max
  ) {
    throw new Error(
      `${field} must be a non-empty string up to ${max} characters.`
    );
  }

  return value.trim();
};

const enumValue = <T extends string>(
  value: unknown,
  field: string,
  values: readonly T[]
) => {
  if (!values.includes(value as T)) {
    throw new Error(
      `${field} must be one of: ${values.join(', ')}.`
    );
  }

  return value as T;
};

async function startServer() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, callback) {
        const allowedOrigins = [
          ...config.allowedOrigins,
          'https://healops-26918.web.app',
        ];

        callback(
          null,
          !origin || allowedOrigins.includes(origin)
        );
      },
      credentials: false,
    })
  );

  app.use(express.json({ limit: '100kb' }));

  const seeded = <T>(items: T[]) =>
    () => config.demoMode ? structuredClone(items) : [];

  /*
   * Local stores are still kept because several existing
   * HealOps features use them.
   *
   * Projects and Pipelines are now synchronized with Firebase.
   */
  const projects = new JsonStore<Project>(
    path.join(config.dataDir, 'projects.json'),
    seeded(mockProjects)
  );

  const pipelines = new JsonStore<Pipeline>(
    path.join(config.dataDir, 'pipelines.json'),
    seeded(mockPipelines)
  );

  const deployments = new JsonStore<Deployment>(
    path.join(config.dataDir, 'deployments.json'),
    seeded(mockDeployments)
  );

  const vulnerabilities = new JsonStore<Vulnerability>(
    path.join(config.dataDir, 'vulnerabilities.json'),
    seeded(mockVulnerabilities)
  );

  const incidents = new JsonStore<Incident>(
    path.join(config.dataDir, 'incidents.json'),
    seeded(mockIncidents)
  );

  const notifications = new JsonStore<NotificationItem>(
    path.join(config.dataDir, 'notifications.json'),
    seeded(mockNotifications)
  );

  const audits = new JsonStore<AuditLog>(
    path.join(config.dataDir, 'audits.json'),
    seeded(mockAuditLogs)
  );

  const logs = new JsonStore<LogEntry>(
    path.join(config.dataDir, 'logs.json'),
    seeded(mockTerminalLogs)
  );

  const services = new JsonStore<ServiceHealth>(
    path.join(config.dataDir, 'services.json'),
    seeded(initialServicesHealth)
  );

  const users = new JsonStore<User>(
    path.join(config.dataDir, 'users.json'),
    seeded(mockUsers)
  );

  await Promise.all(
    [
      projects,
      pipelines,
      deployments,
      vulnerabilities,
      incidents,
      notifications,
      audits,
      logs,
      services,
      users
    ].map((store) => store.init())
  );

  /*
   * ---------------------------------------------------------
   * FIREBASE HELPERS
   * ---------------------------------------------------------
   */

  const saveProjectToFirebase = async (
    project: Project
  ) => {
    await db
      .collection('projects')
      .doc(project.id)
      .set(project);
  };

  const getProjectFromFirebase = async (
    projectId: string
  ): Promise<Project | undefined> => {
    const doc = await db
      .collection('projects')
      .doc(projectId)
      .get();

    if (!doc.exists) {
      return undefined;
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Project;
  };

  const getProjectsFromFirebase = async (): Promise<Project[]> => {
    const snapshot = await db
      .collection('projects')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  };

  const savePipelineToFirebase = async (
    pipeline: Pipeline
  ) => {
    await db
      .collection('pipelines')
      .doc(pipeline.id)
      .set(pipeline);
  };

  const getPipelineFromFirebase = async (
    pipelineId: string
  ): Promise<Pipeline | undefined> => {
    const doc = await db
      .collection('pipelines')
      .doc(pipelineId)
      .get();

    if (!doc.exists) {
      return undefined;
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Pipeline;
  };

  const getPipelinesFromFirebase = async (): Promise<Pipeline[]> => {
    const snapshot = await db
      .collection('pipelines')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Pipeline[];
  };

  /*
   * ---------------------------------------------------------
   * SERVICES
   * ---------------------------------------------------------
   */

  const ai = new AIService();
  const healing = new SelfHealingEngine();
  const pipelineEngine = new PipelineEngine();

  const clients = new Set<Response>();

  const emit = (
    event: string,
    payload: unknown
  ) => {
    const body = JSON.stringify({
      event,
      payload,
      timestamp: now()
    });

    for (const client of clients) {
      client.write(
        `event: ${event}\ndata: ${body}\n\n`
      );
    }
  };

  const audit = async (
    req: Request,
    action: string,
    resource: string,
    resourceId: string,
    result: AuditLog['result'],
    details?: string
  ) => {
    await audits.add({
      id: id('audit'),
      user: req.actor?.email || 'unknown',
      action,
      resource,
      resourceId,
      timestamp: now(),
      result,
      details
    });
  };

  const operationalRoles: UserRole[] = [
    'ADMIN',
    'DEVOPS_ENGINEER'
  ];

  /*
   * ---------------------------------------------------------
   * API DOCUMENTATION
   * ---------------------------------------------------------
   */

  app.get(
    '/api-docs',
    (_req, res) =>
      res.type('html').send(renderSwaggerHtml())
  );

  app.get(
    '/api-docs/json',
    (_req, res) =>
      res.json(openApiSpec)
  );

  /*
   * Authentication middleware
   */
  app.use('/api', authenticate);

  /*
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  app.get('/api/events', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    res.flushHeaders();

    clients.add(res);

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        message:
          'Authenticated HealOps event stream connected.'
      })}\n\n`
    );

    req.on('close', () => {
      clients.delete(res);
    });
  });

  /*
   * ---------------------------------------------------------
   * AUTH
   * ---------------------------------------------------------
   */

  app.get(
    '/api/auth/me',
    (req, res) =>
      res.json({
        success: true,
        data: req.actor
      })
  );

  app.post(
    '/api/auth/sync',
    (req, res) =>
      fail(
        res,
        501,
        'Identity sync must be implemented by your configured identity provider; API clients use verified Bearer tokens.'
      )
  );

  /*
   * =========================================================
   * PROJECTS - FIREBASE
   * =========================================================
   */

  app.get('/api/projects', async (_req, res) => {
    try {
      const firebaseProjects =
        await getProjectsFromFirebase();

      if (firebaseProjects.length > 0) {
        return res.json({
          success: true,
          data: firebaseProjects
        });
      }
    } catch (error) {
      console.warn(
        'Firebase projects fetch notice (using local store):',
        error
      );
    }

    return res.json({
      success: true,
      data: projects.all()
    });
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const firebaseProject =
        await getProjectFromFirebase(req.params.id);

      if (firebaseProject) {
        return res.json({
          success: true,
          data: firebaseProject
        });
      }
    } catch (error) {
      console.warn(
        'Failed to fetch project from Firebase, falling back to local store:',
        error
      );
    }

    const localProject =
      projects.find(req.params.id);

    if (localProject) {
      return res.json({
        success: true,
        data: localProject
      });
    }

    return fail(
      res,
      404,
      'Project not found.'
    );
  });

  app.post(
    '/api/projects',
    authorize(...operationalRoles),
    async (req, res) => {
      try {
        const repository = text(
          req.body.repository,
          'repository',
          500
        );

        if (
          !/^https:\/\/[^\s]+$|^git@[^\s]+$/.test(
            repository
          )
        ) {
          throw new Error(
            'repository must be an HTTPS or SSH Git URL.'
          );
        }

        const project: Project = {
          id: id('proj'),
          name: text(req.body.name, 'name'),
          repository,
          branch: text(
            req.body.branch || 'main',
            'branch',
            100
          ),
          healthScore: 100,
          securityScore: 0,
          status: 'HEALTHY',
          lastDeployment: 'Never',
          lastPipelineStatus: 'PENDING',
          description: text(
            req.body.description ||
            'Managed service',
            'description',
            1000
          ),
          environment: enumValue(
            req.body.environment ||
            'development',
            'environment',
            [
              'development',
              'testing',
              'staging',
              'production'
            ]
          )
        };

        /*
         * Save project to Firebase
         */
        try {
          await saveProjectToFirebase(
            project
          );

          console.log(
            `[Firebase] Project ${project.id} saved successfully.`
          );
        } catch (dbError) {
          console.warn(
            'Firebase project sync warning:',
            dbError
          );
        }

        /*
         * Keep local copy for compatibility
         * with existing HealOps services.
         */
        await projects.add(project);

        await audit(
          req,
          'PROJECT_CREATED',
          project.name,
          project.id,
          'SUCCESS'
        );

        emit(
          'project:created',
          project
        );

        res.status(201).json({
          success: true,
          data: project
        });

      } catch (error) {
        console.error(
          'Failed to save project:',
          error
        );

        fail(
          res,
          400,
          error instanceof Error
            ? error.message
            : 'Invalid project request.'
        );
      }
    }
  );


  /*
   * =========================================================
   * PIPELINES - FIREBASE
   * =========================================================
   */

  /*
   * GET ALL PIPELINES
   */
  app.get(
    '/api/pipelines',
    async (_req, res) => {
      const normalizePipeline = (p: Pipeline): Pipeline => ({
        ...p,
        stages: Array.isArray(p.stages) && p.stages.length > 0
          ? p.stages
          : pipelineEngine.createDefaultStages()
      });

      const localPipelines = pipelines.all().map(normalizePipeline);

      try {
        const firebasePipelines =
          await getPipelinesFromFirebase();

        if (firebasePipelines.length > 0) {
          const map = new Map<string, Pipeline>();
          for (const lp of localPipelines) {
            map.set(lp.id, lp);
          }
          for (const fp of firebasePipelines) {
            map.set(fp.id, normalizePipeline(fp));
          }
          return res.json({
            success: true,
            data: Array.from(map.values())
          });
        }
      } catch (error) {
        console.warn(
          'Firebase pipelines fetch notice (using local store):',
          error
        );
      }

      return res.json({
        success: true,
        data: localPipelines
      });
    }
  );

  /*
   * GET SINGLE PIPELINE
   */
  app.get(
    '/api/pipelines/:id',
    async (req, res) => {
      const normalizePipeline = (p: Pipeline): Pipeline => ({
        ...p,
        stages: Array.isArray(p.stages) && p.stages.length > 0
          ? p.stages
          : pipelineEngine.createDefaultStages()
      });

      try {
        const firebasePipeline =
          await getPipelineFromFirebase(
            req.params.id
          );

        if (firebasePipeline) {
          return res.json({
            success: true,
            data: normalizePipeline(firebasePipeline)
          });
        }
      } catch (error) {
        console.warn(
          'Failed to fetch pipeline from Firebase, falling back to local store:',
          error
        );
      }

      const localPipeline =
        pipelines.find(req.params.id);

      if (localPipeline) {
        return res.json({
          success: true,
          data: normalizePipeline(localPipeline)
        });
      }

      return fail(
        res,
        404,
        'Pipeline not found.'
      );
    }
  );

  /*
   * RUN PIPELINE
   */
  app.post(
    '/api/pipelines/:id/run',
    authorize(...operationalRoles),
    async (req, res) => {

      /*
       * Try Firebase first for existing pipeline
       */
      let existing: Pipeline | undefined;

      try {
        existing =
          await getPipelineFromFirebase(
            req.params.id
          );
      } catch (error) {
        console.warn(
          'Firebase existing pipeline lookup failed:',
          error
        );
      }

      /*
       * Fall back to local store
       */
      if (!existing) {
        existing =
          pipelines.find(req.params.id);
      }

      const projectId =
        existing?.projectId ||
        req.body.projectId;

      let project: Project | undefined;

      /*
       * Try Firebase project
       */
      if (typeof projectId === 'string') {
        try {
          project =
            await getProjectFromFirebase(
              projectId
            );
        } catch (error) {
          console.warn(
            'Firebase project lookup failed:',
            error
          );
        }
      }

      /*
       * Fall back to local project
       */
      if (!project && typeof projectId === 'string') {
        project =
          projects.find(projectId);
      }

      if (!project) {
        return fail(
          res,
          404,
          'A valid projectId is required to run a pipeline.'
        );
      }

      /*
       * Create new pipeline
       */
      const pipeline: Pipeline = {
        id: id('pipe'),
        projectId: project.id,
        projectName: project.name,
        commitHash: String(
          req.body.commitHash ||
          'pending'
        ).slice(0, 64),
        commitMessage: String(
          req.body.commitMessage ||
          'Manual pipeline run'
        ).slice(0, 500),
        author: req.actor!.name,
        branch: project.branch,
        status: 'PENDING',
        startedAt: now(),
        durationSeconds: 0,
        stages:
          pipelineEngine.createDefaultStages()
      };

      /*
       * Save pipeline to Firebase
       */
      try {
        await savePipelineToFirebase(
          pipeline
        );

        console.log(
          `[Firebase] Pipeline ${pipeline.id} saved successfully.`
        );
      } catch (error) {
        console.warn(
          'Firebase pipeline save warning:',
          error
        );
      }

      /*
       * Keep local copy as fallback
       */
      await pipelines.add(pipeline);

      await audit(
        req,
        'PIPELINE_STARTED',
        project.name,
        pipeline.id,
        'PENDING'
      );

      emit(
        'pipeline:started',
        pipeline
      );

      res.status(202).json({
        success: true,
        message:
          'Pipeline accepted for execution.',
        data: pipeline
      });

      /*
       * Execute pipeline asynchronously
       */
      void pipelineEngine
        .executePipeline(
          pipeline,

          config.demoMode &&
          req.body.failHealthCheck === true,

          async (
            updated,
            message
          ) => {

            /*
             * Save pipeline stage update
             * to Firebase
             */
            try {
              await savePipelineToFirebase(
                updated
              );
            } catch (error) {
              console.warn(
                'Firebase pipeline stage update warning:',
                error
              );
            }

            /*
             * Save pipeline stage update
             * locally too
             */
            await pipelines.save();

            /*
             * Save terminal log
             */
            await logs.add({
              id: id('log'),
              timestamp: now(),
              level:
                updated.status === 'FAILED'
                  ? 'ERROR'
                  : 'INFO',
              service: project!.name,
              environment:
                project!.environment ===
                  'production'
                  ? 'Production'
                  : 'Staging',
              message
            });

            emit(
              'pipeline:stage',
              {
                pipeline: updated,
                log: message
              }
            );
          },

          project.repository
        )
        .then(
          async (finished) => {

            /*
             * Update project pipeline status
             */
            project!.lastPipelineStatus =
              finished.status;

            /*
             * Save project to Firebase
             */
            try {
              await saveProjectToFirebase(
                project!
              );
            } catch (error) {
              console.warn(
                'Firebase project pipeline status update warning:',
                error
              );
            }

            /*
             * Save project locally
             */
            await projects.save();

            /*
             * Save final pipeline state
             * to Firebase
             */
            try {
              await savePipelineToFirebase(
                finished
              );

              console.log(
                `[Firebase] Final pipeline ${finished.id} state saved.`
              );
            } catch (error) {
              console.warn(
                'Firebase final pipeline save warning:',
                error
              );
            }

            /*
             * Save final pipeline locally
             */
            await pipelines.save();

            /*
             * Audit
             */
            await audit(
              req,
              'PIPELINE_COMPLETED',
              project!.name,
              finished.id,
              finished.status === 'SUCCESS'
                ? 'SUCCESS'
                : 'FAILURE'
            );

            /*
             * Notify frontend
             */
            emit(
              'pipeline:completed',
              finished
            );
          }
        )
        .catch(async (error) => {
          console.error(
            'Pipeline execution error:',
            error
          );

          try {
            await audit(
              req,
              'PIPELINE_EXECUTION_ERROR',
              project!.name,
              pipeline.id,
              'FAILURE',
              String(error)
            );
          } catch {
            // Ignore audit failure
          }
        });
    }
  );

  /*
   * CANCEL PIPELINE
   */
  app.post(
    '/api/pipelines/:id/cancel',
    authorize(...operationalRoles),
    async (req, res) => {

      const pipeline =
        pipelines.find(req.params.id);

      if (!pipeline) {
        return fail(
          res,
          404,
          'Pipeline not found.'
        );
      }

      if (
        !pipelineEngine.cancelPipeline(
          pipeline.id
        )
      ) {
        return fail(
          res,
          409,
          'Pipeline is not running.'
        );
      }

      await audit(
        req,
        'PIPELINE_CANCEL_REQUESTED',
        pipeline.projectName,
        pipeline.id,
        'PENDING'
      );

      res.status(202).json({
        success: true,
        message:
          'Pipeline cancellation requested.'
      });
    }
  );

  /*
   * =========================================================
   * DEPLOYMENTS
   * =========================================================
   */

  app.get(
    '/api/deployments',
    (_req, res) =>
      res.json({
        success: true,
        data: deployments.all()
      })
  );

  app.post(
    '/api/deployments/:id/rollback',
    authorize('ADMIN'),
    async (req, res) => {

      const deployment =
        deployments.find(req.params.id);

      if (!deployment) {
        return fail(
          res,
          404,
          'Deployment not found.'
        );
      }

      if (!config.demoMode) {
        try {
          await runCommand(
            config.kubectlBin,
            [
              'rollout',
              'undo',
              `deployment/${deployment.projectId}`,
              '--namespace',
              config.namespace
            ]
          );
        } catch (error) {

          await audit(
            req,
            'DEPLOYMENT_ROLLBACK',
            deployment.projectName,
            deployment.id,
            'FAILURE',
            String(error)
          );

          return fail(
            res,
            502,
            'Kubernetes rollback failed; deployment state was not changed.'
          );
        }
      }

      deployment.status =
        'ROLLED_BACK';

      await deployments.save();

      await audit(
        req,
        'DEPLOYMENT_ROLLBACK',
        deployment.projectName,
        deployment.id,
        'SUCCESS'
      );

      emit(
        'deployment:rollback',
        deployment
      );

      res.json({
        success: true,
        data: deployment
      });
    }
  );

  /*
   * =========================================================
   * SECURITY
   * =========================================================
   */

  app.get(
    '/api/security/vulnerabilities',
    (_req, res) =>
      res.json({
        success: true,
        data: vulnerabilities.all()
      })
  );

  app.post(
    '/api/security/scan',
    authorize(
      'ADMIN',
      'SECURITY_ENGINEER'
    ),
    async (req, res) => {

      const project =
        projects.find(req.body.projectId);

      if (!project) {
        return fail(
          res,
          404,
          'A valid projectId is required for a security scan.'
        );
      }

      if (!config.demoMode) {
        return fail(
          res,
          409,
          'Run a pipeline first; scans operate on the isolated pipeline workspace and are recorded as pipeline stages.'
        );
      }

      const notification: NotificationItem = {
        id: id('notif'),
        title:
          'Demo security scan completed',
        message:
          `Simulation completed for ${project.name}.`,
        type: 'SECURITY',
        severity: 'INFO',
        read: false,
        timestamp: now(),
        relatedEntityId: project.id
      };

      await notifications.add(
        notification
      );

      await audit(
        req,
        'SECURITY_SCAN',
        project.name,
        project.id,
        'SUCCESS'
      );

      emit(
        'security:scan-completed',
        notification
      );

      res.json({
        success: true,
        message:
          'Demo scan completed. Live scans run inside a pipeline.',
        data: {
          findingsCount:
            vulnerabilities.all().length
        }
      });
    }
  );

  app.put(
    '/api/security/vulnerabilities/:id/resolve',
    authorize(
      'ADMIN',
      'SECURITY_ENGINEER'
    ),
    async (req, res) => {

      const finding =
        vulnerabilities.find(req.params.id);

      if (!finding) {
        return fail(
          res,
          404,
          'Vulnerability not found.'
        );
      }

      finding.status =
        'RESOLVED';

      await vulnerabilities.save();

      await audit(
        req,
        'VULNERABILITY_RESOLVED',
        finding.cveId,
        finding.id,
        'SUCCESS'
      );

      emit(
        'security:updated',
        finding
      );

      res.json({
        success: true,
        data: finding
      });
    }
  );

  /*
   * =========================================================
   * MONITORING
   * =========================================================
   */

  app.get(
    '/api/monitoring/metrics',
    async (req, res) => {

      const hours = Math.min(
        Math.max(
          Number.parseInt(
            String(
              req.query.hours || '24'
            ),
            10
          ) || 24,
          1
        ),
        168
      );

      if (config.demoMode) {
        return res.json({
          success: true,
          data:
            generateMetricPoints(
              hours
            )
        });
      }

      if (!config.prometheusUrl) {
        return fail(
          res,
          503,
          'PROMETHEUS_URL is not configured.'
        );
      }

      try {
        const result =
          await fetch(
            `${config.prometheusUrl}/api/v1/query_range?query=up&start=${Math.floor(Date.now() / 1000) - hours * 3600}&end=${Math.floor(Date.now() / 1000)}&step=60`
          );

        if (!result.ok) {
          throw new Error(
            `HTTP ${result.status}`
          );
        }

        res.json({
          success: true,
          data:
            await result.json()
        });

      } catch {
        fail(
          res,
          502,
          'Prometheus query failed.'
        );
      }
    }
  );

  app.get(
    '/api/monitoring/health',
    (_req, res) => {

      const allServices =
        services.all();

      const healthy =
        allServices.filter(
          (service) =>
            service.status === 'HEALTHY'
        ).length;

      res.json({
        success: true,
        data: {
          systemScore:
            allServices.length
              ? Math.round(
                healthy /
                allServices.length *
                100
              )
              : 0,

          status:
            healthy ===
              allServices.length
              ? 'HEALTHY'
              : 'DEGRADED',

          services: allServices
        }
      });
    }
  );

  /*
   * =========================================================
   * INCIDENTS
   * =========================================================
   */

  app.get(
    '/api/incidents',
    (_req, res) =>
      res.json({
        success: true,
        data: incidents.all()
      })
  );

  app.post(
    '/api/incidents',
    authorize(...operationalRoles),
    async (req, res) => {

      try {

        const incident: Incident = {
          id: id('inc'),
          title: text(
            req.body.title,
            'title',
            500
          ),
          severity: enumValue(
            req.body.severity,
            'severity',
            [
              'CRITICAL',
              'HIGH',
              'MEDIUM',
              'LOW'
            ]
          ),
          service: text(
            req.body.service,
            'service',
            100
          ),
          environment:
            enumValue(
              req.body.environment,
              'environment',
              [
                'Development',
                'Testing',
                'Staging',
                'Production'
              ]
            ),
          status: 'OPEN',
          detectedTime: now(),
          assignedEngineer:
            req.actor!.email,
          description: text(
            req.body.description,
            'description',
            2000
          ),
          errorRate:
            Number(
              req.body.errorRate || 0
            ),
          latencyMs:
            Number(
              req.body.latencyMs || 0
            ),
          healingActions: []
        };

        if (
          !Number.isFinite(
            incident.errorRate
          ) ||
          !Number.isFinite(
            incident.latencyMs
          )
        ) {
          throw new Error(
            'errorRate and latencyMs must be numbers.'
          );
        }

        await incidents.add(
          incident
        );

        await audit(
          req,
          'INCIDENT_CREATED',
          incident.service,
          incident.id,
          'SUCCESS'
        );

        emit(
          'incident:created',
          incident
        );

        res.status(201).json({
          success: true,
          data: incident
        });

      } catch (error) {

        fail(
          res,
          400,
          error instanceof Error
            ? error.message
            : 'Invalid incident request.'
        );
      }
    }
  );

  app.post(
    '/api/incidents/simulate',
    authorize(...operationalRoles),
    async (req, res) => {

      if (!config.demoMode) {
        return fail(
          res,
          403,
          'Incident simulation is disabled outside DEMO_MODE. Use POST /api/incidents.'
        );
      }

      const incident: Incident = {
        id: id('inc'),
        title:
          'Simulated Payment API latency incident',
        severity: 'CRITICAL',
        service:
          'Payment Service',
        environment:
          'Production',
        status:
          'INVESTIGATING',
        detectedTime: now(),
        assignedEngineer:
          req.actor!.email,
        description:
          'Demo-only simulated incident.',
        errorRate: 18.4,
        latencyMs: 342,
        healingActions: [
          {
            id: id('heal'),
            incidentId: '',
            actionType:
              'RESTART_POD',
            description:
              'Demo restart pod',
            riskLevel:
              'LOW',
            requiresApproval:
              false,
            status:
              'PENDING',
            currentStep:
              'DETECT',
            verifiedHealthy:
              false,
            auditMessage:
              'Pending demo action'
          }
        ]
      };

      incident.healingActions[0].incidentId =
        incident.id;

      incident.aiAnalysis =
        await ai.analyzeIncident(
          incident
        );

      await incidents.add(
        incident
      );

      emit(
        'incident:created',
        incident
      );

      res.json({
        success: true,
        data: incident
      });
    }
  );

  /*
   * =========================================================
   * SELF HEALING
   * =========================================================
   */

  app.get(
    '/api/self-healing/actions',
    (_req, res) =>
      res.json({
        success: true,
        data: incidents
          .all()
          .flatMap(
            (incident) =>
              incident.healingActions
          )
      })
  );

  app.post(
    '/api/self-healing/execute',
    authorize(...operationalRoles),
    async (req, res) => {

      const incident =
        typeof req.body.incidentId === 'string'
          ? incidents.find(
            req.body.incidentId
          )
          : undefined;

      const action =
        incident &&
          typeof req.body.actionId === 'string'
          ? incident.healingActions.find(
            (item) =>
              item.id ===
              req.body.actionId
          )
          : undefined;

      if (!incident || !action) {
        return fail(
          res,
          404,
          'Incident or healing action not found.'
        );
      }

      const approved =
        req.body.approved === true &&
        req.actor!.role === 'ADMIN';

      try {

        const result =
          await healing.runHealingSequence(
            incident,
            action,
            (
              step,
              updated
            ) =>
              emit(
                'healing:step',
                {
                  step,
                  action: updated
                }
              ),
            {
              approved,
              replicas:
                req.body.replicas
            }
          );

        incident.status =
          'RESOLVED';

        incident.resolvedTime =
          now();

        await incidents.save();

        await audit(
          req,
          'SELF_HEALING_EXECUTED',
          incident.service,
          action.id,
          'SUCCESS',
          action.auditMessage
        );

        emit(
          'healing:completed',
          {
            action,
            incident
          }
        );

        res.json({
          success: true,
          data: result
        });

      } catch (error) {

        await incidents.save();

        await audit(
          req,
          'SELF_HEALING_EXECUTED',
          incident.service,
          action.id,
          'FAILURE',
          String(error)
        );

        fail(
          res,
          /approval|cooldown/i.test(
            String(error)
          )
            ? 409
            : 502,
          error instanceof Error
            ? error.message
            : 'Healing failed.'
        );
      }
    }
  );

  /*
   * =========================================================
   * AI
   * =========================================================
   */

  app.post(
    '/api/ai/chat',
    async (req, res) => {

      try {

        const message =
          text(
            req.body.message,
            'message',
            4000
          );

        const data =
          await ai.chatAssistant(
            message,
            Array.isArray(
              req.body.history
            )
              ? req.body.history.slice(
                -20
              )
              : []
          );

        res.json({
          success: true,
          data: {
            text:
              data.explanation,
            ...data
          }
        });

      } catch (error) {

        fail(
          res,
          400,
          error instanceof Error
            ? error.message
            : 'Invalid AI request.'
        );
      }
    }
  );

  app.post(
    '/api/ai/analyze-incident',
    async (req, res) => {

      const incident =
        typeof req.body.incidentId === 'string'
          ? incidents.find(
            req.body.incidentId
          )
          : undefined;

      if (!incident) {
        return fail(
          res,
          404,
          'Incident not found.'
        );
      }

      const analysis =
        await ai.analyzeIncident(
          incident
        );

      incident.aiAnalysis =
        analysis;

      await incidents.save();

      res.json({
        success: true,
        data: analysis
      });
    }
  );

  /*
   * =========================================================
   * LOGS
   * =========================================================
   */

  app.get(
    '/api/logs',
    (_req, res) =>
      res.json({
        success: true,
        data: logs.all()
      })
  );

  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */

  app.get(
    '/api/notifications',
    (_req, res) =>
      res.json({
        success: true,
        data: notifications.all()
      })
  );

  app.put(
    '/api/notifications/:id/read',
    async (req, res) => {

      const notice =
        notifications.find(
          req.params.id
        );

      if (!notice) {
        return fail(
          res,
          404,
          'Notification not found.'
        );
      }

      notice.read = true;

      await notifications.save();

      res.json({
        success: true,
        data: notice
      });
    }
  );

  /*
   * =========================================================
   * AUDIT LOGS
   * =========================================================
   */

  app.get(
    '/api/audit-logs',
    authorize(
      'ADMIN',
      'SECURITY_ENGINEER'
    ),
    (_req, res) =>
      res.json({
        success: true,
        data: audits.all()
      })
  );

  /*
   * =========================================================
   * TEAM
   * =========================================================
   */

  app.get(
    '/api/team',
    authorize('ADMIN'),
    (_req, res) =>
      res.json({
        success: true,
        data: users.all()
      })
  );

  /*
   * =========================================================
   * FRONTEND / VITE
   * =========================================================
   */

  if (
    process.env.NODE_ENV !==
    'production'
  ) {

    const vite =
      await createViteServer({
        server: {
          middlewareMode: true
        },
        appType: 'spa'
      });

    app.use(
      vite.middlewares
    );

  } else {

    const dist =
      path.join(
        process.cwd(),
        'dist'
      );

    app.use(
      express.static(dist)
    );

    app.get(
      '*',
      (_req, res) =>
        res.sendFile(
          path.join(
            dist,
            'index.html'
          )
        )
    );
  }

  /*
   * =========================================================
   * START SERVER
   * =========================================================
   */

  app.listen(
    config.port,
    '0.0.0.0',
    () =>
      console.log(
        `[HealOps] ${config.demoMode
          ? 'DEMO'
          : 'LIVE'
        } server listening on 0.0.0.0:${config.port}`
      )
  );
}

startServer().catch(
  (error) => {
    console.error(
      '[HealOps] startup failed',
      error
    );

    process.exitCode = 1;
  }
);