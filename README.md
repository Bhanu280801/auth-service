# Auth Service

A production-style authentication and access-control system built with an Express/MongoDB API and a Next.js frontend dashboard.

The project demonstrates secure account creation, email verification, JWT session handling, refresh-token rotation, logout invalidation, role-based access control, password recovery, Google OAuth, and two-factor authentication.

Live API docs:

```text
https://auth-microservice-5ki0.onrender.com/api-docs/
```

## Highlights

- Full-stack auth flow with a deployed backend and deployable Next.js frontend
- Email OTP verification for new accounts
- JWT access tokens plus stateful refresh tokens
- Refresh-token rotation to reduce stolen-token risk
- Token blacklist for immediate logout
- Password reset flow protected by OTP verification
- TOTP-based 2FA using authenticator apps
- Google OAuth with Passport
- Role-based route protection
- Request validation with Joi
- Swagger API documentation
- Integration tests with Jest and Supertest

## System Architecture

```text
Browser
  |
  |  Next.js frontend
  v
Frontend services layer
  |
  |  Axios HTTP requests
  v
Express API
  |
  |-- Routes
  |-- Validation middleware
  |-- Auth and role middleware
  |-- Controllers
  |-- Services
  v
Mongoose models
  |
  v
MongoDB
```

### Backend Layers

```text
src/routes
```

Defines the public API surface and maps endpoints to middleware and controllers.

```text
src/middleware
```

Handles cross-cutting request concerns such as JWT protection, role authorization, validation, rate limiting, and error handling.

```text
src/controllers
```

Coordinates request/response behavior for auth, password, profile, OAuth, and 2FA flows.

```text
src/services
```

Contains reusable business logic such as JWT creation, refresh-token verification, and email delivery.

```text
src/models
```

Defines MongoDB persistence for users, refresh tokens, and blacklisted access tokens.

```text
src/docs
```

Contains Swagger/OpenAPI configuration for interactive API documentation.

## Security Design

### Access Tokens

Access tokens are short-lived JWTs used to authorize protected API routes.

```text
Authorization: Bearer <accessToken>
```

They carry the user id and role so protected routes can authenticate and authorize requests without a database lookup for every request.

### Refresh Tokens

Refresh tokens are long-lived JWTs, but unlike access tokens they are stored in MongoDB.

This makes sessions partially stateful and allows the server to:

- check if a refresh token still exists
- rotate refresh tokens after use
- revoke refresh tokens on logout or password change

### Refresh-Token Rotation

```text
1. User logs in.
2. Server returns accessToken and refreshToken A.
3. Access token expires.
4. Client sends refreshToken A to /refresh-token.
5. Server verifies A and checks MongoDB.
6. Server deletes A.
7. Server creates refreshToken B.
8. Client uses B for the next refresh.
```

If an old refresh token is reused after rotation, it will no longer exist in MongoDB and will be rejected.

### Logout Invalidation

JWT access tokens are normally stateless, so they remain valid until expiry. This project adds a `TokenBlacklist` collection so logout can immediately invalidate the current access token.

### Password Reset Protection

Password reset uses an OTP flow:

```text
1. User requests password reset.
2. Server emails an OTP.
3. User verifies OTP.
4. Server marks the OTP as verified.
5. User resets password only after OTP verification.
6. Server clears OTP state.
```

This prevents resetting a password with only an email address.

### Two-Factor Authentication

2FA uses TOTP codes compatible with apps such as Google Authenticator, Microsoft Authenticator, Authy, and 1Password.

```text
1. Authenticated user starts 2FA setup.
2. Server generates a base32 secret.
3. Server returns a QR code.
4. User scans it in an authenticator app.
5. User submits a 6-digit code.
6. Server verifies the code and enables 2FA.
```

Login flow after enabling 2FA:

```text
1. User submits email and password.
2. Backend verifies credentials.
3. If 2FA is enabled, backend returns require2FA: true.
4. Frontend displays an authenticator-code field.
5. User submits the 6-digit code.
6. Backend verifies TOTP and returns tokens.
```

## Frontend Architecture

The frontend is a Next.js app inside the `frontend/` directory.

