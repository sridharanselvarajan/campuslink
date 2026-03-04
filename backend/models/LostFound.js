const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  imagePath: { type: String },
  location: { type: String, required: true },
  dateReported: { type: Date, default: Date.now },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('LostFound', lostFoundSchema);
