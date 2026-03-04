const Session = require('../models/Session');
const Skill = require('../models/Skill');
const Timetable = require('../models/TimeTable');

const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getUTCDay()]; 
};

// Helper: check for schedule conflicts
const checkConflict = async (userId, date, startTime, endTime) => {
  const dayOfWeek = getDayOfWeek(date);

  // 1. Check Timetable conflicts
  const timetableEntries = await Timetable.find({ studentId: userId, dayOfWeek });
  for (const entry of timetableEntries) {
    if (startTime < entry.endTime && endTime > entry.startTime) {
      return { conflict: true, reason: `Timetable clash with ${entry.subject}` };
    }
  }

  // 2. Check Session conflicts
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const activeSessions = await Session.find({
    $or: [{ tutor: userId }, { learner: userId }],
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Pending', 'Confirmed'] }
  });

  for (const session of activeSessions) {
    const sStart = session.timeSlot.startTime;
    const sEnd = session.timeSlot.endTime;
    if (startTime < sEnd && endTime > sStart) {
      return { conflict: true, reason: 'Session clash with another booking' };
    }
  }

  return { conflict: false };
};

// Book a session
exports.bookSession = async (req, res) => {
  try {
    const { skillId, date, timeSlot } = req.body;
    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    
    // Check Learner Conflict
    const learnerConflict = await checkConflict(req.user._id, date, timeSlot.startTime, timeSlot.endTime);
    if (learnerConflict.conflict) {
      return res.status(409).json({ message: `Learner conflict: ${learnerConflict.reason}` });
    }

    // Check Tutor Conflict
    const tutorConflict = await checkConflict(skill.offeredBy, date, timeSlot.startTime, timeSlot.endTime);
    if (tutorConflict.conflict) {
      return res.status(409).json({ message: `Tutor conflict: ${tutorConflict.reason}` });
    }

    const session = new Session({
      skill: skillId,
      tutor: skill.offeredBy,
      learner: req.user._id,
      date,
      timeSlot
    });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Auto-suggest free slots
exports.getSuggestedSlots = async (req, res) => {
  try {
    const { skillId, date } = req.query;
    if (!skillId || !date) return res.status(400).json({ message: 'skillId and date are required' });

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const dayOfWeek = getDayOfWeek(date);
    const availabilities = skill.availability.filter(a => a.day === dayOfWeek);

    if (availabilities.length === 0) {
      return res.json({ slots: [] });
    }

    const suggestedSlots = [];
    
    for (const avail of availabilities) {
      let currentStart = avail.startTime;
      while (currentStart < avail.endTime) {
        // Assume 1 hour slots
        const [hours, minutes] = currentStart.split(':').map(Number);
        const endHours = hours + 1;
        const endTimeStr = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        if (endTimeStr > avail.endTime) break;

        const conflict = await checkConflict(skill.offeredBy, date, currentStart, endTimeStr);
        if (!conflict.conflict) {
          suggestedSlots.push({ startTime: currentStart, endTime: endTimeStr });
        }
        
        currentStart = endTimeStr;
      }
    }

    res.json({ slots: suggestedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sessions for current user (as tutor or learner)
exports.getMySessions = async (req, res) => {
    try {
      const sessions = await Session.find({
        $or: [
          { tutor: req.user._id },
          { learner: req.user._id }
        ]
      })
      .populate('skill')
      .populate('tutor', 'username _id')  // Include _id
      .populate('learner', 'username _id'); // Include _id
      
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Update session status (tutor or learner)
exports.updateSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    // Only tutor or learner can update
    if (
      session.tutor.toString() !== req.user._id.toString() &&
      session.learner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const wasCompleted = session.status === 'Completed';
    session.status = req.body.status;
    await session.save();

    // Award points and check badges only when newly marked Completed
    if (!wasCompleted && req.body.status === 'Completed') {
      const User = require('../models/User');

      // Award +50 to tutor, +10 to learner
      await User.findByIdAndUpdate(session.tutor, { $inc: { totalPoints: 50 } });
      await User.findByIdAndUpdate(session.learner, { $inc: { totalPoints: 10 } });

      // Check tutor badge thresholds
      const completedAsTutor = await Session.countDocuments({
        tutor: session.tutor,
        status: 'Completed'
      });

      const tutorBadges = [];
      if (completedAsTutor >= 10) tutorBadges.push('Skill Master');
      if (completedAsTutor >= 5) tutorBadges.push('Top Tutor');

      if (tutorBadges.length > 0) {
        await User.findByIdAndUpdate(session.tutor, {
          $addToSet: { badges: { $each: tutorBadges } }
        });
      }
    }

    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
