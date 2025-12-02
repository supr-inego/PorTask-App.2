import express from "express";
import Assignment from "../models/Assignment.js";
import Notification from "../models/Notification.js";
import InstructorNotification from "../models/InstructorNotification.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET all assignments
router.get("/", protect, async (req, res) => {
  try {
    const list = await Assignment.find().sort({ deadline: 1 });
    res.json(list);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single assignment
router.get("/:id", protect, async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  } catch (err) {
    console.error("Get assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create assignment (instructor only)
router.post("/", protect, requireRole("instructor"), async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      deadline,
      category,
      points,
      attachments,
    } = req.body;

    if (!title || !subject || !description || !deadline) {
      return res
        .status(400)
        .json({ message: "Title, subject, description, deadline required" });
    }

    // optional: check conflict like your frontend
    const conflict = await Assignment.findOne({ deadline, reviewed: false });
    if (conflict) {
      return res.status(400).json({
        message: "There is already an active activity with this deadline",
      });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      deadline,
      category: category || "Assignment",
      points: points ?? 100,
      attachments: attachments || [],
      createdBy: req.user._id,
    });

    // student notification
    await Notification.create({
      type: "new",
      title: `New activity posted: ${assignment.title}`,
      message: `Deadline: ${assignment.deadline}`,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH toggle reviewed (instructor)
router.patch("/:id/review", protect, requireRole("instructor"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Not found" });
    }

    const wasReviewed = assignment.reviewed;
    assignment.reviewed = !assignment.reviewed;
    await assignment.save();

    if (assignment.reviewed) {
      await Notification.create({
        type: "closed",
        title: `Activity closed: ${assignment.title}`,
        message: `Deadline was: ${assignment.deadline}`,
      });
      await InstructorNotification.create({
        type: "closed",
        title: "You closed an activity",
        message: `${assignment.title} has been marked as reviewed.`,
      });
    } else if (wasReviewed) {
      await Notification.create({
        type: "reopened",
        title: `Activity reopened: ${assignment.title}`,
        message: `Deadline: ${assignment.deadline}`,
      });
      await InstructorNotification.create({
        type: "reopened",
        title: "You reopened an activity",
        message: `${assignment.title} has been reopened for submissions.`,
      });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Toggle review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH submit assignment (student)
router.patch("/:id/submit", protect, requireRole("student"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (assignment.submittedCount < assignment.totalStudents) {
      assignment.submittedCount += 1;
      await assignment.save();

      await InstructorNotification.create({
        type: "submission",
        title: "Student submitted an activity",
        message: `A student submitted: ${assignment.title}`,
      });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
