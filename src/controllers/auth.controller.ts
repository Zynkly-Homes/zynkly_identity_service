import { Request, Response }    from 'express';
import asyncHandler              from '../utils/async-handler.util';
import { sendSuccess, sendError } from '../utils/response.util';
import { MongoDataServices }     from '../frameworks/mongo';
import { AuthUseCase }           from '../use-cases/auth/auth.use-case';
import { loginSchema }           from '../core/dtos';

const dataServices = new MongoDataServices();
const authUseCase = new AuthUseCase(dataServices);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await authUseCase.login(value);
  sendSuccess(res, 'Login successful', result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.user_id;
  const result = await authUseCase.getProfile(userId);
  sendSuccess(res, 'Profile fetched successfully', result);
});
