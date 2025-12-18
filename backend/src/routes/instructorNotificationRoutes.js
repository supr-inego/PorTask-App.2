// backend/src/routes/instructorNotificationRoutes.js
// Routes for instructor notifications

import express from "express";
import InstructorNotification from "../models/InstructorNotification.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// get all instructor notifications (instructor only)
router.get("/", protect, requireRole("instructor"), async (req, res) => {
  try {
    // fetch notifications sorted by newest first
    const list = await InstructorNotification.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get instructor notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
