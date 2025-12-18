// backend/src/models/Notification.js
// Notification schema for student notifications

import mongoose from "mongoose";

// notification schema definition
const NotificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("Notification", NotificationSchema);
