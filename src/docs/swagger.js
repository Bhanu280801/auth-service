import swaggerJSDoc from "swagger-jsdoc";

const options = {
                definition : {
                openapi : '3.0.0',
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

        info:{
            title: "Auth Microservice API",
            version: "1.0.0",
            description: "JWT Authentication & Authorization Microservice",
        },
         servers: [
             {
    url: "http://localhost:5000",
    description: "Local server",
  },
  {
    url: "https://auth-microservice-5ki0.onrender.com",
    description: "Production server",
  },
     
    ]
    },
    apis: ["./src/routes/*.js"], // Swagger will read routes
}

const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec;