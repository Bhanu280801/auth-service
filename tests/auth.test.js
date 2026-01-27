import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import RefreshToken from '../src/models/RefreshToken.js';
import TokenBlacklist from '../src/models/TokenBlacklist.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to a test database or use existing one carefully
// IMPORTANT: In production, use a separate test DB.
// For this demo, we assume the environment is set to TEST or similar.

beforeAll(async () => {
    // If we are not connected, connect
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    // Cleanup
    await User.deleteMany({ email: 'testuser@example.com' });
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {

    let userToken;
    let userRefreshToken;
    let verificationToken;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('email', 'testuser@example.com');

        // Fetch user to get verification token for next test
        const user = await User.findOne({ email: 'testuser@example.com' });
        verificationToken = user.verificationToken;
    });

    it('should verify email', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({
                email: 'testuser@example.com',
                otp: verificationToken
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Email verified successfully');
    });

    it('should login user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');

        userToken = res.body.accessToken;
        userRefreshToken = res.body.refreshToken;
    });

    it('should access protected profile route', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
    });

    it('should refresh access token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({
                refreshToken: userRefreshToken
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        // Because of rotation, we should get a new refresh token too
        expect(res.body).toHaveProperty('refreshToken');

        userToken = res.body.accessToken;
        userRefreshToken = res.body.refreshToken;
    });

    it('should logout user', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                refreshToken: userRefreshToken
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Loged out sucessfully');
    });

    it('should not access profile after logout (token blacklisted)', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(401);
    });

});
