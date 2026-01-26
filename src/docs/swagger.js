import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Auth Microservice API",
      version: "1.0.0",
      description: "JWT Authentication & Authorization Microservice",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
      {
        url: "https://auth-microservice-5ki0.onrender.com",
        description: "Render Production Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.js"], // Reads Swagger comments from routes
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
