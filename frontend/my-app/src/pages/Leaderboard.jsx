import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/api';
import './Leaderboard.css';

const BADGE_CONFIG = {
  'Top Tutor': { emoji: '🏆', color: '#f59e0b', label: 'Top Tutor' },
  'Skill Master': { emoji: '🎓', color: '#8b5cf6', label: 'Skill Master' },
  'Community Helper': { emoji: '🤝', color: '#10b981', label: 'Community Helper' },
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchLeaderboard();
        setLeaderboard(res.data.leaderboard);
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getRankStyle = (index) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (isLoading) return (
    <div className="leaderboard-container">
      <div className="leaderboard-loading">
        <div className="loading-pulse">Loading Rankings...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="leaderboard-container">
      <div className="leaderboard-error">{error}</div>
    </div>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="leaderboard-hero">
          <div className="hero-icon">🏆</div>
          <h1>CampusLink Leaderboard</h1>
          <p>Top contributors ranked by points earned through learning, teaching, and sharing!</p>
        </div>

        <div className="points-legend">
          <div className="legend-item"><span>🎓</span> Teach a Session: <strong>+50 pts</strong></div>
          <div className="legend-item"><span>📚</span> Learn a Session: <strong>+10 pts</strong></div>
          <div className="legend-item"><span>📰</span> Create Tech Post: <strong>+20 pts</strong></div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="no-data">No rankings yet. Start by completing a session!</div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`leaderboard-row ${getRankStyle(index)}`}
            >
              <div className="rank-badge">
                <span className="rank-icon">{getRankIcon(index)}</span>
              </div>

              <div className="user-avatar-lb">
                {user.username?.charAt(0).toUpperCase()}
              </div>

              <div className="user-info-lb">
                <span className="user-name-lb">{user.username}</span>
                <div className="user-badges-lb">
                  {user.badges && user.badges.length > 0 ? (
                    user.badges.map((badge) => {
                      const config = BADGE_CONFIG[badge] || { emoji: '⭐', color: '#6b7280', label: badge };
                      return (
                        <span
                          key={badge}
                          className="badge-chip"
                          style={{ borderColor: config.color, color: config.color }}
                          title={config.label}
                        >
                          {config.emoji} {config.label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="no-badges">No badges yet</span>
                  )}
                </div>
              </div>

              <div className="user-points">
                <span className="points-value">{user.totalPoints || 0}</span>
                <span className="points-label">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
