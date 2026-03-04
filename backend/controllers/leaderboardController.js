const User = require('../models/User');
const Session = require('../models/Session');

// Helper: Determine badges for a user based on their stats
const computeBadges = (completedTutoredSessions, techPostsCount) => {
  const badges = [];
  if (completedTutoredSessions >= 5) badges.push('Top Tutor');
  if (completedTutoredSessions >= 10) badges.push('Skill Master');
  if (techPostsCount >= 3) badges.push('Community Helper');
  return badges;
};

// Get top 10 leaderboard users
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('username totalPoints badges averageRating createdAt')
      .sort({ totalPoints: -1 })
      .limit(20);

    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
