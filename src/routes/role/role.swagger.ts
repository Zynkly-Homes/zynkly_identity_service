export const rolePaths = {
  '/roles': {
    get: {
      tags: ['Roles'],
      summary: 'Get all roles with optional search, filter and pagination',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },        description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 },       description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'admin' },  description: 'Search by role_name (case-insensitive)' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true },     description: 'Filter by active status' },
      ],
      responses: {
        200: { description: 'Role list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedRoleResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Roles'],
      summary: 'Create a new role',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoleDto' } } } },
      responses: { 201: { description: 'Role created' }, 400: { description: 'Validation error' }, 409: { description: 'Role already exists' } },
    },
  },
  '/roles/{id}': {
    get: {
      tags: ['Roles'],
      summary: 'Get role by ID',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Role found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['Roles'],
      summary: 'Update role',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateRoleDto' } } } },
      responses: { 200: { description: 'Role updated' } },
    },
    delete: {
      tags: ['Roles'],
      summary: 'Soft-delete role',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Role deleted' } },
    },
  },
};

export const roleSchemas = {
  ModuleAccess: {
    type: 'object',
    required: ['module_id', 'create', 'edit', 'view', 'delete', 'transfer', 'export'],
    properties: {
      module_id: { type: 'string',  example: 'user_management' },
      create:    { type: 'boolean', example: true },
      edit:      { type: 'boolean', example: true },
      view:      { type: 'boolean', example: true },
      delete:    { type: 'boolean', example: false },
      transfer:  { type: 'boolean', example: false },
      export:    { type: 'boolean', example: true },
    },
  },
  Role: {
    type: 'object',
    properties: {
      _id:         { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      role_name:   { type: 'string', example: 'Admin' },
      role_access: { type: 'array', items: { $ref: '#/components/schemas/ModuleAccess' } },
      is_active:   { type: 'boolean', example: true },
      createdAt:   { type: 'string', format: 'date-time' },
      updatedAt:   { type: 'string', format: 'date-time' },
    },
  },
  CreateRoleDto: {
    type: 'object',
    required: ['role_name', 'role_access'],
    properties: {
      role_name:   { type: 'string', example: 'Editor' },
      role_access: { type: 'array', items: { $ref: '#/components/schemas/ModuleAccess' }, minItems: 1 },
    },
  },
  PaginatedRoleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Role' } },
          total:      { type: 'integer', example: 20 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
    },
  },
  UpdateRoleDto: {
    type: 'object',
    properties: {
      role_name:   { type: 'string', example: 'Editor' },
      role_access: { type: 'array', items: { $ref: '#/components/schemas/ModuleAccess' } },
      is_active:   { type: 'boolean' },
    },
  },
};
