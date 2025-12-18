// backend/src/routes/authRoutes.js
// Authentication routes (register & login)

import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// generate JWT token for user
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });

// user registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // basic validation
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    if (username.length < 6)
      return res
        .status(400)
        .json({ message: "Username must be at least 6 characters" });

    // check if email or username already exists
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already taken" });

    if (await User.findOne({ username }))
      return res.status(400).json({ message: "User already taken" });

    // default profile image
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // assign role based on email domain
    const role = email.endsWith("@university.edu") ? "instructor" : "student";

    // create user
    const user = await User.create({
      username,
      email,
      password,
      profileImage,
      role,
    });

    // send token and user data
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate input
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // generate token
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

export default router;
