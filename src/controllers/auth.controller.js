import User from '../models/User.js'

import { generateAccessToken , generateRefreshToken, verifyRefreshToken } from '../services/token.service.js'

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
        console.error('Register error' , error.message)
         res.status(500).json({
            success: false,
            message :'server error during registration'
        })
    }
}

export const loginUser =async(req,res)=>{
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
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
 }
}

//
export const refreshAccessToken =async (req, res)=>{

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
console.error("Refresh Token Error:", error.message);

res.status(500).json({
      success: false,
      message: "Server error while refreshing token",
    });

}

}

