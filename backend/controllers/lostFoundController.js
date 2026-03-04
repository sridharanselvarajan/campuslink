const LostFound = require('../models/LostFound');

exports.createLostFound = async (req, res) => {
  try {
    const { type, itemName, description, location, category } = req.body;
    const imagePath = req.file ? `/upload/lostitems/${req.file.filename}` : '';
    const lostFound = await LostFound.create({
      type,
      itemName,
      description,
      imagePath,
      location,
      category,
      reportedBy: req.user._id,
    });
    res.status(201).json(lostFound);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLostFound = async (req, res) => {
  try {
    const { type, category, date } = req.query;
    let filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.dateReported = { $gte: start, $lte: end };
    }
    const items = await LostFound.find(filter).populate('reportedBy', 'username').sort({ dateReported: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (req.user.role !== 'admin' && String(item.reportedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updateData = req.body;
    if (req.file) updateData.imagePath = `/upload/lostitems/${req.file.filename}`;
    const updated = await LostFound.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (req.user.role !== 'admin' && String(item.reportedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await LostFound.findByIdAndDelete(id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyLostFound = async (req, res) => {
  try {
    const items = await LostFound.find({ reportedBy: req.user._id }).sort({ dateReported: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
