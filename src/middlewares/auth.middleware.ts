import { Request, Response, NextFunction } from 'express';
import jwt               from 'jsonwebtoken';
import { User }          from '../frameworks/mongo/model/user.model';
import { IJwtPayload }   from '../core/entities/user.entity';

/**
 * authMiddleware — Layer 1 of the security chain.
 *
 * TWO-STEP verification:
 *
 *  Step 1 — JWT signature check (stateless, no DB)
 *    - Extract the Bearer token from the Authorization header.
 *    - Verify the signature with JWT_SECRET and check it has not expired.
 *    - If invalid → 401.
 *
 *  Step 2 — Live user status check (DB lookup)
 *    - Even if the JWT is valid, the user account may have been
 *      deactivated by an admin AFTER the token was issued.
 *    - We query the DB for { _id: user_id, is_active } to catch that.
 *    - If the user does not exist or is inactive → 401.
 *    - This ensures deactivated users lose access immediately on the
 *      next request, without waiting for the token to expire.
 *
 *  On success → attaches decoded payload to req.user and calls next().
 *
 * Usage in routes:
 *   router.use(authMiddleware);             // protect all routes in router
 *   router.get('/path', authMiddleware, handler);  // protect single route
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {

  // ── Step 1: Extract and verify JWT ─────────────────────────────────────
  const authHeader = req.headers['authorization'];
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Authorization token is required. Pass it as: Authorization: Bearer <token>',
    });
    return;
  }

  let decoded: IJwtPayload;
  try {
    const secret = process.env['JWT_SECRET'] ?? 'change_me';
    decoded      = jwt.verify(token, secret) as IJwtPayload;
  } catch (err) {
    // jwt.verify throws JsonWebTokenError (invalid) or TokenExpiredError (expired)
    const isExpired = (err as Error).name === 'TokenExpiredError';
    res.status(401).json({
      success: false,
      message: isExpired
        ? 'Unauthorized: Token has expired. Please login again.'
        : 'Unauthorized: Invalid token.',
    });
    return;
  }

  // ── Step 2: Check the user is still active in the database ─────────────
  // We select only the is_active field to keep this query lightweight.
  const user = await User.findById(decoded.user_id).select('is_active');

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: User account not found.',
    });
    return;
  }

  if (!user.is_active) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Your account has been deactivated. Please contact the administrator.',
    });
    return;
  }

  // ── Attach decoded payload so downstream middleware/controllers can use it
  req.user = decoded;
  next();
}
