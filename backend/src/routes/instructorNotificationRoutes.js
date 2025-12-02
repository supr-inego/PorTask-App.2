import express from "express";
import InstructorNotification from "../models/InstructorNotification.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, requireRole("instructor"), async (req, res) => {
  try {
    const list = await InstructorNotification.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get instructor notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
