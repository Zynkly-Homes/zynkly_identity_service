import { IDataServices } from '../../core/abstracts/data-service.abstract';
import { ListQuery, parsePagination, buildPageResult } from '../../utils/pagination.util';

/**
 * Joins each activity-log entry with the acting user (log.user_id → users._id)
 * and flattens username/email onto the top level. user_id is a plain string
 * (the JWT payload's user_id claim), so $convert is used to safely cast it to
 * ObjectId — entries with no user_id (API-key-only calls) simply get nulls.
 */
function buildUserLookupStages(): object[] {
  return [
    {
      $lookup: {
        from: 'users',
        let:  { userId: '$user_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  { $convert: { input: '$$userId', to: 'objectId', onError: null, onNull: null } },
                ],
              },
            },
          },
          { $project: { username: 1, email: 1 } },
        ],
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        user_name:  '$user.username',
        user_email: '$user.email',
      },
    },
    { $project: { user: 0 } },
  ];
}

function buildSortStage(sortBy: string | undefined): object[] {
  switch (sortBy) {
    case 'oldest': return [{ $sort: { createdAt: 1 } }];
    case 'latest':
    default:       return [{ $sort: { createdAt: -1 } }];
  }
}

export class BookingActivityLogUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List booking activity-log entries with filters, sorting and pagination.
   *
   * Query params:
   *   page, limit      — pagination
   *   method           — exact match, e.g. "GET" | "POST" | "PATCH"
   *   status_code      — exact match, e.g. "200" | "403" | "404"
   *   booking_id       — exact match on the affected booking's _id
   *   user_id          — exact match on the JWT caller's user_id
   *   hit_by           — exact match: "jwt" | "api_key" | "jwt+api_key" | "anonymous"
   *   date_from        — ISO date; lower bound on createdAt (when the request was logged)
   *   date_to          — ISO date; upper bound on createdAt
   *   sort_by          — "latest" (default) | "oldest" — order by createdAt
   */
  async getAllLogs(query: ListQuery = {}) {
    const { pageNum, limitNum, hasPagination } = parsePagination(query);

    const match: Record<string, unknown> = {};

    if (query['method'])      match['method']      = (query['method'] as string).toUpperCase();
    if (query['status_code']) match['status_code']  = Number(query['status_code']);
    if (query['booking_id'])  match['booking_id']   = query['booking_id'];
    if (query['user_id'])     match['user_id']      = query['user_id'];
    if (query['hit_by'])      match['hit_by']       = query['hit_by'];

    if (query['date_from'] || query['date_to']) {
      const range: Record<string, Date> = {};
      if (query['date_from']) range['$gte'] = new Date(query['date_from']);
      if (query['date_to']) {
        const to = new Date(query['date_to']);
        to.setHours(23, 59, 59, 999);  // include full day
        range['$lte'] = to;
      }
      match['createdAt'] = range;
    }

    const pipeline = [
      { $match: match },
      ...buildUserLookupStages(),
      ...buildSortStage(query['sort_by']),
    ];

    if (hasPagination) {
      return this.dataServices.bookingActivityLogs.aggregateWithPagination(pipeline, pageNum, limitNum);
    }

    const data = await this.dataServices.bookingActivityLogs.aggregate(pipeline) as Record<string, unknown>[];
    return buildPageResult(data, data.length, 1, data.length || 1);
  }
}
