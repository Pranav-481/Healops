import { NextFunction, Request, Response } from 'express';
import { User, UserRole } from '../../../src/types';
import { config } from './config';

declare global {
  namespace Express { interface Request { actor?: User } }
}

const roles = new Set<UserRole>(['ADMIN', 'DEVOPS_ENGINEER', 'DEVELOPER', 'SECURITY_ENGINEER', 'VIEWER']);

function userFromToken(token: string): User | undefined {
  // API_TOKENS format: opaque-token:email:ROLE. Keep tokens in a secret manager, never in source control.
  for (const entry of config.apiTokens) {
    const [expectedToken, email, role] = entry.split(':');
    if (expectedToken === token && email && role && roles.has(role as UserRole)) {
      return { id: `api-${email}`, email, name: email.split('@')[0], role: role as UserRole, status: 'ACTIVE', lastActive: new Date().toISOString() };
    }
  }
  return undefined;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  if (config.demoMode) {
    req.actor = { id: 'demo-admin', name: 'Demo Administrator', email: 'demo@healops.local', role: 'ADMIN', status: 'ACTIVE', lastActive: 'Just now' };
    return next();
  }
  const value = req.header('authorization');
  const token = value?.startsWith('Bearer ') ? value.slice(7) : '';
  const actor = token ? userFromToken(token) : undefined;
  if (!actor) return res.status(401).json({ success: false, message: 'A valid Bearer API token is required.' });
  req.actor = actor;
  next();
}

export function authorize(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.actor || !allowed.includes(req.actor.role)) return res.status(403).json({ success: false, message: 'Your role is not allowed to perform this action.' });
    next();
  };
}
