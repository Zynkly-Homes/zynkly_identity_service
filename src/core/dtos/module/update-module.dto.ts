import Joi from 'joi';

export interface UpdateModuleDto {
  module_name?: string;
  is_active?:   boolean;
}

export const updateModuleSchema = Joi.object<UpdateModuleDto>({
  module_name: Joi.string().trim().min(2).max(100).optional(),
  is_active:   Joi.boolean().optional(),
}).min(1).messages({ 'object.min': 'At least one field must be provided' });
