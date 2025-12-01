// src/routes/adminRoutes.js
const express = require("express");
const Note = require("../models/Note");
const { authMiddleware, requireAdmin } = require("../middleware /authMiddleware");

const router = express.Router();

/**
 * GET /api/admin/all-notes
 * Admin only: return all notes from all users
 */
router.get("/all-notes", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const notes = await Note.find({})
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error("Admin all-notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
