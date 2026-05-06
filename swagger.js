const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endPointsFiles = ['./src/app.js'];

const doc = {
  info: {
      title: 'API de Gestión Minera',
      version: '1.0.0',
      description: 'Documentación completa de la API',
      contact: {
        name: 'Soporte Técnico',
        email: 'jhoel.dioses@hotmail.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo',
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
  },
  host: 'localhost:3000',
  schemes: ['https'],
};

swaggerAutogen(outputFile, endPointsFiles, doc);
