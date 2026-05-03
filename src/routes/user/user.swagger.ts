export const userPaths = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users with optional search, filter and pagination (role info embedded via $lookup)',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },         description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 },        description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'nikhil' },  description: 'Search by username or email (case-insensitive)' },
        { in: 'query', name: 'role_id',   schema: { type: 'string'  },                     description: 'Filter by role ObjectId' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true },      description: 'Filter by active status' },
      ],
      responses: {
        200: { description: 'User list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedUserResponse' } } } },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Create a new user',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserDto' } } } },
      responses: { 201: { description: 'User created' }, 400: { description: 'Validation error' }, 409: { description: 'Email already exists' } },
    },
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User found' }, 404: { description: 'Not found' } },
    },
    patch: {
      tags: ['Users'],
      summary: 'Update user',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserDto' } } } },
      responses: { 200: { description: 'User updated' } },
    },
    delete: {
      tags: ['Users'],
      summary: 'Soft-delete user',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User deleted' } },
    },
  },
};

export const userSchemas = {
  User: {
    type: 'object',
    properties: {
      _id:       { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      username:  { type: 'string', example: 'nikhil' },
      email:     { type: 'string', example: 'nikhil@example.com' },
      mobile_no: { type: 'string', example: '+919876543210' },
      role_id:   { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      is_active: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateUserDto: {
    type: 'object',
    required: ['username', 'email', 'mobile_no', 'password', 'role_id'],
    properties: {
      username:  { type: 'string', example: 'nikhil' },
      email:     { type: 'string', format: 'email', example: 'nikhil@example.com' },
      mobile_no: { type: 'string', example: '+919876543210' },
      password:  { type: 'string', format: 'password', minLength: 8, example: 'Secret@123' },
      role_id:   { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
    },
  },
  UpdateUserDto: {
    type: 'object',
    properties: {
      username:  { type: 'string' },
      email:     { type: 'string', format: 'email' },
      mobile_no: { type: 'string' },
      password:  { type: 'string', format: 'password', minLength: 8 },
      role_id:   { type: 'string' },
      is_active: { type: 'boolean' },
    },
  },
  PaginatedUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/User' } },
          total:      { type: 'integer', example: 50 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },
};
