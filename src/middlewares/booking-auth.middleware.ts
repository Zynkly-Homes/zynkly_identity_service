import { Request, Response, NextFunction } from 'express';
import { authMiddleware }     from './auth.middleware';
import { apiKeyMiddleware }   from './api-key.middleware';
import { requirePermission }  from './permission.middleware';
import { PermissionAction }   from '../core/entities/role.entity';

/**
 * Run an ordered list of Express middlewares in sequence.
 * If any middleware does not call next() (i.e. it sends a response), the chain stops.
 */
function runChain(
  fns: Array<(req: Request, res: Response, next: NextFunction) => void>,
  req: Request,
  res: Response,
  done: NextFunction,
): void {
  const step = (i: number): void => {
    if (i >= fns.length) return done();
    fns[i]!(req, res, (err?: unknown) => {
      if (err) return done(err as Error);
      step(i + 1);
    });
  };
  step(0);
}

/**
 * JWT-first, API-key fallback auth gate for booking routes.
 *
 * - Bearer token present → full JWT validation + server-side session check + RBAC permission
 * - No Bearer token     → API key validation (sets req.isApiKeyAuthenticated = true)
 * - Neither present     → 401 from apiKeyMiddleware
 *
 * This allows CRM clients to call booking APIs with just an API key when no
 * user session is available, while still enforcing RBAC for JWT-authenticated users.
 */
export function bookingAuth(moduleId: string, action: PermissionAction) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const hasBearer = req.headers['authorization']?.startsWith('Bearer ') ?? false;

    if (hasBearer) {
      runChain([authMiddleware, requirePermission(moduleId, action)], req, res, next);
    } else {
      apiKeyMiddleware(req, res, next);
    }
  };
}
