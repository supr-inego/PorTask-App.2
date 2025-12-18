// backend/src/models/Assignment.js
// Assignment schema with attachments support

import mongoose from "mongoose";

// attachment sub-schema (stored inside assignment)
const AttachmentSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    url: String,
  },
  {
    _id: false, // do not generate _id for attachments
  }
);

// assignment schema definition
const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, default: "" },

    // deadline stored as ISO date string (YYYY-MM-DD)
    deadline: { type: String, required: true },

    category: { type: String, default: "Assignment" },
    points: { type: Number, default: 100 },

    // activity state
    reviewed: { type: Boolean, default: false },

    // submission tracking
    submittedCount: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 1 },

    // instructor attachments
    attachments: { type: [AttachmentSchema], default: [] },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("Assignment", AssignmentSchema);
