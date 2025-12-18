// backend/src/models/InstructorNotification.js
// Notification schema for instructor notifications

import mongoose from "mongoose";

// instructor notification schema
const InstructorNotificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model(
  "InstructorNotification",
  InstructorNotificationSchema
);
