import { Request, Response, NextFunction } from 'express';
import { MongoDataServices } from '../frameworks/mongo';
import { ActivityHitBy }     from '../core/entities/booking-activity-log.entity';
import { API_KEY_HEADER }    from '../utils/constants';

const dataServices = new MongoDataServices();

function resolveHitBy(req: Request): ActivityHitBy {
  const hasBearer = req.headers['authorization']?.startsWith('Bearer ') ?? false;
  const hasApiKey = Boolean(req.headers[API_KEY_HEADER] ?? req.body?.api_key);

  if (hasBearer && hasApiKey) return ActivityHitBy.JWT_AND_API_KEY;
  if (hasBearer)              return ActivityHitBy.JWT;
  if (hasApiKey)               return ActivityHitBy.API_KEY;
  return ActivityHitBy.ANONYMOUS;
}

/**
 * Records every GET/POST/PATCH hit on the booking module into one
 * `booking_activity_logs` collection: method, endpoint, booking_id (when
 * present in the route params), response status code, response time, the
 * caller's JWT user_id (if any), how the request was authenticated, and IP.
 *
 * Placed BEFORE bookingAuth so even rejected (401/403) attempts are captured —
 * this is an audit trail, not just a success log. Logging runs on res.on('finish')
 * so it never delays the actual response, and failures to persist a log entry
 * are swallowed (an audit-log write must never break the underlying API call).
 */
export function bookingActivityLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on('finish', () => {
    void dataServices.bookingActivityLogs.create({
      method:           req.method,
      endpoint:         req.originalUrl,
      booking_id:       req.params['id'],
      status_code:      res.statusCode,
      response_time_ms: Date.now() - startedAt,
      user_id:          req.user?.user_id,
      hit_by:           resolveHitBy(req),
      ip:               req.ip,
    }).catch(err => console.error('[BookingActivityLog] failed to record entry:', err));
  });

  next();
}
