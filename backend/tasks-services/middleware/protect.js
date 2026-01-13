import jwt from "jsonwebtoken";
import UserSync from "../models/UserSync.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from Cookies (Primary) or Authorization Header (Fallback)
    const token =
      req.cookies?.auth_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: No token provided",
      });
    }

    // Verify and Decrypt the Token
    // This uses your secret to decode the payload (id, role, etc.)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Search in the local UserSync collection
    // We use decoded.id because the CRM signs the token with the user's _id
    const user = await UserSync.findOne({ crmUserId: decoded.id });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User synchronization error: User not found in Task Service",
      });
    }

    // Attach user to the request object for use in controllers
    req.user = user;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    // Distinguish between expired and invalid tokens
    const message =
      error.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
    return res.status(401).json({ success: false, message });
  }
};
