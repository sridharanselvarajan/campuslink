const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, reviewController.addReview);
router.get('/user/:userId', reviewController.getReviewsForUser);
router.get('/my', authMiddleware, reviewController.getMyReviews);

module.exports = router;
