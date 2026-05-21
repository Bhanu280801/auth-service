import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './config/db.js'

dotenv.config()

const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`[CRITICAL STARTUP ERROR] Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5000;

//connect to database and then start server

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on Port ${PORT}`)
    })
})