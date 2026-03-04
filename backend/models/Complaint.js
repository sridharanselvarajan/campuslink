const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintTitle: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imagePath: { type: String },
  status: { type: String, enum: ['Pending', 'In-progress', 'Resolved'], default: 'Pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Complaint', complaintSchema);
