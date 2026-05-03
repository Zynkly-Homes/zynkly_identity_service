import { IDataServices }  from '../../core/abstracts/data-service.abstract';
import { CreateRoleDto }  from '../../core/dtos/role/create-role.dto';
import { UpdateRoleDto }  from '../../core/dtos/role/update-role.dto';
import { AppError }       from '../../utils/app-error.util';
import {
  ListQuery, parsePagination, buildPageResult, buildSearchFilter,
} from '../../utils/pagination.util';

export class RoleUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List roles with optional search / filter / pagination.
   *
   * Query params:
   *   page, limit  — pagination
   *   search       — case-insensitive match on role_name
   *   is_active    — "true" | "false"
   */
  async getAllRoles(query: ListQuery = {}) {
    const { pageNum, limitNum, skip, hasPagination } = parsePagination(query);

    const filter: Record<string, unknown> = {};
    if (query['is_active'] !== undefined) filter['is_active'] = query['is_active'] === 'true';
    if (query['search'])                  Object.assign(filter, buildSearchFilter(query['search'], ['role_name']));

    if (hasPagination) {
      const [data, total] = await Promise.all([
        this.dataServices.roles.findWithPagination(filter, skip, limitNum, { createdAt: -1 }),
        this.dataServices.roles.count(filter),
      ]);
      return buildPageResult(data, total, pageNum, limitNum);
    }

    const data = await this.dataServices.roles.find(filter);
    return buildPageResult(data, data.length, 1, data.length || 1);
  }

  async getRoleById(id: string) {
    const role = await this.dataServices.roles.get(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async createRole(dto: CreateRoleDto) {
    const existing = await this.dataServices.roles.findOne({ role_name: dto.role_name });
    if (existing) throw new AppError(`Role '${dto.role_name}' already exists`, 409);
    return this.dataServices.roles.create(dto);
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.dataServices.roles.get(id);
    if (!role) throw new AppError('Role not found', 404);
    return this.dataServices.roles.update(id, dto);
  }

  async deleteRole(id: string) {
    const role = await this.dataServices.roles.get(id);
    if (!role) throw new AppError('Role not found', 404);
    await this.dataServices.roles.update(id, { is_active: false });
  }
}
