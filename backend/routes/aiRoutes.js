const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/ai/chat — protected, requires JWT
router.post('/chat', authMiddleware, chat);

module.exports = router;
