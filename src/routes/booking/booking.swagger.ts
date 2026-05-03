const jwtOnly   = [{ bearerAuth: [] }];
const jwtAndKey = [{ bearerAuth: [], apiKeyAuth: [] }];

export const bookingPaths = {
  '/bookings': {
    get: {
      tags: ['Bookings'],
      summary: 'Get all bookings — search, filter and pagination (JWT + API key)',
      security: jwtAndKey,
      parameters: [
        { in: 'query', name: 'page',           schema: { type: 'integer', example: 1 },                       description: 'Page number' },
        { in: 'query', name: 'limit',          schema: { type: 'integer', example: 10 },                      description: 'Items per page' },
        { in: 'query', name: 'search',         schema: { type: 'string',  example: 'nikhil' },                description: 'Search by user_name, user_phone, user_id or reference_id (case-insensitive)' },
        { in: 'query', name: 'booking_status', schema: { type: 'string',  example: 'ongoing' },               description: 'Filter by booking_status enum' },
        { in: 'query', name: 'booking_via',    schema: { type: 'string',  example: 'app' },                   description: 'Filter by booking_via enum' },
        { in: 'query', name: 'branch',         schema: { type: 'string',  example: 'jalandhar' },             description: 'Filter by branch' },
        { in: 'query', name: 'date_from',      schema: { type: 'string',  format: 'date', example: '2026-01-01' }, description: 'Filter createdAt >= date_from' },
        { in: 'query', name: 'date_to',        schema: { type: 'string',  format: 'date', example: '2026-12-31' }, description: 'Filter createdAt <= date_to (end of day)' },
        { in: 'query', name: 'is_active',      schema: { type: 'boolean', example: true },                    description: 'Include inactive bookings (default: true = active only)' },
      ],
      responses: {
        200: { description: 'Booking list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedBookingResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Bookings'],
      summary: 'Create a booking — JWT always; API key required only when booking_via = whatsapp_to_crm',
      description: [
        'Creates a new booking and auto-generates a human-readable `reference_id` (`DD-MM-YYYY-NNNNN`).',
        '',
        '**Auth rules:**',
        '- `app`, `website`, `laptop`, `call` → JWT only',
        '- `whatsapp_to_crm` → JWT **+ API key** (CRM agent action)',
      ].join('\n'),
      security: jwtOnly,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingDto' } } } },
      responses: {
        201: { description: 'Booking created' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/bookings/{id}': {
    get: {
      tags: ['Bookings'],
      summary: 'Get booking by ID — JWT only',
      security: jwtOnly,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Booking found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['Bookings'],
      summary: 'Update booking — JWT always; API key required for operational fields',
      description: [
        '**Field-level auth:**',
        '- `booking_status` / `cancellation_reason` only → JWT only (user self-cancellation)',
        '  - `booking_status` can only be set to `cancelled_via_user` without API key',
        '- Any other field (branch, user_phone, address, etc.) → JWT **+ API key** (CRM admin)',
        '',
        'Changing to a cancelled status automatically appends a `cancellation_log` entry.',
      ].join('\n'),
      security: jwtOnly,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBookingDto' } } } },
      responses: {
        200: { description: 'Booking updated' },
        403: { description: 'Permission denied — field requires API key or invalid status transition' },
      },
    },
    delete: {
      tags: ['Bookings'],
      summary: 'Hard-delete booking — JWT + API key (admin only)',
      security: jwtAndKey,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Booking deleted' }, 404: { description: 'Not found' } },
    },
  },
};

export const bookingSchemas = {
  CancellationLog: {
    type: 'object',
    properties: {
      booking_status: { type: 'string', example: 'cancelled_via_user' },
      cancelled_by:   { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      cancelled_at:   { type: 'string', format: 'date-time' },
    },
  },
  Booking: {
    type: 'object',
    properties: {
      _id:                 { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      reference_id:        { type: 'string', example: '03-05-2026-00001' },
      branch:              { type: 'string', example: 'jalandhar' },
      user_name:           { type: 'string', example: 'Nikhil Sharma' },
      user_id:             { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      user_phone:          { type: 'string', example: '+919876543210' },
      address:             { type: 'string', example: '123 Main St, Jalandhar' },
      live_location_url:   { type: 'string', example: 'https://maps.google.com/?q=31.326,75.576' },
      booking_via:         { type: 'string', enum: ['app', 'website', 'laptop', 'whatsapp_to_crm', 'call'] },
      booking_status:      { type: 'string', enum: ['ongoing', 'completed', 'cancelled_via_user', 'cancelled_by_admin_crm'] },
      cancellation_log:    { type: 'array', items: { $ref: '#/components/schemas/CancellationLog' } },
      cancellation_reason: { type: 'string', example: 'Customer not available' },
      is_active:           { type: 'boolean', example: true },
      createdAt:           { type: 'string', format: 'date-time' },
      updatedAt:           { type: 'string', format: 'date-time' },
    },
  },
  CreateBookingDto: {
    type: 'object',
    required: ['branch', 'user_name', 'user_id', 'user_phone', 'address', 'booking_via'],
    properties: {
      branch:            { type: 'string', example: 'jalandhar' },
      user_name:         { type: 'string', example: 'Nikhil Sharma' },
      user_id:           { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      user_phone:        { type: 'string', example: '+919876543210' },
      address:           { type: 'string', example: '123 Main St, Jalandhar' },
      live_location_url: { type: 'string', example: 'https://maps.google.com/?q=31.326,75.576' },
      booking_via: {
        type: 'string',
        enum: ['app', 'website', 'laptop', 'whatsapp_to_crm', 'call'],
        description: 'whatsapp_to_crm requires API key header in addition to JWT',
      },
    },
  },
  UpdateBookingDto: {
    type: 'object',
    properties: {
      branch:              { type: 'string' },
      user_name:           { type: 'string' },
      user_id:             { type: 'string' },
      user_phone:          { type: 'string' },
      address:             { type: 'string' },
      live_location_url:   { type: 'string' },
      booking_via:         { type: 'string', enum: ['app', 'website', 'laptop', 'whatsapp_to_crm', 'call'] },
      booking_status: {
        type: 'string',
        enum: ['ongoing', 'completed', 'cancelled_via_user', 'cancelled_by_admin_crm'],
        description: 'Without API key: only "cancelled_via_user" is allowed',
      },
      cancellation_reason: { type: 'string', example: 'Customer not available' },
      is_active:           { type: 'boolean' },
    },
  },
  PaginatedBookingResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
          total:      { type: 'integer', example: 100 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
  },
};
