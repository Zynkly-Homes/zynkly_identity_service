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

export interface CreateRoleDto {
  role_name:   string;
  role_access: {
    module_id: string;
    create:    boolean;
    edit:      boolean;
    view:      boolean;
    delete:    boolean;
    transfer:  boolean;
    export:    boolean;
  }[];
}

export const createRoleSchema = Joi.object<CreateRoleDto>({
  role_name:   Joi.string().trim().min(2).max(100).required()
                 .messages({ 'any.required': 'role_name is required' }),
  role_access: Joi.array().items(moduleAccessSchema).min(1).required()
                 .messages({ 'any.required': 'role_access is required', 'array.min': 'At least one module access entry required' }),
});
