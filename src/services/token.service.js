import jwt from 'jsonwebtoken'

//Generating access token 
export const generateAccessToken = (user)=>{

   return jwt.sign({
    id : user._id,
    role: user.role
   },
   process.env.JWT_ACCESS_SECRET,
   {expiresIn : "15m"}
)
}

//generating refresh token
export const generateRefreshToken = (user)=>{
    return jwt.sign({
        id: user._id,
        role : user.role
    },
    process.env.JWT_REFRESH_SECRET,
    {expiresIn :'7d'}
)
}

//verifying access token

export const verifyAccessToken = (token)=>{

  return jwt.verify(token , process.env.JWT_ACCESS_SECRET)

}

//Verifying refresh token

export const verifyRefreshToken = (token)=>{

    return jwt.verify(token , process.env.JWT_REFRESH_SECRET)
}
