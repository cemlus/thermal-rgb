// routes/user.js
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/middleware");
const dotenv = require('dotenv');
dotenv.config();

const userRouter = Router();

// Helper: generate JWT
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    }
  );
}

// POST /signup
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // ❗ DO NOT hash here if your User model already hashes in pre("save")
    const newUser = await User.create({ email, password });

    const token = generateAccessToken(newUser);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // need password field, which is select:false in schema
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // use schema method comparePassword
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateAccessToken(user);

    return res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /me   (protected)
userRouter.get("/me", authMiddleware, (req, res) => {
  return res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = userRouter;
