import express from 'express'

import { loginUser, registerUser , refreshAccessToken } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/register", registerUser)

router.post("/login" , loginUser)

router.post('/refresh-token' , refreshAccessToken)

router.get('/profile' , protect ,(req,res)=>{
    res.status(200).json({
        success : true,
        message: 'Profile fetched sucessfully',
        user : req.user
    })
})

export default  router