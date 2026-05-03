import { Request, Response }            from 'express';
import asyncHandler                      from '../utils/async-handler.util';
import { sendSuccess, sendError }        from '../utils/response.util';
import { MongoDataServices }             from '../frameworks/mongo';
import { ModuleUseCase }                 from '../use-cases/module/module.use-case';
import { createModuleSchema, updateModuleSchema } from '../core/dtos';

const dataServices = new MongoDataServices();
const moduleUseCase = new ModuleUseCase(dataServices);

export const getAllModules = asyncHandler(async (req: Request, res: Response) => {
  const result = await moduleUseCase.getAllModules(req.query as Record<string, string>);
  sendSuccess(res, 'Modules fetched successfully', result);
});

export const getModuleById = asyncHandler(async (req: Request, res: Response) => {
  const result = await moduleUseCase.getModuleById(req.params['id']!);
  sendSuccess(res, 'Module fetched successfully', result);
});

export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createModuleSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await moduleUseCase.createModule(value);
  sendSuccess(res, 'Module created successfully', result, 201);
});

export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateModuleSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await moduleUseCase.updateModule(req.params['id']!, value);
  sendSuccess(res, 'Module updated successfully', result);
});

export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  await moduleUseCase.deleteModule(req.params['id']!);
  sendSuccess(res, 'Module deleted successfully', null);
});
