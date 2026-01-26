import express  from "express";
import cors from "cors"
import helmet  from "helmet";
import morgan from "morgan";
import authRoutes from './routes/authRoutes.js'
import { errorHandler } from "./middleware/errormiddleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js'

const app = express();

//Middleware
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(errorHandler)

// Swagger Docs Route

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Routes 
app.use("/api/auth" , authRoutes)


//Basic test route
app.get('/ ',(req,res)=>{
    res.send("Auth microservice is running")
})

export default app