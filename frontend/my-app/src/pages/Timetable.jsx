import { ClockIcon, MapIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useContext, useEffect, useState } from 'react';
import TimetableGrid from '../components/TimetableGrid';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Timetable.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const INITIAL_FORM_STATE = {
  dayOfWeek: 'Monday',
  startTime: '',
  endTime: '',
  subject: '',
  location: '',
  faculty: ''
};

const Timetable = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/timetable');
      setEntries(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch timetable entries:', err);
      setError('Failed to load timetable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      if (editingId) {
        await api.put(`/timetable/${editingId}`, form);
      } else {
        await api.post('/timetable', form);
      }
      setForm(INITIAL_FORM_STATE);
      setEditingId(null);
      await fetchEntries();
    } catch (err) {
      console.error('Failed to save timetable entry:', err);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = entry => {
    setForm(entry);
    setEditingId(entry._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      setIsLoading(true);
      await api.delete(`/timetable/${id}`);
      await fetchEntries();
    } catch (err) {
      console.error('Failed to delete timetable entry:', err);
      setError('Failed to delete entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  if (!user) {
    return (
      <div className="timetable-container">
        <div className="timetable-loading">Please login to view your timetable.</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="timetable-container"
    >
      <header className="timetable-header">
        <h1 className="timetable-title">Class Timetable</h1>
        {error && <div className="timetable-error">{error}</div>}
      </header>

      <section aria-labelledby="timetable-form-heading">
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSubmit} 
          className="timetable-form" 
          noValidate
        >
          <div className="form-group">
            <label htmlFor="dayOfWeek">Day</label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              required
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End</label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              min={form.startTime}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              placeholder="e.g. Computer Networks"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Room / Link</label>
            <input
              id="location"
              name="location"
              placeholder="e.g. Hall 402"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="faculty">Faculty</label>
            <input
              id="faculty"
              name="faculty"
              placeholder="e.g. Dr. Selvaraj"
              value={form.faculty}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="timetable-add-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Wait...' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            
            {editingId && (
              <button
                type="button"
                className="timetable-cancel-btn"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>
      </section>

      <section aria-labelledby="timetable-grid-heading" style={{ marginTop: '4rem' }}>
        <TimetableGrid entries={entries} />
      </section>

      <section aria-labelledby="timetable-list-heading" style={{ marginTop: '5rem' }}>
        <h2 id="timetable-list-heading" className="timetable-list-title">
          Scheduled Sessions
        </h2>
        
        <div className="timetable-entries-list">
          <AnimatePresence>
            {isLoading && !entries.length ? (
              <div className="timetable-loading">Syncing schedule...</div>
            ) : entries.length === 0 ? (
              <div className="timetable-empty">Your schedule is currently clear.</div>
            ) : (
              entries.map((entry, index) => (
                <motion.div 
                  key={entry._id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="timetable-entry"
                >
                  <div className="entry-details">
                    <span className="entry-day">{entry.dayOfWeek}</span>
                    <div className="entry-time-wrap">
                      <ClockIcon style={{ width: '14px', opacity: 0.5 }} />
                      <span className="entry-time">{entry.startTime} - {entry.endTime}</span>
                    </div>
                    <span className="entry-subject">{entry.subject}</span>
                    <div className="entry-meta-bottom">
                      <span className="entry-location"><MapIcon style={{ width: '14px', opacity: 0.5 }} /> {entry.location}</span>
                      {entry.faculty && <span className="entry-faculty" style={{ marginLeft: '15px' }}><UserIcon style={{ width: '14px', opacity: 0.5, display: 'inline', marginRight: '4px' }} /> {entry.faculty}</span>}
                    </div>
                  </div>
                  
                  <div className="entry-actions">
                    <button
                      className="timetable-edit-btn"
                      onClick={() => handleEdit(entry)}
                      disabled={isLoading}
                      title="Edit"
                    >
                      <PencilIcon style={{ width: '18px' }} />
                    </button>
                    <button
                      className="timetable-delete-btn"
                      onClick={() => handleDelete(entry._id)}
                      disabled={isLoading}
                      title="Delete"
                    >
                      <TrashIcon style={{ width: '18px' }} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
};

Timetable.propTypes = {
  // Add prop types if this component receives any props
};

export default Timetable;