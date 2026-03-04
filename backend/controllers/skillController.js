const Skill = require('../models/Skill');
const User = require('../models/User');

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const skill = new Skill({ ...req.body, offeredBy: req.user._id });
    await skill.save();
    // Add skill to user's skillsOffered
    await User.findByIdAndUpdate(req.user._id, { $push: { skillsOffered: skill._id } });
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all skills
exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().populate('offeredBy', 'username averageRating');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single skill by ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('offeredBy', 'username averageRating');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a skill (only by owner)
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.offeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(skill, req.body);
    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a skill (only by owner)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.offeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await skill.remove();
    // Remove from user's skillsOffered
    await User.findByIdAndUpdate(req.user._id, { $pull: { skillsOffered: skill._id } });
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get skills offered by the current user
exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ offeredBy: req.user._id });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
