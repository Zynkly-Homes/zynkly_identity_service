import { IDataServices }   from '../../core/abstracts/data-service.abstract';
import { CreateModuleDto } from '../../core/dtos/module/create-module.dto';
import { UpdateModuleDto } from '../../core/dtos/module/update-module.dto';
import { AppError }        from '../../utils/app-error.util';
import {
  ListQuery, parsePagination, buildPageResult, buildSearchFilter,
} from '../../utils/pagination.util';

export class ModuleUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List modules with optional search / filter / pagination.
   *
   * Query params:
   *   page, limit  — pagination
   *   search       — case-insensitive match on module_name OR module_id
   *   is_active    — "true" | "false"
   */
  async getAllModules(query: ListQuery = {}) {
    const { pageNum, limitNum, skip, hasPagination } = parsePagination(query);

    const filter: Record<string, unknown> = {};
    if (query['is_active'] !== undefined) filter['is_active'] = query['is_active'] === 'true';
    if (query['search'])                  Object.assign(filter, buildSearchFilter(query['search'], ['module_name', 'module_id']));

    if (hasPagination) {
      const [data, total] = await Promise.all([
        this.dataServices.modules.findWithPagination(filter, skip, limitNum, { createdAt: -1 }),
        this.dataServices.modules.count(filter),
      ]);
      return buildPageResult(data, total, pageNum, limitNum);
    }

    const data = await this.dataServices.modules.find(filter);
    return buildPageResult(data, data.length, 1, data.length || 1);
  }

  async getModuleById(id: string) {
    const module = await this.dataServices.modules.get(id);
    if (!module) throw new AppError('Module not found', 404);
    return module;
  }

  async createModule(dto: CreateModuleDto) {
    const existing = await this.dataServices.modules.findOne({ module_id: dto.module_id });
    if (existing) throw new AppError(`Module with module_id '${dto.module_id}' already exists`, 409);
    return this.dataServices.modules.create(dto);
  }

  async updateModule(id: string, dto: UpdateModuleDto) {
    const module = await this.dataServices.modules.get(id);
    if (!module) throw new AppError('Module not found', 404);
    return this.dataServices.modules.update(id, dto);
  }

  async deleteModule(id: string) {
    const module = await this.dataServices.modules.get(id);
    if (!module) throw new AppError('Module not found', 404);
    await this.dataServices.modules.update(id, { is_active: false });
  }
}
