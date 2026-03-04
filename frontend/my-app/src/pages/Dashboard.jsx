import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { getPolls } from '../services/pollApi';
import { getSavedTechPosts, getTechPosts } from '../services/techFeedApi';
import './Dashboard.css';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

const welcomeText = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const roleBadge = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      delay: 0.2,
      type: 'spring',
      stiffness: 200
    }
  }
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    announcements: 0, 
    complaints: 0, 
    lostfound: 0,
    techPosts: 0,
    savedPosts: 0,
    activePolls: 0,
    totalPolls: 0
  });
  const [studentProgress, setStudentProgress] = useState({
    sessionsAttended: 0,
    sessionsTutored: 0,
    skillsOffered: 0,
    reviewsReceived: 0,
    points: 0,
    leaderboardRank: null
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data for user:', user.role);
        
        const [
          annRes,
          compRes, 
          lostRes,
          techRes
        ] = await Promise.all([
          api.get('/announcements'),
          user.role === 'admin' ? api.get('/complaints/all') : api.get('/complaints/my'),
          user.role === 'admin' ? api.get('/lostfound') : api.get('/lostfound/my'),
          getTechPosts()
        ]);

        // Handle polls separately with error handling
        let pollsData = [];
        try {
          const pollsRes = await getPolls();
          pollsData = pollsRes.data || [];
          console.log('Polls data:', pollsData);
        } catch (pollsError) {
          console.log('Polls API error:', pollsError.message);
          pollsData = [];
        }

        console.log('API Responses:', {
          announcements: annRes.data.length,
          complaints: compRes.data.length,
          lostfound: lostRes.data.length,
          techPosts: techRes.data.length,
          polls: pollsData.length
        });

        let savedPostsCount = 0;
        if (user.role === 'student') {
          try {
            const savedRes = await getSavedTechPosts();
            savedPostsCount = savedRes.data.length;
            console.log('Saved posts count:', savedPostsCount);
          } catch (err) {
            console.log('No saved posts or error:', err.message);
            savedPostsCount = 0;
          }
        }

        const activePolls = Array.isArray(pollsData) ? pollsData.filter(poll => poll.isActive).length : 0;
        console.log('Active polls count:', activePolls);

        const newStats = {
          announcements: annRes.data.length,
          complaints: compRes.data.length,
          lostfound: lostRes.data.length,
          techPosts: techRes.data.length,
          savedPosts: savedPostsCount,
          activePolls: activePolls,
          totalPolls: pollsData.length
        };

        console.log('Setting stats:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values on error
        setStats({
          announcements: 0,
          complaints: 0,
          lostfound: 0,
          techPosts: 0,
          savedPosts: 0,
          activePolls: 0,
          totalPolls: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    const fetchStudentProgress = async () => {
      try {
        const [sessionsRes, skillsRes, reviewsRes, leaderboardRes] = await Promise.all([
          api.get('/sessions/my'),
          api.get('/skills/my'),
          api.get('/reviews/my'),
          api.get('/leaderboard')
        ]);
        const sessions = sessionsRes.data || [];
        const attended = sessions.filter(s => s.learner?._id === user._id || s.learner === user._id).length;
        const tutored = sessions.filter(s => s.tutor?._id === user._id || s.tutor === user._id).length;

        // Find leaderboard rank
        const lb = leaderboardRes.data?.leaderboard || [];
        const rankIdx = lb.findIndex(u => u._id === user._id);
        const rank = rankIdx >= 0 ? rankIdx + 1 : null;

        setStudentProgress({
          sessionsAttended: attended,
          sessionsTutored: tutored,
          skillsOffered: skillsRes.data?.length || 0,
          reviewsReceived: reviewsRes.data?.length || 0,
          points: user.totalPoints || 0,
          leaderboardRank: rank
        });
      } catch (err) {
        console.log('Failed to fetch student progress:', err.message);
      }
    };
    fetchStudentProgress();
  }, [user]);

  if (!user) return (
    <div className="dashboard-container welcome-message">Please login to view your dashboard.</div>
  );

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="dashboard-container">

      {/* ── Hero Banner ────────────────────── */}
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-content">
          <div className="hero-left">
            <h1>
              <span className="wave">👋</span> Welcome back, {user.username}!
            </h1>
            <p className="hero-subtitle">Here's what's happening on CampusLink today.</p>
          </div>
          <div className="hero-right">
            <span className="hero-badge">🎓 {user.role}</span>
            <span className="hero-date">{today}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Platform Stats ────────────── */}
      <div className="section-label">Platform Overview</div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="stats-grid"
      >
        <motion.div variants={item} className="stat-card">
          <div className="stat-icon stat-icon-blue">📢</div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '…' : stats.announcements || 0}</h3>
            <p className="stat-label">Announcements</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-icon stat-icon-green">📝</div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '…' : stats.complaints || 0}</h3>
            <p className="stat-label">Complaints</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-icon stat-icon-purple">📰</div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '…' : stats.techPosts || 0}</h3>
            <p className="stat-label">Tech Posts</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-icon stat-icon-orange">📊</div>
          <div className="stat-content">
            <h3 className="stat-number">{loading ? '…' : stats.activePolls || 0}</h3>
            <p className="stat-label">Active Polls</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Student Progress ───────────────── */}
      {user.role === 'student' && (
        <motion.div
          className="progress-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="section-label">My Learning Journey</div>
          <div className="progress-section-title">📈 Progress Tracker</div>
          <div className="progress-grid">
            {[
              { color: 'blue',   icon: '📚', value: studentProgress.sessionsAttended, label: 'Sessions Attended' },
              { color: 'purple', icon: '🎓', value: studentProgress.sessionsTutored,  label: 'Sessions Tutored' },
              { color: 'green',  icon: '🛠️', value: studentProgress.skillsOffered,    label: 'Skills Offered' },
              { color: 'yellow', icon: '⭐', value: studentProgress.reviewsReceived,   label: 'Reviews Received' },
              { color: 'orange', icon: '🏅', value: studentProgress.points,            label: 'Contribution Pts' },
              { color: 'red',    icon: '🏆', value: studentProgress.leaderboardRank ? `#${studentProgress.leaderboardRank}` : '–', label: 'Leaderboard Rank' },
            ].map(card => (
              <motion.div
                key={card.label}
                className={`progress-card progress-card-${card.color}`}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <div className="progress-icon">{card.icon}</div>
                <div className="progress-value">{card.value}</div>
                <div className="progress-label">{card.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Quick Navigation Links ──────────── */}
      <div className="links-section">
        <div className="section-label">Quick Navigate</div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="dashboard-links"
        >
          {[
            { to: '/announcements', icon: '📢', label: 'Announcements' },
            { to: '/lostandfound',  icon: '🔍', label: 'Lost & Found' },
            { to: '/techfeed',      icon: '📰', label: 'Tech Feed' },
            { to: '/polls',         icon: '📊', label: 'Polls & Feedback' },
            { to: '/complaints',    icon: '📝', label: 'Complaints' },
            { to: '/ai-assistant',  icon: '🤖', label: 'AI Assistant' },
            ...(user.role === 'student' ? [
              { to: '/timetable',  icon: '📅', label: 'Timetable' },
              { to: '/skills',     icon: '🛠️', label: 'Skill Marketplace' },
              { to: '/sessions',   icon: '⏱️', label: 'My Sessions' },
              { to: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
            ] : []),
            ...(user.role === 'admin' ? [
              { to: '/techfeed/admin', icon: '⚙️', label: 'Manage Tech Feed', admin: true },
              { to: '/polls/admin',    icon: '🗳️', label: 'Manage Polls',    admin: true },
              { to: '/analytics',      icon: '✨', label: 'Analytics',        admin: true },
            ] : []),
          ].map(link => (
            <motion.div key={link.to} variants={item}>
              <Link
                to={link.to}
                className={`dashboard-link ${link.admin ? 'dashboard-link-admin' : ''}`}
              >
                <span className="dash-link-icon">{link.icon}</span>
                <span className="dash-link-label">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Recent Activity ─────────────────── */}
      <motion.div
        className="recent-activity"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="recent-activity-title">⚡ Platform Snapshot</div>
        <div className="recent-activity-list">
          {[
            { icon: '📢', colorClass: 'blue',   text: loading ? 'Loading…' : `${stats.announcements} announcements available` },
            { icon: '📝', colorClass: 'green',  text: loading ? 'Loading…' : `${stats.complaints} complaints ${user.role === 'admin' ? 'to review' : 'submitted'}` },
            { icon: '📰', colorClass: 'purple', text: loading ? 'Loading…' : `${stats.techPosts} tech posts${user.role === 'student' && stats.savedPosts > 0 ? ` (${stats.savedPosts} saved)` : ''}` },
            { icon: '📊', colorClass: 'orange', text: loading ? 'Loading…' : `${stats.activePolls} active poll${stats.activePolls !== 1 ? 's' : ''} open` },
          ].map(a => (
            <div key={a.colorClass} className="recent-activity-item">
              <div className={`recent-activity-icon recent-activity-icon-${a.colorClass}`}>{a.icon}</div>
              <div>
                <p className="recent-activity-text">{a.text}</p>
                <p className="recent-activity-time">Updated just now</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;