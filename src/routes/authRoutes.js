/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */


import express from 'express'

import { loginUser, registerUser , refreshAccessToken , logoutUser} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js';
import {profile}  from '../controllers/auth.controller.js'
import { authorizeRoles} from '../middleware/role.middleware.js';
import { Roles } from '../constants/roles.js';
import { loginRateLimitter } from '../middleware/ratelimitter.js';
import { forgetPassword , verifyOTP , resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bhanu
 *               email:
 *                 type: string
 *                 example: bhanu@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", registerUser);

router.post("/register", registerUser)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: bhanu@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post("/login" ,loginRateLimitter, loginUser)

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Generate a new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token_here
 *     responses:
 *       200:
 *         description: New access token generated
 */

router.post('/refresh-token' , refreshAccessToken)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get logged-in user's profile (Protected)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get('/profile', protect , profile)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user by blacklisting token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post('/logout',protect , logoutUser)

router.get('/admin/dashboard' , protect , authorizeRoles(Roles.ADMIN) , (req,res)=>{

    res.status(200).json({
      success :true,
      message : "Welcome admin"
    })
})

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP to email for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: bhanu@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */

router.post('/forgot-password' , forgetPassword)

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: bhanu@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */

router.post('/verify-otp' , verifyOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: bhanu@gmail.com
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 */

router.post('/reset-password', resetPassword);

//http://localhost:5000/api-docs/#/Auth/post_api_auth_register

export default  router