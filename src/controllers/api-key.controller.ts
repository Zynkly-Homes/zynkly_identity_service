import { Request, Response }              from 'express';
import asyncHandler                        from '../utils/async-handler.util';
import { sendSuccess, sendError }          from '../utils/response.util';
import { MongoDataServices }               from '../frameworks/mongo';
import { ApiKeyUseCase }                   from '../use-cases/api-key/api-key.use-case';
import { createApiKeySchema, updateApiKeySchema } from '../core/dtos';

const dataServices = new MongoDataServices();
const apiKeyUseCase = new ApiKeyUseCase(dataServices);

export const getAllApiKeys = asyncHandler(async (req: Request, res: Response) => {
  const result = await apiKeyUseCase.getAllApiKeys(req.user!.user_id, req.query as Record<string, string>);
  sendSuccess(res, 'API keys fetched successfully', result);
});

export const getApiKeyById = asyncHandler(async (req: Request, res: Response) => {
  const result = await apiKeyUseCase.getApiKeyById(req.params['id']!, req.user!.user_id);
  sendSuccess(res, 'API key fetched successfully', result);
});

export const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createApiKeySchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await apiKeyUseCase.createApiKey(value, req.user!.user_id);
  sendSuccess(res, 'API key created successfully', result, 201);
});

export const updateApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateApiKeySchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await apiKeyUseCase.updateApiKey(req.params['id']!, value, req.user!.user_id);
  sendSuccess(res, 'API key updated successfully', result);
});

export const deleteApiKey = asyncHandler(async (req: Request, res: Response) => {
  await apiKeyUseCase.deleteApiKey(req.params['id']!, req.user!.user_id);
  sendSuccess(res, 'API key deleted successfully', null);
});
