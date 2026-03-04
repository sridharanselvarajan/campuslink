const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  feedbackGiven: { type: Boolean, default: false }
});

module.exports = mongoose.model('Session', SessionSchema);