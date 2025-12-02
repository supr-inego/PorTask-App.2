import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all notifications (global, like your frontend store)
router.get("/", protect, async (req, res) => {
  try {
    const list = await Notification.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
