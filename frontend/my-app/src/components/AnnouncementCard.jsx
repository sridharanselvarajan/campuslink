import { motion } from "framer-motion";
import './AnnouncementCard.css';

const categoryColors = {
  'Exam':     { bg: 'rgba(239, 68, 68, 0.15)',  text: '#fca5a5' },
  'Event':    { bg: 'rgba(124, 58, 237, 0.15)', text: '#c4b5fd' },
  'Holiday':  { bg: 'rgba(245, 158, 11, 0.15)',  text: '#fde68a' },
  'General':  { bg: 'rgba(255, 255, 255, 0.05)', text: '#e0e7ff' },
  'Update':   { bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7' },
  default:    { bg: 'rgba(255, 255, 255, 0.05)', text: '#f0f0ff' }
};

const AnnouncementCard = ({ announcement, onEdit, onDelete, showActions = false }) => {
  const category = announcement.category || 'General';
  const colors = categoryColors[category] || categoryColors.default;

  return (
    <motion.div
      className="announcement-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{announcement.title}</h3>
          <motion.span 
            className="category-badge"
            style={{ 
              backgroundColor: colors.bg,
              color: colors.text
            }}
            whileHover={{ scale: 1.05 }}
          >
            {category}
          </motion.span>
        </div>
        
        <p className="card-text">{announcement.content}</p>
        
        <div className="card-footer">
          <div className="card-meta">
            <span className="author">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {announcement.postedBy?.username || 'Admin'}
            </span>
            <span className="date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {showActions && (
            <div className="card-actions">
              <button 
                className="edit-button"
                onClick={() => onEdit(announcement)}
                aria-label="Edit announcement"
                title="Edit announcement"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                className="delete-button"
                onClick={() => onDelete(announcement._id)}
                aria-label="Delete announcement"
                title="Delete announcement"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCard;