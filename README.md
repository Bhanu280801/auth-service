# 🔐 Authentication & Authorization Microservice

A production-ready Authentication & Authorization Microservice built using **Node.js, Express, and MongoDB**.

This project implements modern backend security practices such as:

- JWT Access & Refresh Tokens  
- Secure Logout using Token Blacklisting  
- Role-Based Access Control (RBAC)  
- OTP-based Forgot Password via Email  
- Rate Limiting against brute-force attacks  
- Swagger API Documentation  

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **JWT (Access + Refresh Tokens)**
- **bcrypt.js** (Password Hashing)
- **Nodemailer** (OTP Email Service)
- **express-rate-limit** (Rate Limiting)
- **Swagger (OpenAPI Docs)**

---

## ✨ Features

### ✅ Authentication
- User Registration with hashed passwords
- Login with JWT Access Token & Refresh Token

### ✅ Authorization
- Protected Routes using middleware
- Role-Based Access Control (Admin/User)

### ✅ Security Enhancements
- Logout with Token Blacklisting
- Rate Limiting for login attempts

### ✅ Password Recovery
- Forgot Password using Email OTP
- OTP Verification + Reset Password

### ✅ API Documentation
- Fully integrated Swagger UI

---

## 📂 Folder Structure

src/
│
├── config/
│ └── db.js
│
├── models/
│ ├── User.js
│ └── TokenBlacklist.js
│
├── routes/
│ └── auth.routes.js
│
├── controllers/
│ └── auth.controller.js
│
├── middleware/
│ ├── auth.middleware.js
│ ├── role.middleware.js
│ ├── rateLimiter.js
│ └── error.middleware.js
│
├── services/
│ ├── token.service.js
│ └── email.service.js
│
├── utils/
│ └── generateOTP.js
│
├── docs/
│ └── swagger.js
│
├── app.js
└── server.js

📡 API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login and get JWT tokens
POST	/api/auth/refresh-token	Generate new access token
POST	/api/auth/logout	Logout user (blacklist token)
Password Reset Routes
Method	Endpoint	Description
POST	/api/auth/forgot-password	Send OTP to email
POST	/api/auth/verify-otp	Verify OTP
POST	/api/auth/reset-password	Reset password
Protected Routes
Method	Endpoint	Access
GET	/api/auth/profile	Logged-in users
GET	/api/auth/admin/dashboard	Admin only