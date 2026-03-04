const mongoose = require('mongoose');

const TechPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String, // Short description or details
  category: {
    type: String,
    enum: ['Hackathon', 'Internship', 'Tech News','Workshop','Conference','Scholarship'],
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin
    required: true
  },
  link: String, // Optional external URL
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date // Optional expiry for dated events
});

module.exports = mongoose.model('TechPost', TechPostSchema);

