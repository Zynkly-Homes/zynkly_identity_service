const jwtOrKey = [{ bearerAuth: [] }, { apiKeyAuth: [] }];

export const cleanerBookingPaths = {
  '/cleaner-bookings': {
    get: {
      tags: ['Cleaner Bookings'],
      summary: 'Get all cleaner bookings — search and pagination (JWT or API key)',
      security: jwtOrKey,
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },  description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 }, description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'ramesh' }, description: 'Search by cleaner_name, cleaner_id, mobile_number or reference_id (case-insensitive)' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true }, description: 'Include inactive records (default: true = active only)' },
        { in: 'query', name: 'is_delete', schema: { type: 'boolean', example: false }, description: 'Include soft-deleted records (default: false = non-deleted only)' },
      ],
      responses: {
        200: { description: 'Cleaner booking list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedCleanerBookingResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Cleaner Bookings'],
      summary: 'Create a cleaner booking — JWT or API key; API key required to pre-load payment history',
      description: [
        'Creates a new cleaner booking record and auto-generates a human-readable `reference_id` (`CB-DD-MM-YYYY-NNNNN`).',
        '',
        '**Auth rules:**',
        '- JWT only → create a profile with no initial `payments`',
        '- JWT + API key (or API key only) → required if `payments` is supplied at creation time',
      ].join('\n'),
      security: jwtOrKey,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCleanerBookingDto' } } } },
      responses: {
        201: { description: 'Cleaner booking created' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/cleaner-bookings/{id}': {
    get: {
      tags: ['Cleaner Bookings'],
      summary: 'Get cleaner booking by ID — JWT or API key',
      security: jwtOrKey,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Cleaner booking found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['Cleaner Bookings'],
      summary: 'Update cleaner booking — JWT or API key; API key required for profile fields',
      description: [
        '**Auth rules:**',
        '- JWT only → may only submit `new_payment` (single entry) and/or `payments` (batch of entries) to append to the payment history',
        '- JWT + API key (or API key only) → any field can be updated, including cleaner_name / address / mobile_number / joined_at',
      ].join('\n'),
      security: jwtOrKey,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCleanerBookingDto' } } } },
      responses: {
        200: { description: 'Cleaner booking updated' },
        403: { description: 'Permission denied — field requires API key' },
      },
    },
    delete: {
      tags: ['Cleaner Bookings'],
      summary: 'Soft-delete cleaner booking — JWT or API key',
      description: 'Marks the record as deleted by setting `is_delete` to `true`. The record is not removed from the database and is excluded from `GET /cleaner-bookings` results by default.',
      security: jwtOrKey,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Cleaner booking soft-deleted' }, 404: { description: 'Not found' } },
    },
  },
};

export const cleanerBookingSchemas = {
  Payment: {
    type: 'object',
    description: 'All five keys are mandatory whenever a payment entry is supplied. No other keys are accepted.',
    required: ['amount_paid', 'date', 'description', 'status', 'payment_method'],
    properties: {
      amount_paid:    { type: 'number', example: 2000, description: 'Required' },
      date:           { type: 'string', format: 'date-time', example: '2026-07-19T05:58:59.746Z', description: 'Required' },
      description:    { type: 'string', example: 'Weekly settlement', description: 'Required' },
      status:         { type: 'string', enum: ['paid', 'pending', 'cancelled'], example: 'paid', description: 'Required' },
      payment_method: { type: 'string', enum: ['cash', 'online'], example: 'online', description: 'Required' },
    },
  },
  CleanerBooking: {
    type: 'object',
    properties: {
      _id:           { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      reference_id:  { type: 'string', example: 'CB-19-07-2026-00001' },
      cleaner_id:    { type: 'string', example: 'CLN-1024' },
      cleaner_name:  { type: 'string', example: 'Ramesh Kumar' },
      joined_at:     { type: 'string', format: 'date-time', example: '2025-01-15T00:00:00.000Z' },
      address:       { type: 'string', example: '123 Main St, Jalandhar' },
      mobile_number: { type: 'string', example: '+919876543210' },
      payments:      { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
      is_active:     { type: 'boolean', example: true },
      is_delete:     { type: 'boolean', example: false, description: 'Soft-delete flag; true when the record has been deleted' },
      createdAt:     { type: 'string', format: 'date-time' },
      updatedAt:     { type: 'string', format: 'date-time' },
    },
  },
  CreateCleanerBookingDto: {
    type: 'object',
    properties: {
      cleaner_id:    { type: 'string', example: 'CLN-1024',       description: 'Defaults to "N/A" if omitted' },
      cleaner_name:  { type: 'string', example: 'Ramesh Kumar',   description: 'Defaults to "N/A" if omitted' },
      joined_at:     { type: 'string', format: 'date-time', example: '2025-01-15T00:00:00.000Z' },
      address:       { type: 'string', example: '123 Main St, Jalandhar', description: 'Defaults to "N/A" if omitted' },
      mobile_number: { type: 'string', example: '+919876543210',  description: 'Defaults to "N/A" if omitted' },
      payments: {
        type: 'array',
        items: { $ref: '#/components/schemas/Payment' },
        description: 'Initial payment history. Requires API key if non-empty. Each entry must include all of amount_paid, date, description, status and payment_method.',
      },
      is_active: { type: 'boolean', example: true, description: 'Defaults to true if omitted' },
    },
  },
  UpdateCleanerBookingDto: {
    type: 'object',
    properties: {
      cleaner_id:    { type: 'string', description: 'Requires API key' },
      cleaner_name:  { type: 'string', description: 'Requires API key' },
      joined_at:     { type: 'string', format: 'date-time', description: 'Requires API key' },
      address:       { type: 'string', description: 'Requires API key' },
      mobile_number: { type: 'string', description: 'Requires API key' },
      new_payment: {
        allOf: [{ $ref: '#/components/schemas/Payment' }],
        description: 'Appends a single new entry to the payments array. Allowed without API key. Must include all of amount_paid, date, description, status and payment_method.',
      },
      payments: {
        type: 'array',
        items: { $ref: '#/components/schemas/Payment' },
        description: 'Appends one or more new entries to the payments array in a single call. Allowed without API key. Each entry must include all of amount_paid, date, description, status and payment_method.',
      },
      is_active: { type: 'boolean', description: 'Requires API key' },
      is_delete: { type: 'boolean', description: 'Soft-delete flag. Requires API key' },
    },
  },
  PaginatedCleanerBookingResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/CleanerBooking' } },
          total:      { type: 'integer', example: 100 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
  },
};
