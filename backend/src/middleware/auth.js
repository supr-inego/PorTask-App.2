// backend/src/middleware/auth.js
// Authentication and role-based access control middleware

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// verify JWT and attach user to request
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    // check for Bearer token
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = auth.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user without password
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Not authorized" });
  }
};

// restrict route access by user role
export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden: wrong role" });
  }
  next();
};
