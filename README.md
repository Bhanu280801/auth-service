# 🔐 Authentication & Authorization Microservice

A **production-ready Authentication & Authorization Microservice** built using **Node.js, Express, and MongoDB**.

This project demonstrates real-world backend security practices including:

- 🛡️ **JWT Access & Stateful Refresh Tokens** (with rotation)
- 🔐 **Two-Factor Authentication (2FA)** (TOTP-based)
- 🚫 **Secure Logout** (Token Blacklisting + Revocation)
- 👤 **Role-Based Access Control (RBAC)**
- 📧 **Time-limited OTP** (Forgot Password, Email Verification)
- 🌐 **Social Login** (Google OAuth)
- 🛡️ **Strict Input Validation** (Joi)
- 🐳 **Dockerized** (Docker Compose support)
- 🧪 **Automated Integration Tests** (Jest + Supertest)
- 📄 **Swagger API Documentation**

---

## 🚀 Tech Stack

| Technology | Purpose |
|----------|---------|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| BCrypt | Password hashing |
| Passport.js | Google OAuth Strategy |
| Speakeasy + QRCode | Two-Factor Authentication |
| Joi | Input Validation |
| Jest + Supertest | Integration Testing |
| Docker | Containerization |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## ▶️ How to Run

### Option 1: Docker (Recommended)
This requires Docker Desktop to be installed.

```bash
# Start App and MongoDB
docker-compose up --build
```
Access the app at `http://localhost:5000`.

### Option 2: Local Node.js
Requires Node.js and a running MongoDB instance.

```bash
# Install dependencies
npm install

# Start Server
npm start
```

### Option 3: Run Tests
Execute the integration test suite.

```bash
npm test
```

---

## 📡 API Endpoints & Swagger

Full API documentation is available at **`/api-docs`**.

### 🔹 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/login` | Login (returns Tokens or 2FA req) |
| GET | `/api/auth/google` | Login with Google |
| POST | `/api/auth/refresh-token` | Rotate Refresh Token |
| POST | `/api/auth/logout` | Logout (Revoke tokens) |
| POST | `/api/auth/change-password` | Change Password (Protected) |

### 🔹 Two-Factor Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/2fa/setup` | Generate QR Code |
| POST | `/api/auth/2fa/verify` | Enable 2FA |
| POST | `/api/auth/2fa/disable` | Disable 2FA |

### 🔹 Password Recovery
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password` | Send Reset OTP |
| POST | `/api/auth/verify-otp` | Verify Reset OTP |
| POST | `/api/auth/reset-password` | Set New Password |

---

## 🏆 Key Features Explained

### ✅ Stateful Refresh Tokens & Rotation
Unlike simple JWTs, refresh tokens are stored in the database.
- **Rotation**: Every time a refresh token is used, it is deleted and replaced with a new one.
- **Security Check**: This detects token theft (reuse of old tokens).
- **Revocation**: Changing password or logging out immediately invalidates sessions.

### ✅ Two-Factor Authentication (2FA)
Uses Time-based One-Time Passwords (TOTP).
1. User scans QR code in Google Authenticator.
2. Server verifies the code to enable 2FA.
3. Future logins require both password and the 6-digit code.

### ✅ Google Social Login
Integrated via Passport.js.
- Users can sign up/login with their Google account.
- Automatically marks email as verified.

### ✅ Strict Validation
All endpoints use **Joi** schemas to validate input before processing.
- Prevents injection attacks.
- Ensures data integrity (e.g., valid email formats, password strength).

---

## 👨‍💻 Author
Bhanu
