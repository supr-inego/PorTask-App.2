// backend/src/models/User.js
// User schema and authentication helpers

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// user schema definition
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String, default: "" },
  role: {
    type: String,
    enum: ["student", "instructor"],
    default: "student",
  },
});

// hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare input password with stored hash
userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

export default mongoose.model("User", userSchema);
