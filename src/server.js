import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './config/db.js'

dotenv.config()

const PORT = process.env.PORT ||5000;

//connect to database and then start server

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on Port ${PORT}`)
    })
})