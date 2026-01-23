import mongoose from 'mongoose'

const connectDB = async()=>{
    try {
        const con = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MONGODB CONNECTED  ${con.connection.host} `)
    } catch (error) {
        console.log('MongoDb connection failed ' , error.message)
    }
}


export default connectDB