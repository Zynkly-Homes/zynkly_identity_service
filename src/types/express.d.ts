import { IJwtPayload } from '../core/entities/user.entity';

/**
 * Augments the Express Request type to include the authenticated user payload.
 * Set by jwtAuth middleware after token verification.
 */
declare global {
  namespace Express {
    interface Request {
      user?:                 IJwtPayload;
      isApiKeyAuthenticated?: boolean;
    }
  }
}
