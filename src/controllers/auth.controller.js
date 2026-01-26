import User from '../models/User.js'
import jwt from 'jsonwebtoken'

import { generateAccessToken , generateRefreshToken, verifyRefreshToken } from '../services/token.service.js'

import { generateOTP } from '../utils/generateOTP.js'

import { sendEmail } from '../services/email.service.js'

import TokenBlacklist from '../models/TokenBlacklist.js'

export const registerUser = async (req,res)=> {
    try {
        const {name , email , password} = req.body

        //check if all fields are provided
        if(!email || !name || !password){
            return res.status(400).json({
                success : false,
                message:'All fields are required'
            })
        }

        const existingUser = await User.findOne({email})
        
        console.log(existingUser);

        if(existingUser){
            return res.status(400).json({
                status : false,
                message :'Email already registered'
            })
        }

        const user = await User.create({
            name,
            email,
            password,
        })

        //sending response and it doesn't contain password
        res.status(201).json({
            success:true,
            message :'User registered sucessfully',
            user:{
                id: user._id,
                name : user.name,
                email : user.email,
                role :user.role,
                isVerified : user.isVerified
            }
        })
    } catch (error) {
       next(error)
    }
}

export const loginUser =async(req,res,next)=>{
 try {

    const {email , password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            success : false,
            message :"Email and Password are required"
        })
    }

    const user = await User.findOne({email}).select("+password")

    if(!user){
        return res.status(400).json({
            success : false,
            message :'Invalid username or password'
        })
    }

    //compare password
    const isMatch = await user.comparePassword(password)
    console.log(isMatch)

    if(!isMatch){
        return res.status(400).json({
            success : false,
            message :"Invalid username or password"
        })
    }
//generate access token and verify token
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

res.status(200).json({
    success : true,
    message :"Login Sucessful",
    accessToken,
    refreshToken,
});

 } catch (error) {
   next(error)
 }
}


export const refreshAccessToken =async (req, res, next)=>{

try{
    const {refreshToken} = req.body;
      
    if(!refreshToken){
        return res.status(400).json({
            success :false,
            message :"Refresh access token is required"
        })
    }

    //verify refresh access token
    let decode ;

    try {
      decode = verifyRefreshToken(refreshToken)
      console.log(decode)
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : 'Invalid or expired refresh token'
        })
    }

    // creating new access token
    const newAccessToken = generateAccessToken({
        _id : decode.id,
        role :decode.role || 'user',
        
    })

    res.status(200).json({
        success : true,
        message :"New access token generated",
        accessToken : newAccessToken
    })
}catch(error){
next(error)

}

}
//Profile function
export const profile = async(req,res,next)=>{
      
    try {
    const user = await User.findById(req.user.id).select("-password")

    if(!user){
        return res.status(404).json({
            success : false,
            message:"User not found"

        })
    }

    res.status(200).json({
        user :{
            name : user.name,
           email : user.email,
        }
    })
      } catch(error) {
        next(error)
      }
}

//logout function

export const logoutUser = async(req ,res, next)=>{
try{
const authHeader = req.headers.authorization;

if(!authHeader || !authHeader.startsWith("Bearer ")){

   return res.status(400).json({
        success : false,
        message: "No token provided"
    })

}
const token = authHeader.split(" ")[1];

const decoded = jwt.decode(token)

if(!decoded || !decoded.exp){

    return res.status(400).json({

        success:false,
        message :"Invalid or expired token"

    })
}

    const expiresAt = new Date(decoded.exp *1000)

    await TokenBlacklist.create({

        token,
        expiresAt
    })
    res.status(200).json({
        success:true,
        message : "Loged out sucessfully"
    })
}catch(error){

next(error)
}
}

//forgot password functionality

export const forgetPassword = async(req , res)=>{
    
    const {email} = req.body;

    const user = await User.findOne({email})

    if(!user){
        return res.status(400).json({
            success : false,
            message :"User not found"
        })
    }

    const otp = generateOTP();
    user.otp = otp;

    user.otpExpires = Date.now() + 10*60*1000; // expires after 10 minutes

    await user.save();

    await sendEmail(
        email,
       "Password Reset OTP",
       `Your OTP is ${otp}. It is valid for 10 minutes.`
    )

     res.status(200).json({
     success: true,
     message: "OTP sent to email",
  });

}

// verify otp functionality

export const verifyOTP = async (req, res)=>{
    const {email , otp } =  req.body;

    const user = await User.findOne({email})

    if(!user || user.otp !== otp  || user.otpExpires < Date.now()){

        return res.status(200).json({
        success : false,
        message :" Invalid or expired otp"

        })
    }

    res.status(200).json({
    success: true,
    message: "OTP verified",
  });

}

//Reset password functionality
export const resetPassword = async(req,res)=>{

    const {email , newPassword } = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            success : false,
            message : "User not found "
        })
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
    success: true,
    message: "Password reset successful",
  });

}