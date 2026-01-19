import express  from "express";
import cors from "cors"
import helmet  from "helmet";
import morgan from "morgan";
import authRoutes from './routes/authRoutes.js'

const app = express();

//Middleware
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

//Routes 
app.use("/api/auth" , authRoutes)

//Basic test route
app.get('/ ',(req,res)=>{
    res.send("Auth microservice is running")
})

export default app