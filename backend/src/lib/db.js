// backend/src/lib/db.js
// MongoDB connection helper

import mongoose from "mongoose";

// connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // log connected host
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to database", error);

    // exit process if connection fails
    process.exit(1);
  }
};
