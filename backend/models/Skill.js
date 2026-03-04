const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Coding, Music, Design
  description: { type: String },
  offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availability: [{
    day: String, // e.g., Monday
    startTime: String,
    endTime: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', SkillSchema);