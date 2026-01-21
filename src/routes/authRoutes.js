import express from 'express'

import { loginUser, registerUser , refreshAccessToken , logoutUser} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js';
import {profile}  from '../controllers/auth.controller.js'

const router = express.Router();

router.post("/register", registerUser)

router.post("/login" , loginUser)

router.post('/refresh-token' , refreshAccessToken)

router.get('/profile', protect , profile)

router.post('/logout',protect , logoutUser)

export default  router