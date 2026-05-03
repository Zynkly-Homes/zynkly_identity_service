import Joi from 'joi';

export interface UpdateApiKeyDto {
  name?:        string;
  is_active?:   boolean;
  usage_limit?: number;
  expires_at?:  string;
}

export const updateApiKeySchema = Joi.object<UpdateApiKeyDto>({
  name:        Joi.string().trim().min(2).max(100).optional(),
  is_active:   Joi.boolean().optional(),
  usage_limit: Joi.number().integer().min(-1).optional(),
  expires_at:  Joi.string().isoDate().optional()
                 .messages({ 'string.isoDate': 'expires_at must be a valid ISO date' }),
}).min(1).messages({ 'object.min': 'At least one field must be provided' });
