import { Request, Response, NextFunction } from 'express';
import { API_KEY_HEADER } from '../utils/constants';

/**
 * Bootstrap middleware — used ONLY on POST /api-keys.
 *
 * Problem: to call any protected API you need a DB API key,
 * but you need POST /api-keys to create the first one (chicken-and-egg).
 *
 * Solution: that one route validates against FOR_API_KEY_CREATE_KEY in .env
 * instead of looking up the database. After you have at least one DB key,
 * all other routes use the normal apiKeyMiddleware.
 *
 * Pass the key via:
 *   - Header:  x-api-key: <value>
 *   - OR body: { "api_key": "<value>", ... }
 */
export function envApiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const bootstrapKey = process.env['FOR_API_KEY_CREATE_KEY'];

  if (!bootstrapKey) {
    res.status(500).json({ success: false, message: 'Server misconfiguration: FOR_API_KEY_CREATE_KEY is not set' });
    return;
  }

  const provided = (req.headers[API_KEY_HEADER] as string | undefined)
                ?? (req.body?.api_key as string | undefined);

  if (!provided) {
    res.status(401).json({ success: false, message: `API key is required — pass '${API_KEY_HEADER}' header or 'api_key' in body` });
    return;
  }

  if (provided !== bootstrapKey) {
    res.status(401).json({ success: false, message: 'Invalid bootstrap API key' });
    return;
  }

  next();
}
