const User         = require('../models/User');
const Complaint    = require('../models/Complaint');
const Session      = require('../models/Session');
const Skill        = require('../models/Skill');
const Poll         = require('../models/Poll');
const LostFound    = require('../models/LostFound');
const TechPost     = require('../models/TechPost');
const Review       = require('../models/Review');

exports.getSummary = async (req, res) => {
  try {
    // ── 1. Platform Overview ───────────────────────────────────────
    const [
      totalUsers, totalStudents, totalAdmins,
      totalSkills, totalSessions, totalComplaints,
      totalPolls, totalTechPosts, totalLostFound, totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Skill.countDocuments(),
      Session.countDocuments(),
      Complaint.countDocuments(),
      Poll.countDocuments(),
      TechPost.countDocuments(),
      LostFound.countDocuments(),
      Review.countDocuments(),
    ]);

    // ── 2. User Registrations — last 7 days ───────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const registrationsLast7Days = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // ── 3. Session status breakdown ────────────────────────────────
    const sessionsByStatus = await Session.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const completedSessions = sessionsByStatus.find(s => s._id === 'Completed')?.count || 0;
    const sessionCompletionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // ── 4. Skills by category ──────────────────────────────────────
    const skillsByCategory = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 5. Complaints breakdown ────────────────────────────────────
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 6 },
    ]);
    const resolutionTimeRaw = await Complaint.aggregate([
      { $match: { status: 'Resolved' } },
      { $project: { diffMs: { $subtract: ['$updatedAt', '$submittedAt'] } } },
      { $group: { _id: null, avgMs: { $avg: '$diffMs' } } },
    ]);
    const avgResolutionHours = resolutionTimeRaw.length
      ? Math.round(resolutionTimeRaw[0].avgMs / (1000 * 60 * 60)) : 0;

    // ── 6. Poll engagement ─────────────────────────────────────────
    const pollEngagement = await Poll.aggregate([
      { $project: { question: 1, totalVotes: { $sum: '$options.voteCount' } } },
      { $sort: { totalVotes: -1 } }, { $limit: 6 },
    ]);

    // ── 7. Lost & Found + Tech posts ───────────────────────────────
    const lostFoundByType = await LostFound.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const techPostsByCategory = await TechPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 8. Average review rating ───────────────────────────────────
    const ratingStats = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]);
    const avgRating = ratingStats.length ? parseFloat(ratingStats[0].avgRating.toFixed(2)) : 0;

    res.json({
      overview: {
        totalUsers, totalStudents, totalAdmins,
        totalSkills, totalSessions, totalComplaints,
        totalPolls, totalTechPosts, totalLostFound, totalReviews,
        sessionCompletionRate, avgResolutionHours, avgRating,
      },
      registrationsLast7Days,
      sessionsByStatus,
      skillsByCategory,
      complaintsByStatus,
      complaintsByCategory,
      pollEngagement,
      lostFoundByType,
      techPostsByCategory,
    });
  } catch (err) {
    console.error('Analytics Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
};
