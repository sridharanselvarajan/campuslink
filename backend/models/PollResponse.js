const mongoose = require('mongoose');

const PollResponseSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Student
    required: true
  },
  optionIndex: {
    type: Number,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one vote per user per poll
PollResponseSchema.index({ pollId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PollResponse', PollResponseSchema);
