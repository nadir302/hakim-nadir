import swaggerJsdoc from 'swagger-jsdoc';

const prodUrl = process.env.RENDER_EXTERNAL_URL || 'https://hakim-nadir-5.onrender.com';
const prodServer = prodUrl.includes('localhost')
  ? { url: 'https://hakim-nadir-5.onrender.com', description: 'Production server' }
  : { url: prodUrl, description: 'Production server' };

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Shuttle Management System API',
      version: '1.0.0',
      description: 'Enterprise-grade API for managing shuttle transportation for events.',
      contact: {
        name: 'API Support',
        email: 'support@smartshuttle.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      prodServer,
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
