const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    const { complaintTitle, description, category } = req.body;
    const imagePath = req.file ? `/upload/complaints/${req.file.filename}` : '';
    const complaint = await Complaint.create({
      complaintTitle,
      description,
      category,
      imagePath,
      submittedBy: req.user._id,
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id }).sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const complaints = await Complaint.find().populate('submittedBy', 'username').sort({ submittedAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Complaint not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (String(complaint.submittedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Complaint.findByIdAndDelete(id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
