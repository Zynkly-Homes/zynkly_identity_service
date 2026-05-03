/**
 * student.swagger.ts — Swagger/OpenAPI definitions for the Student module.
 *
 * WHY folder-based swagger:
 * When the project has 10+ resources, one monolithic swagger.ts becomes unmanageable.
 * Each module owns its swagger paths + schemas. The central config/swagger.ts merges them all.
 * Adding a new module = create a new swagger file and spread it in — zero changes to other modules.
 */

export const studentPaths = {

  '/students': {
    get: {
      tags:    ['Students'],
      summary: 'Get all students with optional filtering and pagination',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page',      schema: { type: 'integer', example: 1 },         description: 'Page number' },
        { in: 'query', name: 'limit',     schema: { type: 'integer', example: 10 },        description: 'Items per page' },
        { in: 'query', name: 'search',    schema: { type: 'string',  example: 'john' },    description: 'Search by name or email (case-insensitive)' },
        { in: 'query', name: 'grade',     schema: { type: 'string',  example: 'A' },       description: 'Filter by exact grade' },
        { in: 'query', name: 'is_active', schema: { type: 'boolean', example: true },      description: 'Filter by active status' },
      ],
      responses: {
        200: { description: 'Student list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedStudentResponse' } } } },
      },
    },
    post: {
      tags:    ['Students'],
      summary: 'Create a new student',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      requestBody: {
        required: true,
        content:  { 'application/json': { schema: { $ref: '#/components/schemas/CreateStudentDto' } } },
      },
      responses: {
        201: { description: 'Student created', content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentResponse' } } } },
        400: { description: 'Validation error' },
        409: { description: 'Email already exists' },
      },
    },
  },

  '/students/summary/grades': {
    get: {
      tags:    ['Students'],
      summary: 'Grade summary — count & average age per grade (MongoDB $group aggregation)',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      responses: {
        200: {
          description: 'Grade summary',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id:    { type: 'string',  example: 'A' },
                        count:  { type: 'integer', example: 12 },
                        avgAge: { type: 'number',  example: 17.5 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/students/{id}': {
    get: {
      tags:       ['Students'],
      summary:    'Get student by ID',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId' }],
      responses: {
        200: { description: 'Student found',   content: { 'application/json': { schema: { $ref: '#/components/schemas/StudentResponse' } } } },
        404: { description: 'Student not found' },
        400: { description: 'Invalid ID format' },
      },
    },
    patch: {
      tags:       ['Students'],
      summary:    'Update a student (partial — send only changed fields)',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content:  { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStudentDto' } } },
      },
      responses: {
        200: { description: 'Student updated' },
        400: { description: 'Validation error' },
        404: { description: 'Student not found' },
        409: { description: 'Email already taken' },
      },
    },
    delete: {
      tags:       ['Students'],
      summary:    'Permanently delete a student',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Student deleted' },
        404: { description: 'Student not found' },
      },
    },
  },
};

export const studentSchemas = {

  Student: {
    type: 'object',
    properties: {
      _id:       { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d' },
      name:      { type: 'string',  example: 'John Doe' },
      email:     { type: 'string',  example: 'john@example.com' },
      age:       { type: 'integer', example: 20 },
      grade:     { type: 'string',  example: 'A' },
      phone:     { type: 'string',  example: '+91-9876543210' },
      address:   { type: 'string',  example: '123 Main St, Mumbai' },
      is_active: { type: 'boolean', example: true },
      createdAt: { type: 'string',  format: 'date-time' },
      updatedAt: { type: 'string',  format: 'date-time' },
    },
  },

  CreateStudentDto: {
    type: 'object',
    required: ['name', 'email', 'age', 'grade'],
    properties: {
      name:    { type: 'string',  minLength: 2, maxLength: 100, example: 'John Doe' },
      email:   { type: 'string',  format: 'email', example: 'john@example.com' },
      age:     { type: 'integer', minimum: 5, maximum: 100, example: 20 },
      grade:   { type: 'string',  example: 'A' },
      phone:   { type: 'string',  example: '+91-9876543210' },
      address: { type: 'string',  example: '123 Main St' },
    },
  },

  UpdateStudentDto: {
    type: 'object',
    description: 'All fields optional — send only what needs to change',
    properties: {
      name:      { type: 'string',  minLength: 2 },
      email:     { type: 'string',  format: 'email' },
      age:       { type: 'integer', minimum: 5 },
      grade:     { type: 'string' },
      phone:     { type: 'string' },
      address:   { type: 'string' },
      is_active: { type: 'boolean' },
    },
  },

  StudentResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string',  example: 'Student fetched successfully' },
      data:    { $ref: '#/components/schemas/Student' },
    },
  },

  PaginatedStudentResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Student' } },
          total:      { type: 'integer', example: 50 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },

};
