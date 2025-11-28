// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false // prevents sending password in responses by default
    }
  },
  { timestamps: true }
);

// 🔐 Hash password before saving if modified
userSchema.pre("save", async function () {
  // this = document being saved
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🧪 Compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
