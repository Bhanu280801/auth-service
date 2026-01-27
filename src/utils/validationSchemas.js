import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    otp: Joi.string().length(6).required(),
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    newPassword: Joi.string().min(6).required(),
});

export const verifyEmailSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    otp: Joi.string().length(6).required()
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});
