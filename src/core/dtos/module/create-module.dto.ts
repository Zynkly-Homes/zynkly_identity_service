import Joi from 'joi';

export interface CreateModuleDto {
  module_id:   string;
  module_name: string;
}

export const createModuleSchema = Joi.object<CreateModuleDto>({
  module_id:   Joi.string().trim().lowercase()
                 .pattern(/^[a-z0-9_]+$/)
                 .required()
                 .messages({ 'string.pattern.base': 'module_id must be lowercase letters, numbers, or underscores (e.g. user_management)', 'any.required': 'module_id is required' }),
  module_name: Joi.string().trim().min(2).max(100).required()
                 .messages({ 'any.required': 'module_name is required' }),
});
