const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const role = require('../middleware/role');
const {
  createPoll,
  getPolls,
  getPoll,
  vote,
  updatePoll,
  deletePoll,
  getPollResults
} = require('../controllers/pollController');

// Public routes (require authentication)
router.get('/', authMiddleware, getPolls);
router.get('/:id', authMiddleware, getPoll);
router.get('/:id/results', authMiddleware, getPollResults);
router.post('/:id/vote', authMiddleware, vote);

// Admin routes
router.post('/', authMiddleware, role(['admin']), createPoll);
router.put('/:id', authMiddleware, role(['admin']), updatePoll);
router.delete('/:id', authMiddleware, role(['admin']), deletePoll);

module.exports = router;
