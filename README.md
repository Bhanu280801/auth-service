# 🔐 Authentication & Authorization Microservice

A **production-ready Authentication & Authorization Microservice** built using **Node.js, Express, and MongoDB**.

This project demonstrates real-world backend security practices including:

- JWT Access & Refresh Token Authentication  
- Secure Logout using Token Blacklisting  
- Role-Based Access Control (RBAC)  
- OTP-based Forgot Password via Email  
- Rate Limiting to prevent brute-force attacks  
- Swagger API Documentation  
- Deployed Live on Render  

---

## 🌍 Live Deployment

- **Live API Base URL:**  
  https://auth-microservice-5ki0.onrender.com

- **Swagger Documentation:**  
  https://auth-microservice-5ki0.onrender.com/api-docs

---

## 🚀 Tech Stack

| Technology | Purpose |
|----------|---------|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB ODM |
| JWT | Authentication (Access + Refresh tokens) |
| bcrypt.js | Secure password hashing |
| Nodemailer | OTP email service |
| express-rate-limit | Brute-force attack prevention |
| Swagger UI + swagger-jsdoc | API Documentation |
| Render | Deployment platform |

---

## ✨ Key Features

---

### ✅ User Authentication

- User registration with hashed passwords
- Secure login with JWT tokens
- Refresh token support for session continuity

---

### ✅ JWT Access & Refresh Token System

- Short-lived Access Tokens for API security
- Long-lived Refresh Tokens for re-authentication
- Token payload contains user role & id

---

### ✅ Secure Logout using Token Blacklisting

JWT is stateless, so logout is implemented using:

- Token Blacklist database collection
- Middleware check for blacklisted tokens
- TTL index auto-removes expired tokens

---

### ✅ Role-Based Access Control (RBAC)

Authorization layer built with middleware:

- `user` role → normal access
- `admin` role → restricted admin routes

Example:

- `/profile` → user allowed  
- `/admin/dashboard` → admin only  

---

### ✅ Forgot Password using OTP Email

Complete password reset flow:

1. User requests OTP
2. OTP is emailed
3. OTP verification
4. Password reset securely with bcrypt

OTP expires automatically after 10 minutes.

---

### ✅ Rate Limiting Security

Sensitive endpoints are protected:

- Login limited to 5 attempts per 15 minutes
- Prevents brute-force password attacks

---

### ✅ Swagger API Documentation

All APIs are documented and testable through Swagger UI:

👉 `/api-docs`

Recruiters can test endpoints directly in browser.

---

## 📂 Folder Structure

```bash
src/
│
├── config/
│   └── db.js                 # MongoDB connection
│
├── models/
│   ├── User.js               # User schema + bcrypt hashing
│   └── TokenBlacklist.js     # Stores logged-out JWT tokens
│
├── controllers/
│   └── auth.controller.js    # All auth logic (register/login/otp/etc.)
│
├── routes/
│   └── auth.routes.js        # API endpoints
│
├── middleware/
│   ├── auth.middleware.js    # Protect routes with JWT
│   ├── role.middleware.js    # RBAC authorization
│   ├── rateLimiter.js        # Prevent brute-force attacks
│   └── error.middleware.js   # Centralized error handling
│
├── services/
│   ├── token.service.js      # Token generation + verification
│   └── email.service.js      # Nodemailer OTP sending
│
├── utils/
│   └── generateOTP.js        # OTP generator helper
│
├── docs/
│   └── swagger.js            # Swagger configuration
│
├── app.js                    # Express app setup
└── server.js                 # Server entry point

⚙️ Environment Variables Setup

Create a .env file in the root directory:

PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password

▶️ Run Locally
1️⃣ Clone Repository

git clone https://github.com/your-username/auth-microservice.git
cd auth-microservice

2️⃣ Install Dependencies
npm install

3️⃣ Start Server
node src/server.js


Server runs on:

http://localhost:5000

4️⃣ Open Swagger Docs
http://localhost:5000/api-docs

📡 API Endpoints
🔹 Authentication Routes
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login & receive JWT tokens
POST	/api/auth/refresh-token	Generate new access token
POST	/api/auth/logout	Logout user (blacklist token)
🔹 Password Reset Routes
Method	Endpoint	Description
POST	/api/auth/forgot-password	Send OTP to email
POST	/api/auth/verify-otp	Verify OTP
POST	/api/auth/reset-password	Reset password securely
🔹 Protected Routes
Method	Endpoint	Access
GET	/api/auth/profile	Logged-in users only
GET	/api/auth/admin/dashboard	Admin-only
🔐 Authentication Flow (JWT)
Login Response Example
{
  "success": true,
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}

Access Protected Route

Include token in headers:

Authorization: Bearer <accessToken>

🧪 Testing

APIs can be tested using:

Swagger UI

Postman

Thunder Client

🏆 Resume Highlights

This project demonstrates:

Production-ready authentication microservice architecture

Secure JWT access + refresh token implementation

Token blacklisting logout mechanism

Role-Based Access Control (RBAC)

OTP-based password reset system

Rate limiting for security hardening

Swagger documentation and live deployment