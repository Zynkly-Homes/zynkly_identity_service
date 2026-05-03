import Joi from 'joi';

export interface CreateApiKeyDto {
  name:        string;
  usage_limit: number;
  expires_at:  string;  // ISO date string, e.g. "2026-12-31"
}

export const createApiKeySchema = Joi.object<CreateApiKeyDto>({
  name:        Joi.string().trim().min(2).max(100).required()
                 .messages({ 'any.required': 'name is required' }),
  usage_limit: Joi.number().integer().min(-1).required()
                 .messages({ 'any.required': 'usage_limit is required', 'number.min': 'usage_limit must be -1 (unlimited) or a positive integer' }),
  expires_at:  Joi.string().isoDate().required()
                 .messages({ 'any.required': 'expires_at is required', 'string.isoDate': 'expires_at must be a valid ISO date, e.g. 2026-12-31' }),
});
