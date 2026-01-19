import mongoose  from "mongoose";
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    name:{
        type :String,
        required :true,
        trim : true
    },
    email :{
        type: String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    password:{
        type : String,
        require: true,
        minlegth : 6,
        select : false
    },
    role:{
        type: String,
        enum:['user','admin'],
        default:'user'
    },
    isVerified :{
        type : Boolean,
        default : false
    },
    otp:{
        type: String,
        default : null,
    },
    otpExpires:{
        type: Date,
        default: null
    }
},
{timestamps: true}
)

//hash passwords before saving to database

UserSchema.pre('save', async function () {
    if(!this.isModified('password')) {
        return 
    }

        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        
})

//compare entered password with hashed password

UserSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password)
}

const User = mongoose.model('User', UserSchema)

export default User