import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    type: String, // "file" | "image"
    url: String,  // later you can store real Cloudinary URLs
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Assignment" },
    points: { type: Number, default: 100 },
    deadline: { type: String, required: true }, // "YYYY-MM-DD" like your frontend
    submittedCount: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 1 },
    reviewed: { type: Boolean, default: false },
    attachments: [attachmentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
