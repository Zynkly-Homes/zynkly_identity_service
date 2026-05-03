export const authPaths = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login and receive JWT token',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginDto' } } } },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                      user:  { $ref: '#/components/schemas/JwtPayload' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Validation error' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/auth/profile': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user profile (requires JWT)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Profile data' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};

export const authSchemas = {
  LoginDto: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email:    { type: 'string', format: 'email', example: 'admin@example.com' },
      password: { type: 'string', format: 'password', example: 'Admin@1234' },
    },
  },
  JwtPayload: {
    type: 'object',
    properties: {
      user_id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
      email:   { type: 'string', example: 'admin@example.com' },
      role_id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0e' },
    },
  },
};
