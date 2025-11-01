import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tablu Stations API',
      version: '1.0.0',
      description: 'API documentation for Tablu Stations Reservation System',
      contact: {
        name: 'API Support',
        email: 'support@tablu.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.tablu.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            advertiserName: {
              type: 'string',
              example: 'Acme Corp',
            },
            customerName: {
              type: 'string',
              example: 'Jane Smith',
            },
            location: {
              type: 'string',
              example: 'Station A - Platform 1',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-01T09:00:00.000Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-08T09:00:00.000Z',
            },
            status: {
              type: 'string',
              enum: ['WAITING', 'ACTIVE', 'ENDING_SOON', 'COMPLETED'],
              example: 'ACTIVE',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
          },
        },
        ReservationStatus: {
          type: 'string',
          enum: ['WAITING', 'ACTIVE', 'ENDING_SOON', 'COMPLETED'],
          description: `
- WAITING: Reservation start time is in the future
- ACTIVE: Current time is between start and end time
- ENDING_SOON: Less than 48 hours until end time
- COMPLETED: End time has passed
          `,
        },
        Role: {
          type: 'string',
          enum: ['USER', 'ADMIN'],
          description: `
- USER: Regular user with access to own reservations
- ADMIN: Administrator with full access to all resources
          `,
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
