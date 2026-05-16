# Auth Service

A full-stack authentication and access-control project with an Express/MongoDB backend and a Next.js frontend dashboard.

Live API docs:

```text
https://auth-microservice-5ki0.onrender.com/api-docs/
```

## Features

- User registration and email OTP verification
- Login with JWT access and refresh tokens
- Refresh-token rotation stored in MongoDB
- Logout with access-token blacklist
- Password reset with OTP verification
- Password change for authenticated users
- Two-factor authentication with authenticator apps
- Google OAuth login
- Role-based admin route protection
- Swagger API documentation
- Next.js frontend with login, register, dashboard, profile, forgot password, email verification, and 2FA flows

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB and Mongoose
- JWT
- Passport Google OAuth
- Speakeasy and QRCode for 2FA
- Joi validation
- Jest and Supertest

Frontend:

- Next.js
- React
- TypeScript
- TanStack Query
- Zustand
- Axios
- Tailwind CSS
- shadcn/base-ui components

## Project Structure

```text
auth-service/
  src/
    app.js
    server.js
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    docs/
  tests/
  frontend/
    app/
    components/
    lib/
    services/
    store/
```

## Backend Setup

Install backend dependencies from the project root:

```bash
npm install
```

Create a root `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

Start the backend:

```bash
npm run dev
```

Backend local URL:

```text
http://localhost:5000
```

Swagger docs:

```text
http://localhost:5000/api-docs
```

Run backend tests:

```bash
npm test
```

## Frontend Setup

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create `frontend/.env` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend local URL:

```text
http://localhost:3000
```

Build the frontend:

```bash
npm run build
```

The frontend build uses webpack mode because it is more reliable on Windows/OneDrive than Turbopack for this project.

## Deployment

### Backend

The backend is deployed on Render:

```text
https://auth-microservice-5ki0.onrender.com
```

Set the same backend environment variables in your Render dashboard:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Frontend

Deploy the frontend on Vercel with these settings:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: leave empty
Install Command: npm install
```

Set this Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://auth-microservice-5ki0.onrender.com/api
```

Do not use `localhost` in Vercel.

## Important Environment Notes

Local frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Vercel frontend:

```env
NEXT_PUBLIC_API_URL=https://auth-microservice-5ki0.onrender.com/api
```

These use the same key but different values because local and deployed environments point to different backend URLs.

## Main API Routes

```text
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
POST /api/auth/refresh-token
GET  /api/auth/profile
POST /api/auth/logout
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/admin/dashboard
```

## 2FA Login Flow

1. User logs in with email and password.
2. If 2FA is enabled, backend responds with `require2FA: true`.
3. Frontend displays an authenticator-code field.
4. User enters the 6-digit code from their authenticator app.
5. Backend verifies the code and returns tokens.

## Useful Commands

Backend:

```bash
npm run dev
npm test
npm start
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## Author

Bhanu Prakash
