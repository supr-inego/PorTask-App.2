import mongoose from "mongoose";

const instructorNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, default: "" },
    type: { type: String, default: "info" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const InstructorNotification = mongoose.model(
  "InstructorNotification",
  instructorNotificationSchema
);

export default InstructorNotification;
