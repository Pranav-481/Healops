import { NextFunction, Request, Response } from 'express';
import { User, UserRole } from '../../../src/types';
import { config } from './config';
import { adminAuth } from '../../../firebaseAdmin';

declare global {
  namespace Express {
    interface Request {
      actor?: User;
    }
  }
}

const roles = new Set<UserRole>([
  'ADMIN',
  'DEVOPS_ENGINEER',
  'DEVELOPER',
  'SECURITY_ENGINEER',
  'VIEWER',
]);

function userFromApiToken(token: string): User | undefined {
  for (const entry of config.apiTokens) {
    const [expectedToken, email, role] = entry.split(':');

    if (
      expectedToken === token &&
      email &&
      role &&
      roles.has(role as UserRole)
    ) {
      return {
        id: `api-${email}`,
        email,
        name: email.split('@')[0],
        role: role as UserRole,
        status: 'ACTIVE',
        lastActive: new Date().toISOString(),
      };
    }
  }

  return undefined;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (config.demoMode) {
    req.actor = {
      id: 'demo-admin',
      name: 'Demo Administrator',
      email: 'demo@healops.local',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastActive: 'Just now',
    };

    return next();
  }

  const value = req.header('authorization');
  const token = value?.startsWith('Bearer ')
    ? value.slice(7)
    : '';

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'A valid Bearer token is required.',
    });
  }

  // First support the existing API_TOKENS mechanism.
  const apiActor = userFromApiToken(token);

  if (apiActor) {
    req.actor = apiActor;
    return next();
  }

  // Otherwise verify the token as a Firebase ID token.
  try {
    const decoded = await adminAuth.verifyIdToken(token);

    const claimRole = decoded.role as UserRole | undefined;

    const role: UserRole =
      claimRole && roles.has(claimRole)
        ? claimRole
        : 'DEVELOPER';

    req.actor = {
      id: decoded.uid,
      email: decoded.email || `${decoded.uid}@firebase.local`,
      name:
        decoded.name ||
        decoded.email?.split('@')[0] ||
        'HealOps User',
      role,
      status: 'ACTIVE',
      lastActive: new Date().toISOString(),
    };

    return next();
  } catch (error) {
    console.error('[Auth] Firebase token verification failed:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}

export function authorize(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.actor ||
      !allowed.includes(req.actor.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Your role is not allowed to perform this action.',
      });
    }

    next();
  };
}
