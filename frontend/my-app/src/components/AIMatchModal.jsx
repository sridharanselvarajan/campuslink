import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AIMatchModal.css';

const AIMatchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // For fake loading phases

  if (!isOpen) return null;

  const handleMatch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    setStep(1); // "Analyzing skills..."

    // Cycle through loading steps to look "smart"
    const stepInterval = setInterval(() => setStep(s => (s < 3 ? s + 1 : s)), 1200);

    try {
      const res = await api.post('/match/tutors', { query });
      clearInterval(stepInterval);
      setResults(res.data.matches);
    } catch (err) {
      clearInterval(stepInterval);
      setError('The AI encountered an error while matching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery('');
    setResults(null);
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  const renderLoadingSteps = () => {
    const msgs = [
      "Analyzing your request...",
      "Scanning 100+ tutor profiles...",
      "Evaluating ratings and availability...",
      "Synthesizing final matches..."
    ];
    return (
      <div className="ai-loading-container">
        <div className="ai-radar-scanner">
          <div className="radar-beam"></div>
        </div>
        <p className="ai-loading-text">{msgs[step] || msgs[3]}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="ai-modal-overlay" onClick={handleClose}>
          <motion.div 
            className="ai-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="ai-modal-header">
              <div className="ai-logo">
                <span className="shining-star">✨</span> 
                <h2>AI Matchmaker</h2>
              </div>
              <button className="ai-close-btn" onClick={handleClose} disabled={loading}>×</button>
            </div>

            {/* Body */}
            <div className="ai-modal-body">
              {!loading && !results && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ai-input-view">
                  <p className="ai-prompt-text">
                    Don't know who to choose? Tell me exactly what you want to learn, and I'll find the perfect tutor for you out of our entire database.
                  </p>
                  <textarea 
                    className="ai-search-textarea"
                    placeholder="e.g., 'I really need help understanding advanced React Hooks like useMemo and useCallback before my interview tomorrow...'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                  />
                  {error && <p className="ai-error">{error}</p>}
                  <button 
                    className="ai-match-btn" 
                    onClick={handleMatch}
                    disabled={!query.trim()}
                  >
                    Find My Perfect Tutor <span className="arrow">→</span>
                  </button>
                </motion.div>
              )}

              {loading && renderLoadingSteps()}

              {!loading && results && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ai-results-view">
                  <div className="ai-results-header">
                    <h3>Top 3 Recommended Matches</h3>
                    <button className="ai-try-again" onClick={reset}>↺ Try another search</button>
                  </div>
                  
                  {results.length === 0 ? (
                    <p className="ai-no-results">Sorry, we couldn't find any tutors matching that request right now.</p>
                  ) : (
                    <div className="ai-match-cards">
                      {results.map((match, index) => (
                        <motion.div 
                          key={match.skill._id} 
                          className="ai-match-card"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 }}
                        >
                          <div className="aim-rank">#{index + 1}</div>
                          
                          <div className="aim-main">
                            <div className="aim-title-row">
                              <h4>{match.skill.title}</h4>
                              <span className="aim-score-badge">{match.matchPercentage}% Match</span>
                            </div>
                            
                            <div className="aim-tutor-info">
                              <span className="aim-tutor-name">by {match.skill.offeredBy?.username}</span>
                              <span className="aim-tutor-rating">★ {match.skill.offeredBy?.averageRating?.toFixed(1) || 'New'}</span>
                              <span className="aim-tutor-exp">({match.skill.metrics?.completedSessions || 0} sessions taught)</span>
                            </div>

                            <div className="aim-reasoning">
                              <span className="aim-bot-icon">🤖</span>
                              <p>"{match.reason}"</p>
                            </div>
                          </div>

                          <div className="aim-actions">
                            <button 
                              className="aim-book-btn"
                              onClick={() => navigate(`/sessions/book/${match.skill._id}`)}
                            >
                              Book Now
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AIMatchModal;
