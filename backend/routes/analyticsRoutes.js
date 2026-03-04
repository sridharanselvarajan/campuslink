const express = require('express');
const router  = express.Router();
const { getSummary } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const role           = require('../middleware/role');

// GET /api/analytics/summary — admin only
router.get('/summary', authMiddleware, role(['admin']), getSummary);

module.exports = router;
