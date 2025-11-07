import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";

// Option A: protect everything except /auth/* (easiest if you mount globally)
const PUBLIC_PATH_REGEX = /^\/auth(\/|$)/i;

export default async function protect(req, res, next) {
  // Let CORS preflight pass
  if (req.method === "OPTIONS") return next();

  // skip public auth routes
  if (PUBLIC_PATH_REGEX.test(req.path)) return next();

  // 1) Pull token from httpOnly cookie (preferred) or Authorization
  const header = req.headers?.authorization || req.get?.("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = req.cookies?.auth_token || bearer;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // 2) Verify token
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Load the user from DB using id in token
    const userId = payload?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Select only what you need; never include password
    const user = await Auth.findById(userId)
      .select("_id username email role department")
      .lean();

    if (!user) {
      // user might have been deleted/disabled
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 4) Attach to req for downstream handlers
    req.user = {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
