const express = require("express");

const Chat = require("../models/Chat");

const router = express.Router();

// Save or update chat history for a user
router.post("/save", async (req, res) => {
  try {
    const { userId, messages } = req.body;

    if (!userId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "userId and messages are required." });
    }

    // Replace full chat history for this user (upsert)
    const chat = await Chat.findOneAndUpdate(
      { userId },
      { $set: { messages } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ message: "Chat saved successfully.", chat });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save chat.", details: error.message });
  }
});

// Get chat history for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const chat = await Chat.findOne({ userId }).lean();

    if (!chat) {
      return res.json({ messages: [] });
    }

    return res.json({ messages: chat.messages });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get chat.", details: error.message });
  }
});

// Clear chat history for a user
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    await Chat.deleteOne({ userId });

    return res.json({ message: "Chat cleared successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clear chat.", details: error.message });
  }
});

module.exports = router;