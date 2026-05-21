import express from "express";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from './routes/auth.routes.js'
import { errorHandler } from "./middleware/error.middleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js'
import passport from './config/passport.setup.js';

const app = express();
app.set("trust proxy", 1);

app.use(express.json())

// ✅ Fixed CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions))
app.use(helmet())
app.use(morgan('dev'))
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes)

app.get('/', (req, res) => {
    res.send("Auth microservice is running")
})

app.use(errorHandler);

export default app