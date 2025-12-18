// backend/src/index.js
// Main server entry point

import "dotenv/config";
import express from "express";
import cors from "cors";

// database connection
import { connectDB } from "./lib/db.js";

// route handlers
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import instructorNotificationRoutes from "./routes/instructorNotificationRoutes.js";

const app = express();

// enable CORS for cross-origin requests
app.use(cors());

// parse incoming JSON requests
app.use(express.json());

// authentication routes (login, register)
app.use("/api/auth", authRoutes);

// assignment-related routes
app.use("/api/assignments", assignmentRoutes);

// student notifications routes
app.use("/api/notifications", notificationRoutes);

// instructor notifications routes
app.use("/api/instructor-notifications", instructorNotificationRoutes);

// server port
const PORT = process.env.PORT || 3001;

// start server and connect to database
app.listen(PORT, async () => {
  console.log(`Server running on PORT ${PORT}`);
  await connectDB();
});
