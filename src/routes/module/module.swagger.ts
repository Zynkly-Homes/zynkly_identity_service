export const modulePaths = {
  '/modules': {
    get: {
      tags: ['Modules'],
      summary: 'Get all modules with optional search, filter and pagination',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },               description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 },              description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'user' },          description: 'Search by module_name or module_id (case-insensitive)' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true },            description: 'Filter by active status' },
      ],
      responses: {
        200: { description: 'Module list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedModuleResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Modules'],
      summary: 'Create a new module',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateModuleDto' } } } },
      responses: {
        201: { description: 'Module created' },
        400: { description: 'Validation error' },
        409: { description: 'module_id already exists' },
      },
    },
  },
  '/modules/{id}': {
    get: {
      tags: ['Modules'],
      summary: 'Get module by ID',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Module found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['Modules'],
      summary: 'Update module',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateModuleDto' } } } },
      responses: { 200: { description: 'Module updated' }, 400: { description: 'Validation error' } },
    },
    delete: {
      tags: ['Modules'],
      summary: 'Soft-delete module (is_active = false)',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Module deleted' }, 404: { description: 'Not found' } },
    },
  },
};

export const moduleSchemas = {
  Module: {
    type: 'object',
    properties: {
      _id:         { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d' },
      module_id:   { type: 'string',  example: 'user_management' },
      module_name: { type: 'string',  example: 'User Management' },
      is_active:   { type: 'boolean', example: true },
      createdAt:   { type: 'string',  format: 'date-time' },
      updatedAt:   { type: 'string',  format: 'date-time' },
    },
  },
  CreateModuleDto: {
    type: 'object',
    required: ['module_id', 'module_name'],
    properties: {
      module_id:   { type: 'string', example: 'user_management', description: 'Lowercase slug, e.g. user_management' },
      module_name: { type: 'string', example: 'User Management' },
    },
  },
  UpdateModuleDto: {
    type: 'object',
    properties: {
      module_name: { type: 'string', example: 'User Management' },
      is_active:   { type: 'boolean', example: true },
    },
  },
  PaginatedModuleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Module' } },
          total:      { type: 'integer', example: 10 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 1 },
        },
      },
    },
  },
  ModuleListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data:    { type: 'array', items: { $ref: '#/components/schemas/Module' } },
    },
  },
};
