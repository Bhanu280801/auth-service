import User from '../models/User.js'

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