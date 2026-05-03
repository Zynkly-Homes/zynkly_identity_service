/** Bcrypt salt rounds — 12 is the industry standard (secure yet fast enough) */
export const SALT_ROUNDS = 12;

/** API key length in bytes → 64-char hex string */
export const API_KEY_BYTES = 32;

/** Header name for API key */
export const API_KEY_HEADER = 'x-api-key';

/** Default JWT expiry when not set in .env */
export const DEFAULT_JWT_EXPIRY = '7d';
