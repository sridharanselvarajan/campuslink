const Timetable = require('../models/Timetable');

exports.createTimetable = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, subject, location, faculty } = req.body;
    const entry = await Timetable.create({
      studentId: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      subject,
      location,
      faculty,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const entries = await Timetable.find({ studentId: req.user._id }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Timetable.findOneAndUpdate({ _id: id, studentId: req.user._id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findOneAndDelete({ _id: id, studentId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
