const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
  skillsOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('User', userSchema);
