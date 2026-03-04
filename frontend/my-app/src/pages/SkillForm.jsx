import { CalendarIcon, ClockIcon, IdentificationIcon, PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSkill, fetchSkill, updateSkill } from '../services/api';
import './SkillForm.css';

const SkillForm = () => {
  const [form, setForm] = useState({ 
    title: '', 
    category: '', 
    description: '', 
    availability: [] 
  });
  const [availability, setAvailability] = useState([{ day: '', startTime: '', endTime: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchSkill(id)
        .then(res => {
          setForm(res.data);
          setAvailability(res.data.availability || [{ day: '', startTime: '', endTime: '' }]);
        })
        .catch(err => {
          setError('Failed to load skill data');
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAvailChange = (idx, e) => {
    const newAvail = [...availability];
    newAvail[idx][e.target.name] = e.target.value;
    setAvailability(newAvail);
  };

  const addAvail = () => {
    setAvailability([...availability, { day: '', startTime: '', endTime: '' }]);
  };

  const removeAvail = idx => {
    if (availability.length > 1) {
      setAvailability(availability.filter((_, i) => i !== idx));
    } else {
      setError('At least one availability slot is required');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.title || !form.category) {
      setError('Title and category are required');
      return;
    }

    if (availability.some(slot => !slot.day || !slot.startTime || !slot.endTime)) {
      setError('Please fill all availability fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = { ...form, availability };
      if (id) {
        await updateSkill(id, data);
      } else {
        await createSkill(data);
      }
      navigate('/skills', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="skill-form-container loading">
        <div className="loading-spinner">{id ? 'Syncing skill data...' : 'Generating new skill profile...'}</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="skill-form-container"
    >
      <div className="form-header">
        <h2>{id ? 'Refine Your Skill' : 'Mint a New Skill'}</h2>
        <p>{id ? 'Keep your expertise up to date' : 'Show the community what you can do'}</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="skill-form">
        <div className="form-group">
          <label htmlFor="title">Skill Title</label>
          <div className="input-with-icon">
            <IdentificationIcon style={{ width: '20px', position: 'absolute', left: '1.25rem', color: '#a78bfa' }} />
            <input
              id="title"
              name="title"
              style={{ paddingLeft: '3.5rem' }}
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Masterful React Architecture"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <div className="input-with-icon">
            <TagIcon style={{ width: '20px', position: 'absolute', left: '1.25rem', color: '#a78bfa' }} />
            <input
              id="category"
              name="category"
              style={{ paddingLeft: '3.5rem' }}
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Software Development"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mission Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell your future mentees about the value you provide..."
            rows="4"
          />
        </div>

        <div className="availability-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>Time Allocation</h3>
              <p style={{ margin: 0 }}>Configure your weekly availability slots</p>
            </div>
            <button
              type="button"
              className="add-button"
              onClick={addAvail}
              style={{ width: 'auto', padding: '0.8rem 1.5rem', marginTop: 0 }}
            >
              <PlusIcon style={{ width: '18px', display: 'inline', marginRight: '6px' }} />
              Add Slot
            </button>
          </div>
          
          <AnimatePresence>
            {availability.map((slot, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="availability-slot"
              >
                <div className="slot-row">
                  <div className="form-group">
                    <label><CalendarIcon style={{ width: '14px', display: 'inline', marginRight: '4px' }} /> Day</label>
                    <select
                      name="day"
                      value={slot.day}
                      onChange={e => handleAvailChange(idx, e)}
                      required
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label><ClockIcon style={{ width: '14px', display: 'inline', marginRight: '4px' }} /> From</label>
                    <input
                      name="startTime"
                      type="time"
                      value={slot.startTime}
                      onChange={e => handleAvailChange(idx, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><ClockIcon style={{ width: '14px', display: 'inline', marginRight: '4px' }} /> Until</label>
                    <input
                      name="endTime"
                      type="time"
                      value={slot.endTime}
                      onChange={e => handleAvailChange(idx, e)}
                      required
                    />
                  </div>
                </div>

                {availability.length > 1 && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeAvail(idx)}
                  >
                    <TrashIcon style={{ width: '16px', display: 'inline', marginRight: '6px' }} />
                    Remove Slot
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (id ? 'Updating...' : 'Creating...') : (id ? 'Save Changes' : 'Initialize Skill')}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/skills')}
          >
            Go Back
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SkillForm;