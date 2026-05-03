/**
 * Shared pagination helpers — used by every "getAll" use-case.
 *
 * WHY a shared utility instead of copy-pasting in each use-case:
 *   The parseInt / skip / totalPages math is identical in every module.
 *   Centralising it means one fix applies everywhere.
 */

export interface ListQuery {
  page?:      string;
  limit?:     string;
  search?:    string;
  is_active?: string;
  [key: string]: string | undefined;   // allow extra module-specific filters
}

export interface PaginationMeta {
  pageNum:       number;
  limitNum:      number;
  skip:          number;
  hasPagination: boolean;
}

/** Parse raw query-string page/limit values into typed pagination params */
export function parsePagination(query: ListQuery): PaginationMeta {
  const pageNum  = Math.max(1, parseInt(query.page  ?? '1',  10) || 1);
  const limitNum = Math.max(1, parseInt(query.limit ?? '10', 10) || 10);
  return {
    pageNum,
    limitNum,
    skip:          (pageNum - 1) * limitNum,
    hasPagination: !!(query.page || query.limit),
  };
}

/** Wrap paginated results into the standard envelope shape */
export function buildPageResult<T>(
  data:     T[],
  total:    number,
  pageNum:  number,
  limitNum: number,
) {
  return {
    data,
    total,
    page:       pageNum,
    limit:      limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

/** Build a case-insensitive regex $or search across multiple fields */
export function buildSearchFilter(search: string, fields: string[]): object {
  return {
    $or: fields.map(field => ({
      [field]: { $regex: search, $options: 'i' },
    })),
  };
}
