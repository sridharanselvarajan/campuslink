const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    // Only learner can review tutor
    if (session.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const review = new Review({
      session: sessionId,
      rating,
      comment,
      reviewer: req.user._id,
      reviewee: session.tutor
    });
    await review.save();
    session.feedbackGiven = true;
    await session.save();
    // Update tutor's average rating
    const reviews = await Review.find({ reviewee: session.tutor });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(session.tutor, { averageRating: avg });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get reviews for a user
exports.getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'username')
      .populate('session', 'skill');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.user._id })
      .populate('reviewer', 'username')
      .populate('session', 'skill');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
