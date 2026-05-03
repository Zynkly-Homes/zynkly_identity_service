import { Request, Response }          from 'express';
import asyncHandler                    from '../utils/async-handler.util';
import { sendSuccess, sendError }      from '../utils/response.util';
import { MongoDataServices }           from '../frameworks/mongo';
import { UserUseCase }                 from '../use-cases/user/user.use-case';
import { createUserSchema, updateUserSchema } from '../core/dtos';

const dataServices = new MongoDataServices();
const userUseCase = new UserUseCase(dataServices);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userUseCase.getAllUsers(req.query as Record<string, string>);
  sendSuccess(res, 'Users fetched successfully', result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userUseCase.getUserById(req.params['id']!);
  sendSuccess(res, 'User fetched successfully', result);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createUserSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await userUseCase.createUser(value);
  sendSuccess(res, 'User created successfully', result, 201);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await userUseCase.updateUser(req.params['id']!, value);
  sendSuccess(res, 'User updated successfully', result);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userUseCase.deleteUser(req.params['id']!);
  sendSuccess(res, 'User deleted successfully', null);
});
