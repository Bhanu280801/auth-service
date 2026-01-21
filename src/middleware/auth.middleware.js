import { verifyAccessToken } from "../services/token.service.js";

import TokenBlacklist from "../models/TokenBlacklist.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];

    const blacklisted = await TokenBlacklist.findOne({token});

    if(blacklisted){
      return res.status(401).json({
        success :false,
        message :"Token has been Logged out"
      })
    }

    const decoded = verifyAccessToken(token);

    req.user = {
     id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


