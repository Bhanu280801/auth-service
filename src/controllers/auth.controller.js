import User from '../models/User.js'
import jwt from 'jsonwebtoken'

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/token.service.js'

import { generateOTP } from '../utils/generateOTP.js'

import { sendEmail } from '../services/email.service.js'

import TokenBlacklist from '../models/TokenBlacklist.js'
import RefreshToken from '../models/RefreshToken.js'

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        //check if all fields are provided
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        const existingUser = await User.findOne({ email })

        console.log(existingUser);

        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: 'Email already registered'
            })
        }

        const verificationToken = generateOTP();
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = await User.create({
            name,
            email,
            password,
            verificationToken,
            verificationTokenExpires
        })

        await sendEmail(
            email,
            "Verify your email",
            `Your verification code is ${verificationToken}`
        )

        //sending response and it doesn't contain password
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            })
        }

        const user = await User.findOne({ email }).select("+password +twoFactorSecret")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            })
        }

        //compare password
        const isMatch = await user.comparePassword(password)
        console.log(isMatch)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            })
        }

        // Check 2FA
        if (user.isTwoFactorEnabled) {
            const { totp } = req.body;

            if (!totp) {
                return res.status(400).json({
                    success: false,
                    message: "2FA token required",
                    require2FA: true
                });
            }

            const speakeasy = (await import('speakeasy')).default;

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: totp
            });

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid 2FA token"
                });
            }
        }

        //generate access token and verify token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in database
        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            accessToken,
            refreshToken,
        });

    } catch (error) {
        next(error)
    }
}


export const refreshAccessToken = async (req, res, next) => {

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh access token is required"
            })
        }

        //verify refresh access token
        let decode;

        try {
            decode = verifyRefreshToken(refreshToken)
            console.log(decode)
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            })
        }

        // Check if refresh token exists in DB
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // creating new access token
        const newAccessToken = generateAccessToken({
            _id: decode.id,
            role: decode.role || 'user',

        })

        // Rotate refresh token
        await storedToken.deleteOne();

        const newRefreshToken = generateRefreshToken({ _id: decode.id, role: decode.role });
        await RefreshToken.create({
            token: newRefreshToken,
            user: decode.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({
            success: true,
            message: "New access token generated",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    } catch (error) {
        next(error)

    }

}
//Profile function
export const profile = async (req, res, next) => {

    try {
        const user = await User.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"

            })
        }

        res.status(200).json({
            user: {
                name: user.name,
                email: user.email,
            }
        })
    } catch (error) {
        next(error)
    }
}

//logout function

export const logoutUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(400).json({
                success: false,
                message: "No token provided"
            })

        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.decode(token)

        if (!decoded || !decoded.exp) {

            return res.status(400).json({

                success: false,
                message: "Invalid or expired token"

            })
        }

        const expiresAt = new Date(decoded.exp * 1000)

        await TokenBlacklist.create({

            token,
            expiresAt
        })

        // Also remove refresh token if provided
        if (req.body.refreshToken) {
            await RefreshToken.deleteOne({ token: req.body.refreshToken });
        }

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {

        next(error)
    }
}

//forgot password functionality

export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const otp = generateOTP();
        user.otp = otp;

        user.otpExpires = Date.now() + 10 * 60 * 1000; // expires after 10 minutes

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
    } catch (error) {
        next(error)
    }
}

// verify otp functionality

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email })

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {

            return res.status(200).json({
                success: false,
                message: " Invalid or expired otp"

            })
        }

        res.status(200).json({
            success: true,
            message: "OTP verified",
        });
    } catch (error) {
        next(error)
    }
}

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        if (user.verificationToken !== otp || user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        next(error);
    }
}

//Reset password functionality
export const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found "
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
    } catch (error) {
        next(error)
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect old password"
            });
        }

        user.password = newPassword;
        await user.save();

        // Optional: Revoke all sessions (delete all refresh tokens for this user)
        // This forces re-login on all devices which is good security practice after password change
        await RefreshToken.deleteMany({ user: user._id });

        res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });
    } catch (error) {
        next(error);
    }
}