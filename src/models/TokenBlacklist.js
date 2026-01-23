import mongoose from 'mongoose'

const TokenBlacklistSchema = new mongoose.Schema({
token:{
    type: String,
    unique:true,
    required : true
},
expiresAt:{
    type:Date,
    required : true,
},

},{timestamps : true})

//Automatically delete expired tokens

TokenBlacklistSchema.index({expiresAt :1},{expireAfterSeconds : 0})

const TokenBlacklist= mongoose.model("TokenBlaclist" , TokenBlacklistSchema)

export default TokenBlacklist