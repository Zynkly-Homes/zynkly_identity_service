// Standard protected routes: JWT + DB API key (both required)
const securedBy = [{ bearerAuth: [], apiKeyAuth: [] }];
// Bootstrap route: JWT + FOR_API_KEY_CREATE_KEY from .env (used to create the first DB key)
const bootstrapSecurity = [{ bearerAuth: [], bootstrapApiKey: [] }];

export const apiKeyPaths = {
  '/api-keys': {
    get: {
      tags: ['API Keys'],
      summary: 'Get all API keys for the current user with optional search, filter and pagination',
      security: securedBy,
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },          description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 },         description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'prod' },     description: 'Search by key name (case-insensitive)' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true },       description: 'Filter by active status' },
      ],
      responses: {
        200: { description: 'API key list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedApiKeyResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['API Keys'],
      summary: 'Create a new API key — requires JWT + FOR_API_KEY_CREATE_KEY from .env (bootstrap key, not a DB key)',
      description: 'Use this endpoint to generate your first API key. Pass the `FOR_API_KEY_CREATE_KEY` value from your `.env` file as `x-api-key` header or `api_key` in the body. Once you have at least one DB key, use that for all other endpoints.',
      security: bootstrapSecurity,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateApiKeyDto' } } } },
      responses: {
        201: { description: 'API key created' },
        400: { description: 'Validation error' },
      },
    },
  },
  '/api-keys/{id}': {
    get: {
      tags: ['API Keys'],
      summary: 'Get API key by ID',
      security: securedBy,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'API key found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['API Keys'],
      summary: 'Update API key (name, active status, usage limit, expiry)',
      security: securedBy,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateApiKeyDto' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['API Keys'],
      summary: 'Deactivate API key (is_active = false)',
      security: securedBy,
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Deactivated' } },
    },
  },
};

export const apiKeySchemas = {
  ApiKey: {
    type: 'object',
    properties: {
      _id:         { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d' },
      name:        { type: 'string',  example: 'Production Key' },
      key:         { type: 'string',  example: 'a3f1b2c3d4e5...' },
      is_active:   { type: 'boolean', example: true },
      usage_limit: { type: 'integer', example: 1000, description: '-1 = unlimited' },
      usage_count: { type: 'integer', example: 42 },
      expires_at:  { type: 'string',  format: 'date-time', example: '2026-12-31T00:00:00.000Z' },
      created_by:  { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d' },
      createdAt:   { type: 'string',  format: 'date-time' },
    },
  },
  CreateApiKeyDto: {
    type: 'object',
    required: ['name', 'usage_limit', 'expires_at'],
    properties: {
      name:        { type: 'string',  example: 'Production Key' },
      usage_limit: { type: 'integer', example: 1000, description: 'Max uses allowed. Use -1 for unlimited.' },
      expires_at:  { type: 'string',  format: 'date',   example: '2026-12-31', description: 'ISO date — key expires at end of this day' },
    },
  },
  PaginatedApiKeyResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/ApiKey' } },
          total:      { type: 'integer', example: 5 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 1 },
        },
      },
    },
  },
  UpdateApiKeyDto: {
    type: 'object',
    properties: {
      name:        { type: 'string',  example: 'Staging Key' },
      is_active:   { type: 'boolean', example: false },
      usage_limit: { type: 'integer', example: 500 },
      expires_at:  { type: 'string',  format: 'date', example: '2027-06-30' },
    },
  },
};
