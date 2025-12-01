// src/routes/notesRoutes.js
const express = require("express");
const Note = require("../models/Note");
const { authMiddleware, requireAdmin } = require("../middleware /authMiddleware.js");

const router = express.Router();

/**
 * GET /api/notes
 * Get all notes for current logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(notes);
  } catch (err) {
    console.error("GET /notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/notes
 * Create a new note
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      content: content || "",
      category: category || "Other",
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("POST /notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/notes/:id
 * Update a note (only if it belongs to current user)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const { title, content, category } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error("PUT /notes/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/notes/:id
 * Delete a note (only if it belongs to current user)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("DELETE /notes/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
