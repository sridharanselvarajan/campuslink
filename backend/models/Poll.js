const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [
    {
      text: String,
      voteCount: {
        type: Number,
        default: 0
      }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Poll', PollSchema);
