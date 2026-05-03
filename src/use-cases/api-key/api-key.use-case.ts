import crypto              from 'crypto';
import { Types }           from 'mongoose';
import { IDataServices }   from '../../core/abstracts/data-service.abstract';
import { CreateApiKeyDto } from '../../core/dtos/api-key/create-api-key.dto';
import { UpdateApiKeyDto } from '../../core/dtos/api-key/update-api-key.dto';
import { AppError }        from '../../utils/app-error.util';
import { API_KEY_BYTES }   from '../../utils/constants';
import {
  ListQuery, parsePagination, buildPageResult, buildSearchFilter,
} from '../../utils/pagination.util';

export class ApiKeyUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List API keys for the current user with optional search / filter / pagination.
   *
   * Query params:
   *   page, limit  — pagination
   *   search       — case-insensitive match on name
   *   is_active    — "true" | "false"
   *
   * Scope: always filtered to created_by === userId (users can only see their own keys).
   */
  async getAllApiKeys(userId: string, query: ListQuery = {}) {
    const { pageNum, limitNum, skip, hasPagination } = parsePagination(query);

    const filter: Record<string, unknown> = { created_by: new Types.ObjectId(userId) };
    if (query['is_active'] !== undefined) filter['is_active'] = query['is_active'] === 'true';
    if (query['search'])                  Object.assign(filter, buildSearchFilter(query['search'], ['name']));

    if (hasPagination) {
      const [data, total] = await Promise.all([
        this.dataServices.apiKeys.findWithPagination(filter, skip, limitNum, { createdAt: -1 }),
        this.dataServices.apiKeys.count(filter),
      ]);
      return buildPageResult(data, total, pageNum, limitNum);
    }

    const data = await this.dataServices.apiKeys.find(filter);
    return buildPageResult(data, data.length, 1, data.length || 1);
  }

  async getApiKeyById(id: string, userId: string) {
    const apiKey = await this.dataServices.apiKeys.findOne({ _id: id, created_by: userId });
    if (!apiKey) throw new AppError('API key not found', 404);
    return apiKey;
  }

  async createApiKey(dto: CreateApiKeyDto, userId: string) {
    const expiresAt = new Date(dto.expires_at);
    if (isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new AppError('expires_at must be a future date', 400);
    }

    const key = crypto.randomBytes(API_KEY_BYTES).toString('hex');
    return this.dataServices.apiKeys.create({
      name:        dto.name,
      key,
      is_active:   true,
      usage_limit: dto.usage_limit,
      usage_count: 0,
      expires_at:  expiresAt,
      created_by:  new Types.ObjectId(userId) as unknown as Types.ObjectId,
    });
  }

  async updateApiKey(id: string, dto: UpdateApiKeyDto, userId: string) {
    const apiKey = await this.dataServices.apiKeys.findOne({ _id: id, created_by: userId });
    if (!apiKey) throw new AppError('API key not found', 404);

    const update: Record<string, unknown> = { ...dto };
    if (dto.expires_at) update['expires_at'] = new Date(dto.expires_at);

    return this.dataServices.apiKeys.update(id, update);
  }

  async deleteApiKey(id: string, userId: string) {
    const apiKey = await this.dataServices.apiKeys.findOne({ _id: id, created_by: userId });
    if (!apiKey) throw new AppError('API key not found', 404);
    await this.dataServices.apiKeys.update(id, { is_active: false });
  }
}
