import { Request, Response, NextFunction } from 'express';
import { ApiKey }       from '../frameworks/mongo/model/api-key.model';
import { API_KEY_HEADER } from '../utils/constants';

function extractKey(req: Request): string | undefined {
  // Accept from header (primary) or request body (fallback)
  return (req.headers[API_KEY_HEADER] as string | undefined)
      ?? (req.body?.api_key as string | undefined);
}

export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = extractKey(req);

  if (!key) {
    res.status(401).json({ success: false, message: `API key is required — pass via '${API_KEY_HEADER}' header or 'api_key' in request body` });
    return;
  }

  // Find the key record first (for specific error messages)
  const record = await ApiKey.findOne({ key });

  if (!record) {
    res.status(401).json({ success: false, message: 'Invalid API key' });
    return;
  }

  if (!record.is_active) {
    res.status(401).json({ success: false, message: 'API key is inactive' });
    return;
  }

  if (record.expires_at < new Date()) {
    res.status(401).json({ success: false, message: 'API key has expired' });
    return;
  }

  // usage_limit -1 means unlimited; otherwise enforce the cap
  if (record.usage_limit !== -1 && record.usage_count >= record.usage_limit) {
    res.status(429).json({ success: false, message: 'API key usage limit exceeded' });
    return;
  }

  // Atomically increment usage count
  await ApiKey.updateOne({ _id: record._id }, { $inc: { usage_count: 1 } });

  req.isApiKeyAuthenticated = true;
  next();
}
