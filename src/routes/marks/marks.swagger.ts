/**
 * marks.swagger.ts — Swagger/OpenAPI definitions for the Marks module.
 * Imported and merged by src/config/swagger.ts.
 */

export const marksPaths = {

  '/marks': {
    get: {
      tags:    ['Marks'],
      summary: 'Get all marks with student info ($lookup join with students collection)',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      parameters: [
        { in: 'query', name: 'page',       schema: { type: 'integer' }, description: 'Page number' },
        { in: 'query', name: 'limit',      schema: { type: 'integer' }, description: 'Items per page' },
        { in: 'query', name: 'student_id', schema: { type: 'string'  }, description: 'Filter by student ObjectId' },
      ],
      responses: {
        200: { description: 'Marks list with student info', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedMarksResponse' } } } },
      },
    },
    post: {
      tags:    ['Marks'],
      summary: 'Create marks for a student',
      security: [{ bearerAuth: [], apiKeyAuth: [] }],
      requestBody: {
        required: true,
        content:  { 'application/json': { schema: { $ref: '#/components/schemas/CreateMarksDto' } } },
      },
      responses: {
        201: { description: 'Marks created', content: { 'application/json': { schema: { $ref: '#/components/schemas/MarksResponse' } } } },
        400: { description: 'Validation error' },
        404: { description: 'Student not found' },
        409: { description: 'Marks already exist for this student' },
      },
    },
  },

  '/marks/student/{studentId}': {
    get: {
      tags:       ['Marks'],
      summary:    'Get marks for a specific student (with student info via $lookup)',
      parameters: [{ in: 'path', name: 'studentId', required: true, schema: { type: 'string' }, description: 'Student MongoDB ObjectId' }],
      responses: {
        200: { description: 'Student marks with student info', content: { 'application/json': { schema: { $ref: '#/components/schemas/MarksResponse' } } } },
        404: { description: 'Marks not found for this student' },
      },
    },
  },

  '/marks/{id}': {
    get: {
      tags:       ['Marks'],
      summary:    'Get marks by marks record ID',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Marks MongoDB ObjectId' }],
      responses: {
        200: { description: 'Marks record', content: { 'application/json': { schema: { $ref: '#/components/schemas/MarksResponse' } } } },
        404: { description: 'Marks not found' },
      },
    },
    patch: {
      tags:       ['Marks'],
      summary:    'Update marks (partial — send only changed subjects). Total, percentage and grade auto-recomputed.',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content:  { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMarksDto' } } },
      },
      responses: {
        200: { description: 'Marks updated with recomputed total/percentage/grade' },
        400: { description: 'Validation error' },
        404: { description: 'Marks not found' },
      },
    },
    delete: {
      tags:       ['Marks'],
      summary:    'Delete a marks record',
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Marks deleted' },
        404: { description: 'Marks not found' },
      },
    },
  },

};

export const marksSchemas = {

  Marks: {
    type: 'object',
    properties: {
      _id:          { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0e' },
      student_id:   { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d' },
      hindi:        { type: 'integer', example: 85 },
      english:      { type: 'integer', example: 90 },
      math:         { type: 'integer', example: 78 },
      science:      { type: 'integer', example: 92 },
      sst:          { type: 'integer', example: 88 },
      total:        { type: 'integer', example: 433 },
      percentage:   { type: 'number',  example: 86.6 },
      result_grade: { type: 'string',  example: 'A' },
      createdAt:    { type: 'string',  format: 'date-time' },
      updatedAt:    { type: 'string',  format: 'date-time' },
    },
  },

  MarksWithStudent: {
    type: 'object',
    description: 'Marks record with joined student info (via MongoDB $lookup)',
    properties: {
      _id:          { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0e' },
      hindi:        { type: 'integer', example: 85 },
      english:      { type: 'integer', example: 90 },
      math:         { type: 'integer', example: 78 },
      science:      { type: 'integer', example: 92 },
      sst:          { type: 'integer', example: 88 },
      total:        { type: 'integer', example: 433 },
      percentage:   { type: 'number',  example: 86.6 },
      result_grade: { type: 'string',  example: 'A' },
      student: {
        type: 'object',
        description: 'Student info joined from students collection via $lookup on student_id',
        properties: {
          _id:      { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
          name:     { type: 'string', example: 'John Doe' },
          email:    { type: 'string', example: 'john@example.com' },
          grade:    { type: 'string', example: 'A' },
          phone:    { type: 'string', example: '+91-9876543210' },
          is_active:{ type: 'boolean', example: true },
        },
      },
    },
  },

  CreateMarksDto: {
    type: 'object',
    required: ['student_id', 'hindi', 'english', 'math', 'science', 'sst'],
    properties: {
      student_id: { type: 'string',  example: '664f1a2b3c4d5e6f7a8b9c0d', description: 'MongoDB ObjectId of the student' },
      hindi:      { type: 'integer', minimum: 0, maximum: 100, example: 85 },
      english:    { type: 'integer', minimum: 0, maximum: 100, example: 90 },
      math:       { type: 'integer', minimum: 0, maximum: 100, example: 78 },
      science:    { type: 'integer', minimum: 0, maximum: 100, example: 92 },
      sst:        { type: 'integer', minimum: 0, maximum: 100, example: 88 },
    },
  },

  UpdateMarksDto: {
    type: 'object',
    description: 'All fields optional. total, percentage and result_grade are auto-recomputed after update.',
    properties: {
      hindi:   { type: 'integer', minimum: 0, maximum: 100 },
      english: { type: 'integer', minimum: 0, maximum: 100 },
      math:    { type: 'integer', minimum: 0, maximum: 100 },
      science: { type: 'integer', minimum: 0, maximum: 100 },
      sst:     { type: 'integer', minimum: 0, maximum: 100 },
    },
  },

  MarksResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string',  example: 'Marks fetched successfully' },
      data:    { $ref: '#/components/schemas/MarksWithStudent' },
    },
  },

  PaginatedMarksResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/MarksWithStudent' } },
          total:      { type: 'integer' },
          page:       { type: 'integer' },
          limit:      { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  },

};
