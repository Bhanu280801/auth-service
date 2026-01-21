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

TokenBlacklistSchema.index({expiresAt :0 },{expireAfterSeconds : 1})

const TokenBlacklist= mongoose.model("TokenBloaclist" , TokenBlacklistSchema)

export default TokenBlacklist