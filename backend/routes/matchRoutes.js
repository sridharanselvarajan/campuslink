const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

// Validates the JWT and assigns req.user
router.post('/tutors', authMiddleware, matchController.matchTutors);

module.exports = router;
