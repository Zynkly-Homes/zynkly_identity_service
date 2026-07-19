import { Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from './api-key.middleware';

/**
 * POST /cleaner-bookings — API key is required ONLY when an initial `payments`
 * history is being supplied at creation time (pre-loading financial records).
 * A plain cleaner profile create (name/address/mobile/joined_at) is self-service.
 */
export function conditionalCleanerBookingCreateApiKey(
  req: Request, res: Response, next: NextFunction,
): Promise<void> | void {
  // Already validated via API key in bookingAuth — no need to re-check
  if (req.isApiKeyAuthenticated) return next();
  const payments = req.body?.payments;
  if (Array.isArray(payments) && payments.length > 0) {
    return apiKeyMiddleware(req, res, next);
  }
  next();
}

/**
 * PATCH /cleaner-bookings/:id — API key is required when ANY field OTHER THAN
 * `new_payment` is being updated.
 *
 * Why: Adding a payment record (salary/settlement entry) is a routine action
 *      allowed without an API key. Changing cleaner profile fields (name,
 *      address, mobile number, joined_at) requires CRM admin authorization.
 */
const USER_ONLY_FIELDS = new Set(['new_payment']);

export function conditionalCleanerBookingPatchApiKey(
  req: Request, res: Response, next: NextFunction,
): Promise<void> | void {
  // Already validated via API key in bookingAuth — no need to re-check
  if (req.isApiKeyAuthenticated) return next();
  const bodyKeys    = Object.keys(req.body ?? {});
  const needsApiKey = bodyKeys.some(k => !USER_ONLY_FIELDS.has(k));
  if (needsApiKey) {
    return apiKeyMiddleware(req, res, next);
  }
  next();
}
