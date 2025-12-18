// backend/src/routes/notificationRoutes.js
// Routes for student notifications

import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// get all notifications (protected)
router.get("/", protect, async (req, res) => {
  try {
    // fetch notifications sorted by newest first
    const list = await Notification.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
