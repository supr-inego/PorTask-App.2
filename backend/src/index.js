import "dotenv/config";
import express from "express";

const app = express();

// Enable JSON body parsing BEFORE routes
app.use(express.json());

// import routes ⬇
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";

// use routes ⬇
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  connectDB();
});