Important folders:

```text
frontend/app
```

Next.js App Router pages and route groups.

```text
frontend/components
```

Reusable UI, layout, and form components.

```text
frontend/services
```

API wrappers around backend auth endpoints.

```text
frontend/store
```

Zustand auth state for user/session information.

```text
frontend/lib
```

Axios client configuration, including access-token injection and refresh-token retry behavior.

## Project Structure

```text
auth-service/
  src/
    app.js
    server.js
    config/
      db.js
      passport.setup.js
    constants/
      roles.js
    controllers/
      auth.controller.js
      twoFactor.controller.js
    docs/
      swagger.js
    middleware/
      auth.middleware.js
      error.middleware.js
      rateLimiter.js
      role.middleware.js
      validate.middleware.js
    models/
      RefreshToken.js
      TokenBlacklist.js
      User.js
    routes/
      auth.routes.js
    services/
      email.service.js
      token.service.js
    utils/
      generateOTP.js
      logger.js
      validationSchemas.js
  tests/
    auth.test.js
  frontend/
    app/
    components/
    lib/
    services/
    store/
```

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Passport Google OAuth
- Speakeasy
- QRCode
- Joi
- Nodemailer
- Swagger UI
- Jest
- Supertest

Frontend:

- Next.js
- React
- TypeScript
- Axios
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/base-ui components
- Lucide icons

## Backend Setup

Install dependencies from the project root:

```bash
npm install
```

Create `.env` in the project root:

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

For deployments on Render free services, use an HTTPS email API instead of SMTP:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="Auth Service <onboarding@resend.dev>"
```

Gmail SMTP can work locally, but Render free services block outbound SMTP ports used by Gmail.

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

Run tests:

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
process.env.NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend local URL:

```text
http://localhost:3000
```

To test from another device on the same Wi-Fi network, start the frontend in LAN mode:

```bash
npm run dev:lan
```

Then open the frontend with your computer's Wi-Fi IP address, for example:

```text
http://192.168.0.213:3000
```

The browser will call `/api` on the same frontend origin, and Next.js will proxy those requests to `process.env.NEXT_PUBLIC_API_PROXY_URL`.

Build the frontend:

```bash
npm run build
```

The frontend build script uses webpack mode:

```json
"build": "next build --webpack"
```

This avoids Turbopack file-lock issues that can happen on Windows/OneDrive.

## Deployment

### Backend on Render

Backend URL:

```text
https://auth-microservice-5ki0.onrender.com
```

API docs:

```text
https://auth-microservice-5ki0.onrender.com/api-docs/
```

Set the backend environment variables in Render:

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

For Render free services, set these instead of relying on Gmail SMTP:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="Auth Service <onboarding@resend.dev>"
```

### Frontend on Vercel

Use these Vercel settings:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: leave empty
Install Command: npm install
```

Set this Vercel environment variable:

```env
process.env.NEXT_PUBLIC_API_URL=https://auth-microservice-5ki0.onrender.com/api
```

Do not use `localhost` in Vercel.

## Environment Variable Guide

Local frontend:

```env
process.env.NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Vercel frontend:

```env
process.env.NEXT_PUBLIC_API_URL=https://auth-microservice-5ki0.onrender.com/api
```

Same key, different value. Local points to your local backend. Vercel points to the deployed backend.

## API Routes

Auth:

```text
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

Profile and password:

```text
GET  /api/auth/profile
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
```

2FA:

```text
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
```

OAuth:

```text
GET /api/auth/google
GET /api/auth/google/callback
```

Admin:

```text
GET /api/auth/admin/dashboard
```

## Testing

Backend integration tests cover:

- registration
- email verification
- login
- protected profile access
- refresh-token rotation
- logout
- blocked access after logout

Run:

```bash
npm test
```

## Known Production Notes

- Backend CORS is currently open for development/testing.
- For stricter production security, restrict CORS to the deployed Vercel frontend URL.
- Google OAuth callback URLs must be configured in Google Cloud Console for both local and production environments.
- Vercel environment variables are separate from `frontend/.env`.
- Render environment variables are separate from the root `.env`.

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
