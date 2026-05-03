import Joi from 'joi';

const moduleAccessSchema = Joi.object({
  module_id: Joi.string().trim().required(),
  create:    Joi.boolean().required(),
  edit:      Joi.boolean().required(),
  view:      Joi.boolean().required(),
  delete:    Joi.boolean().required(),
  transfer:  Joi.boolean().required(),
  export:    Joi.boolean().required(),
});

export interface UpdateRoleDto {
  role_name?:   string;
  role_access?: {
    module_id: string;
    create:    boolean;
    edit:      boolean;
    view:      boolean;
    delete:    boolean;
    transfer:  boolean;
    export:    boolean;
  }[];
  is_active?: boolean;
}

export const updateRoleSchema = Joi.object<UpdateRoleDto>({
  role_name:   Joi.string().trim().min(2).max(100).optional(),
  role_access: Joi.array().items(moduleAccessSchema).min(1).optional(),
  is_active:   Joi.boolean().optional(),
}).min(1).messages({ 'object.min': 'At least one field must be provided' });
