const mongoose = require('mongoose');

const SavedPostSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechPost',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavedPost', SavedPostSchema);

