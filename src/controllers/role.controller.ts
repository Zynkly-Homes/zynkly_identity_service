import { Request, Response }          from 'express';
import asyncHandler                    from '../utils/async-handler.util';
import { sendSuccess, sendError }      from '../utils/response.util';
import { MongoDataServices }           from '../frameworks/mongo';
import { RoleUseCase }                 from '../use-cases/role/role.use-case';
import { createRoleSchema, updateRoleSchema } from '../core/dtos';

const dataServices = new MongoDataServices();
const roleUseCase = new RoleUseCase(dataServices);

export const getAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const result = await roleUseCase.getAllRoles(req.query as Record<string, string>);
  sendSuccess(res, 'Roles fetched successfully', result);
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const result = await roleUseCase.getRoleById(req.params['id']!);
  sendSuccess(res, 'Role fetched successfully', result);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createRoleSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await roleUseCase.createRole(value);
  sendSuccess(res, 'Role created successfully', result, 201);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateRoleSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await roleUseCase.updateRole(req.params['id']!, value);
  sendSuccess(res, 'Role updated successfully', result);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  await roleUseCase.deleteRole(req.params['id']!);
  sendSuccess(res, 'Role deleted successfully', null);
});
