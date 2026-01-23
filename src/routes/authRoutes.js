import express from 'express'

import { loginUser, registerUser , refreshAccessToken , logoutUser} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js';
import {profile}  from '../controllers/auth.controller.js'
import { authorizeRoles} from '../middleware/role.middleware.js';
import { Roles } from '../constants/roles.js';
import { loginRateLimitter } from '../middleware/ratelimitter.js';
import { forgetPassword , verifyOTP , resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/register", registerUser)

router.post("/login" ,loginRateLimitter, loginUser)

router.post('/refresh-token' , refreshAccessToken)

router.get('/profile', protect , profile)

router.post('/logout',protect , logoutUser)

router.get('/admin/dashboard' , protect , authorizeRoles(Roles.ADMIN) , (req,res)=>{

    res.status(200).json({
      success :true,
      message : "Welcome admin"
    })
})

router.post('/forgot-password' , forgetPassword)

router.post('/verify-otp' , verifyOTP);

router.post('/reset-password', resetPassword);

export default  router