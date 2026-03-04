import { CalendarIcon, CheckCircleIcon, ClockIcon, ExclamationIcon, PlusIcon, TagIcon, UserIcon } from '@heroicons/react/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Complaints.css';

const statusIcons = {
  'Pending': <ExclamationIcon className="status-icon" />,
  'In-progress': <ClockIcon className="status-icon" />,
  'Resolved': <CheckCircleIcon className="status-icon" />
};

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useContext(AuthContext);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchComplaints = () => {
      const url = user.role === 'admin' ? '/complaints/all' : '/complaints/my';
      api.get(url)
        .then(res => setComplaints(res.data))
        .catch(err => console.error(err));
    };
    fetchComplaints();
  }, [user]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      const url = user.role === 'admin' ? '/complaints/all' : '/complaints/my';
      const res = await api.get(url);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return (
    <div className="complaints-container">
      <div className="no-complaints">Please login to view complaints.</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="complaints-container"
    >
      <h1 className="complaints-title">Service Desk</h1>
      
      {user.role === 'student' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="complaint-new-btn"
        >
          {isFormOpen ? 'Close Form' : (
            <>
              <PlusIcon style={{ width: '20px' }} />
              <span>Raise New Request</span>
            </>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <ComplaintForm 
              onSuccess={() => {
                const url = user.role === 'admin' ? '/complaints/all' : '/complaints/my';
                api.get(url).then(res => setComplaints(res.data));
                setIsFormOpen(false);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="complaints-list" style={{ marginTop: '4rem' }}>
        <AnimatePresence>
          {complaints.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-complaints"
            >
              {user.role === 'admin' ? 'No active tickets currently.' : 'Your history is clean. No complaints filed!'}
            </motion.div>
          ) : (
            complaints.map((c, index) => (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="complaint-item"
              >
                <div className="card-header">
                  <h3 className="item-name">{c.complaintTitle}</h3>
                  <span className={`status-badge status-${c.status.replace(/ /g, '-').toLowerCase()}`}>
                    {statusIcons[c.status]}
                    {c.status}
                  </span>
                </div>

                <div className="item-meta">
                  <span title="Category"><TagIcon style={{ width: '16px', display: 'inline', marginRight: '4px' }} /> {c.category}</span>
                  <span title="Submitted At"><CalendarIcon style={{ width: '16px', display: 'inline', marginRight: '4px', marginLeft: '12px' }} /> {new Date(c.submittedAt).toLocaleDateString()}</span>
                  {user.role === 'admin' && (
                    <span title="Submitted By"><UserIcon style={{ width: '16px', display: 'inline', marginRight: '4px', marginLeft: '12px' }} /> {c.submittedBy?.username || 'Student'}</span>
                  )}
                </div>

                <p className="item-desc">{c.description}</p>
                
                {c.imagePath && (
                  <img 
                    src={`http://localhost:5000${c.imagePath}`} 
                    alt="attachment" 
                    className="complaint-image"
                    loading="lazy"
                  />
                )}

                {user.role === 'admin' && (
                  <div className="admin-actions">
                    <button
                      onClick={() => handleStatusChange(c._id, 'In-progress')}
                      className="admin-action-btn in-progress"
                    >
                      In-progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(c._id, 'Resolved')}
                      className="admin-action-btn resolved"
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => handleStatusChange(c._id, 'Pending')}
                      className="admin-action-btn pending"
                    >
                      Pending
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Complaints;
