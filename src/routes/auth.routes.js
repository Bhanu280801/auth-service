import express from 'express'
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  changePassword,
  profile,
  forgetPassword,
  verifyOTP,
  resetPassword
} from '../controllers/auth.controller.js'
import { setup2FA, verify2FA, disable2FA } from '../controllers/twoFactor.controller.js';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '../services/token.service.js';
import RefreshToken from '../models/RefreshToken.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { Roles } from '../constants/roles.js';
import { loginRateLimitter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  verifyEmailSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../utils/validationSchemas.js';
import { getBlacklist, getUsers, updateUserRole, deleteUser } from '../controllers/admin.controller.js';

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), registerUser);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", loginRateLimitter, validate(loginSchema), loginUser);
router.post('/refresh-token', validate(refreshTokenSchema), refreshAccessToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgetPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/profile', protect, profile);
router.post('/logout', protect, logoutUser);
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);

// ─── 2FA Routes ───────────────────────────────────────────────────────────────
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

// ─── Google OAuth Routes ──────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    // ✅ was '/login' (backend route), now points to frontend
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      // ✅ Safety guard
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=no_user`
        );
      }

      // req.user here is the full Mongoose document from Passport
      // so req.user._id exists and is a valid ObjectId ✅
      const accessToken = generateAccessToken(req.user);
      const refreshToken = generateRefreshToken(req.user);

      // ✅ Persist refresh token
      await RefreshToken.create({
        token: refreshToken,
        user: req.user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/login?token=${accessToken}&refreshToken=${refreshToken}`
      );

    } catch (error) {
      // ✅ Catches token generation or DB errors — was completely unhandled before
      console.error('Google OAuth callback error:', error.message);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/dashboard', protect, authorizeRoles(Roles.ADMIN), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome admin' });
});
router.get('/admin/blacklist', protect, authorizeRoles(Roles.ADMIN), getBlacklist);
router.get('/admin/users', protect, authorizeRoles(Roles.ADMIN), getUsers);
router.patch('/admin/users/:id/role', protect, authorizeRoles(Roles.ADMIN), updateUserRole);
router.delete('/admin/users/:id', protect, authorizeRoles(Roles.ADMIN), deleteUser);

export default router;