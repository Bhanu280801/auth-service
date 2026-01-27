# 🔐 Enterprise-Grade Authentication Microservice

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://auth-microservice-5ki0.onrender.com/api-docs/)

> **A production-ready, secure, and scalable Identity & Access Management (IAM) system designed for modern microservice architectures.**

---

## 🚀 Project Overview

This is not just another login system. It is a **robust Identity & Access Management (IAM) service** built to handle the complex security requirements of enterprise applications. 

It implements **industry-standard security protocols** to prevent common vulnerabilities (OWASP Top 10), featuring stateful token management, role-based access control (RBAC), and multi-factor authentication.

**Why this project?**  
To demonstrate mastery of backend security, distributed sessions, and clean, modular architecture.

---

## 🏗️ System Architecture & Design Pattern

This project follows a **Layered MVC (Model-View-Controller) Architecture** to ensure separation of concerns, scalability, and maintainability.

### 🧩 Architectural Layers
1.  **Interface Layer (Routes)**: Defines the API endpoints (RESTful standards) and delegates requests.
2.  **Validation Layer (Middleware)**: Uses **Joi** schemas to validate all incoming data *before* it limits resources or reaches the controller.
3.  **Controller Layer**: Handles HTTP requests/responses, parses inputs, and calls services.
4.  **Service/Logic Layer**: Contains reusable business logic (Token generation, Email dispatching).
5.  **Data Access Layer (Models)**: Mongoose schemas defining data structure, validation, and DB interactions.

### 📐 Database Schema Design
The data model is normalized to separate identity from session management:
- **User**: Stores profile, hashed password (`bcrypt`), role (`user`/`admin`), and 2FA secrets.
- **RefreshToken**: Stores active refresh tokens with a reference to the User. *Critical for Rotation logic.*
- **TokenBlacklist**: Stores invalidated Access Tokens with TTL (Time To Live) to enforce immediate logout.

---

## ⚙️ Detailed Working & Security Workflows

### 1. 🔄 The "Stateful" Token Rotation (Anti-Theft)
Most JWT implementations are stateless, which makes revoking them impossible without expiration. This project uses a **Hybrid Approach**:
- **Access Token (15m)**: Stateless JWT. Fast verification, carries user Role.
- **Refresh Token (7d)**: **Stateful**, stored in MongoDB.
- **Rotation Logic**:
    1.  Client presents `RefreshToken A`.
    2.  Server verifies `A` (signature & database existence).
    3.  Server **deletes** `A` and issues `RefreshToken B`.
    4.  **Security Trigger**: If `RefreshToken A` is used *again* (e.g., by a hacker who stole it), the server detects it doesn't exist (it was already rotated). It then **invalidates ALL tokens** for that user, forcing a re-login.

### 2. 🔐 Two-Factor Authentication (TOTP)
Implemented using `speakeasy` (RFC 6238 Standard).
- **Setup**: Generates a `base32` secret -> converts to `otpauth://` URL -> Generates QR Code.
- **Enforcement**:
    - Normal Login checks password.
    - If `isTwoFactorEnabled` is true in DB, server returns `{ require2FA: true }` instead of tokens.
    - Client must send a second request with the TOTP code to finalize login and receive tokens.

### 3. 🛡️ Role-Based Access Control (RBAC)
Custom middleware (`role.middleware.js`) protects sensitive routes.
- **Flow**: `verifyAccessToken` middleware extracts `user.role` from JWT payload -> `authorizeRoles('admin')` checks if the role is allowed.
- **Benefit**: Zero database hits for authorization checks (stateless verification for speed).

---

## 📂 Project Structure

```bash
src/
├── config/         # Passport strategies, DB connection, Env setup
├── controllers/    # API Request Handlers (Auth, 2FA)
├── constants/      # Static enumerations (Roles)
├── docs/           # Swagger/OpenAPI specifications
├── middleware/     # Auth checks, Role checks, Rate Limiting, Validation
├── models/         # Database Schemas (User, RefreshToken, Blacklist)
├── routes/         # API Route definitions
├── services/       # Business Logic (Email, Token helpers)
├── utils/          # Helper functions (Joi Schemas, Logger)
└── server.js       # Application Entry Point
```

---

## 💎 Key Features & Technical Highlights

### 🛡️ Advanced Security
- **Device-Agnostic Logout**: Implementation of a **Token Blacklist** to securely invalidate JWTs before their expiration.
- **Security Headers**: Uses `Helmet.js` to set secure HTTP headers (XSS protection, no-sniff, etc.).
- **Rate Limiting**: Custom middleware to prevent Brute Force and DDoS attacks on auth endpoints.

### 🔌 Developer Experience
- **Swagger/OpenAPI Documentation**: Interactive API playground available at `/api-docs`.
- **Automated Testing**: Comprehensive integration tests using **Jest** and **Supertest**.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Runtime** | Node.js | v18+ ESM Architecture |
| **Framework** | Express.js | v5 (Beta) for modern routing |
| **Database** | MongoDB | Mongoose ODM for flexible schemas |
| **Auth** | JWT | Access (Stateless) + Refresh (Stateful) |
| **OAuth** | Passport.js | Google Social Login strategy |
| **2FA** | Speakeasy | TOTP generation and validation |
| **Validation** | Joi | Runtime request body validation |
| **Testing** | Jest | End-to-end integration testing |

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional)

### Option A: 🐳 Docker (Recommended)
Passively spin up the entire stack with a single command.

```bash
# Start the services
docker-compose up --build
```
The API is now running at `http://localhost:5000`.

### Option B: Local Development
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_url
   JWT_ACCESS_SECRET=super_secret_key
   JWT_REFRESH_SECRET=another_super_secret_key
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

3. **Run the Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

---

## 📚 API Documentation

Once the server is running, visit the interactive Swagger documentation:

👉 **[Live API Documentation](https://auth-microservice-5ki0.onrender.com/api-docs/)**

---

## 👨‍💻 Author

**Bhanu Prakash**  
*Full Stack Developer | Backend Specialist*


