// backend/src/routes/assignmentRoutes.js
// Assignment routes (list, create, submit, close/reopen)

import express from "express";
import Assignment from "../models/Assignment.js";
import Notification from "../models/Notification.js";
import InstructorNotification from "../models/InstructorNotification.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET all assignments (any logged in user)
router.get("/", protect, async (req, res) => {
  try {
    // newest first
    const list = await Assignment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE assignment (instructor)
router.post("/", protect, requireRole("instructor"), async (req, res) => {
  try {
    // create assignment document
    const created = await Assignment.create({
      title: req.body.title,
      subject: req.body.subject,
      description: req.body.description,
      deadline: req.body.deadline,
      category: req.body.category,
      points: req.body.points,
      attachments: req.body.attachments || [],
      reviewed: false,
      submittedCount: 0,
      totalStudents: req.body.totalStudents || 1, // placeholder if no student list yet
    });

    // student feed notification
    await Notification.create({
      title: "New activity posted",
      message: `${created.title} (${created.subject})`,
      date: new Date(),
    });

    // instructor feed notification
    await InstructorNotification.create({
      title: "Activity created",
      message: `You posted: ${created.title}`,
      date: new Date(),
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// SUBMIT assignment (student)
router.patch("/:id/submit", protect, requireRole("student"), async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: "Not found" });

    // prevent submission if instructor closed activity
    if (a.reviewed) {
      return res.status(400).json({ message: "Activity is closed" });
    }

    // increments total submitted count
    a.submittedCount = (a.submittedCount || 0) + 1;
    await a.save();

    // notify instructor
    await InstructorNotification.create({
      title: "New submission",
      message: `A student submitted: ${a.title}`,
      date: new Date(),
    });

    res.json(a);
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// TOGGLE reviewed (instructor close/reopen)
router.patch("/:id/review", protect, requireRole("instructor"), async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: "Not found" });

    // flip reviewed flag
    a.reviewed = !a.reviewed;
    await a.save();

    // notify students
    await Notification.create({
      title: a.reviewed ? "Activity closed" : "Activity reopened",
      message: `${a.title} (${a.subject})`,
      date: new Date(),
    });

    // notify instructor feed
    await InstructorNotification.create({
      title: a.reviewed ? "You closed an activity" : "You reopened an activity",
      message: `${a.title}`,
      date: new Date(),
    });

    res.json(a);
  } catch (err) {
    console.error("Toggle reviewed error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
