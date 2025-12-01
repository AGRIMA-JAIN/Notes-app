// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // you already have this
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",         // normal users
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
