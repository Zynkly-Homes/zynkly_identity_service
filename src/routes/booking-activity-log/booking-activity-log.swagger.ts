const jwtOrKey = [{ bearerAuth: [] }, { apiKeyAuth: [] }];

export const bookingActivityLogPaths = {
  '/booking-activity-logs': {
    get: {
      tags: ['Booking Activity Logs'],
      summary: 'Get booking module activity logs — filter and pagination (JWT or API key)',
      description: [
        'Every GET / POST / PATCH call made to the `/bookings` endpoints is recorded here — including rejected (401/403) attempts, since this is an audit trail, not just a success log.',
        '',
        'Each entry stores: HTTP method, endpoint, affected booking_id (if any), response status_code, response_time_ms, the caller\'s user_id (from JWT, if present), how the request was authenticated (`hit_by`), and the caller IP.',
        '`user_name` / `user_email` are joined in from the Users collection via `user_id` (read-only, not stored on the log entry).',
        '',
        '**How to filter:** combine any of the query params below, e.g.',
        '`/booking-activity-logs?method=PATCH&status_code=403&sort_by=latest`',
      ].join('\n'),
      security: jwtOrKey,
      parameters: [
        { in: 'query', name: 'page',        schema: { type: 'integer', example: 1 },  description: 'Page number' },
        { in: 'query', name: 'limit',       schema: { type: 'integer', example: 10 }, description: 'Items per page' },
        { in: 'query', name: 'method',      schema: { type: 'string', enum: ['GET', 'POST', 'PATCH'] }, description: 'Filter by HTTP method (exact match)' },
        { in: 'query', name: 'status_code', schema: { type: 'integer', example: 200 }, description: 'Filter by response status code (exact match)' },
        { in: 'query', name: 'booking_id',  schema: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' }, description: 'Filter by the affected booking\'s _id (exact match)' },
        { in: 'query', name: 'user_id',     schema: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' }, description: 'Filter by the JWT caller\'s user_id (exact match)' },
        { in: 'query', name: 'hit_by',      schema: { type: 'string', enum: ['jwt', 'api_key', 'jwt+api_key', 'anonymous'] }, description: 'Filter by how the request was authenticated (exact match)' },
        { in: 'query', name: 'date_from',   schema: { type: 'string', format: 'date', example: '2026-01-01' }, description: 'Filter createdAt (log time) >= date_from' },
        { in: 'query', name: 'date_to',     schema: { type: 'string', format: 'date', example: '2026-12-31' }, description: 'Filter createdAt (log time) <= date_to (end of day)' },
        {
          in: 'query', name: 'sort_by',
          schema: { type: 'string', enum: ['latest', 'oldest'], example: 'latest' },
          description: 'Sort order by createdAt. Default: latest first.',
        },
      ],
      responses: {
        200: { description: 'Booking activity log list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedBookingActivityLogResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
  },
};

export const bookingActivityLogSchemas = {
  BookingActivityLog: {
    type: 'object',
    properties: {
      _id:               { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      method:            { type: 'string', enum: ['GET', 'POST', 'PATCH'], example: 'PATCH' },
      endpoint:          { type: 'string', example: '/api/v1/bookings/664f1a2b3c4d5e6f7a8b9c0d' },
      booking_id:        { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d', nullable: true, description: 'Present only for /bookings/:id calls' },
      status_code:       { type: 'integer', example: 200 },
      response_time_ms:  { type: 'integer', example: 42 },
      user_id:           { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d', nullable: true, description: 'Present only when the call was JWT-authenticated' },
      user_name:         { type: 'string', example: 'Nikhil Mahato', nullable: true, description: 'Joined from the Users collection via user_id (read-only)' },
      user_email:        { type: 'string', example: 'nikhilmahato104@gmail.com', nullable: true, description: 'Joined from the Users collection via user_id (read-only)' },
      hit_by:            { type: 'string', enum: ['jwt', 'api_key', 'jwt+api_key', 'anonymous'], example: 'jwt' },
      ip:                { type: 'string', example: '203.0.113.42', nullable: true },
      createdAt:         { type: 'string', format: 'date-time', description: 'When the request was made' },
      updatedAt:         { type: 'string', format: 'date-time' },
    },
  },
  PaginatedBookingActivityLogResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/BookingActivityLog' } },
          total:      { type: 'integer', example: 100 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
  },
};
