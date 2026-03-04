const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, sessionController.bookSession);
router.get('/suggest-slots', authMiddleware, sessionController.getSuggestedSlots);
router.get('/my', authMiddleware, sessionController.getMySessions); // Should match '/sessions/my'
router.put('/:id/status', authMiddleware, sessionController.updateSessionStatus);
module.exports = router;