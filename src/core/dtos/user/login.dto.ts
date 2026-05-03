import Joi from 'joi';

export interface LoginDto {
  email:    string;
  password: string;
}

export const loginSchema = Joi.object<LoginDto>({
  email:    Joi.string().trim().lowercase().email().required()
              .messages({ 'any.required': 'email is required', 'string.email': 'email must be valid' }),
  password: Joi.string().required()
              .messages({ 'any.required': 'password is required' }),
});
