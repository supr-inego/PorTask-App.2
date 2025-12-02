import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import instructorNotificationRoutes from "./routes/instructorNotificationRoutes.js";

const app = express();

app.use(cors());            // allow your RN app to call the API
app.use(express.json());    // JSON body parser

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/instructor-notifications", instructorNotificationRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  connectDB();
});
