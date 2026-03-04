const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  location: { type: String, required: true },
  faculty: { type: String },
});

module.exports = mongoose.model('Timetable', timetableSchema);
