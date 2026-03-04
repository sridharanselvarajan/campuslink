const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      category,
      postedBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { category, date } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const announcements = await Announcement.find(filter).populate('postedBy', 'username').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Announcement not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
