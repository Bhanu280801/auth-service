import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';

// Setup 2FA - Generates Secret and QR Code
export const setup2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.isTwoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is already enabled"
            });
        }

        const secret = speakeasy.generateSecret({
            name: `AuthService (${user.email})`
        });

        // Temporarily store secret or just return it to be verified
        // We will store it ONLY after verification to prevent lockout
        // For now, we return it to client, client sends it back with token to verify.
        // BETTER: Store it in DB but maybe mark 'pending'?
        // SIMPLEST: Return secret, user sends secret + token to 'verify'.

        // Let's store it in user but keep isTwoFactorEnabled = false
        user.twoFactorSecret = secret.base32;
        await user.save();

        const dataUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.status(200).json({
            success: true,
            secret: secret.base32,
            qrCode: dataUrl,
            message: "Scan this QR code with Google Authenticator"
        });

    } catch (error) {
        next(error);
    }
};

// Verify 2FA - Enables it if token is correct
export const verify2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id).select("+twoFactorSecret");

        if (user.isTwoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is already enabled"
            });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: "Please setup 2FA first"
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }

        user.isTwoFactorEnabled = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "2FA enabled successfully"
        });

    } catch (error) {
        next(error);
    }
};

// Disable 2FA
export const disable2FA = async (req, res, next) => {
    try {
        const { token } = req.body; // Require token to disable for security
        const user = await User.findById(req.user.id).select("+twoFactorSecret");

        if (!user.isTwoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: "2FA is not enabled"
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid token. Cannot disable 2FA."
            });
        }

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "2FA disabled successfully"
        });
    } catch (error) {
        next(error);
    }
};
