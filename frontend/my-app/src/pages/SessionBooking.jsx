import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookSession, fetchSkill, fetchSuggestedSlots } from '../services/api';
import './SessionBooking.css';

const SessionBooking = () => {
  const { skillId } = useParams();
  const [skill, setSkill] = useState(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSkill = async () => {
      try {
        const response = await fetchSkill(skillId);
        setSkill(response.data);
      } catch (err) {
        setError('Failed to load skill details');
      } finally {
        setIsLoading(false);
      }
    };
    loadSkill();
  }, [skillId]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!date) {
        setSuggestedSlots([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const response = await fetchSuggestedSlots(skillId, date);
        setSuggestedSlots(response.data.slots || []);
      } catch (err) {
        console.error('Failed to fetch suggested slots:', err);
      } finally {
        setIsSuggesting(false);
      }
    };
    fetchSuggestions();
  }, [date, skillId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await bookSession({ 
        skillId, 
        date, 
        timeSlot: { startTime, endTime } 
      });
      navigate('/sessions', { 
        state: { bookingSuccess: true } 
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Booking conflict! Please select a different time.');
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="session-booking-container loading">
        <div className="loading-spinner">Loading skill details...</div>
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="session-booking-container error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="session-booking-container">
      <div className="booking-header">
        <h2>Book a Session</h2>
        <div className="skill-info">
          <span className="skill-title">{skill.title}</span>
          <span className="skill-id-label">Ref ID: {skillId}</span>
          <span className="skill-category">{skill.category}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {date && (
          <div className="suggested-slots-container">
            <label>Suggested Free Slots</label>
            {isSuggesting ? (
              <div className="suggesting-text">Finding slots...</div>
            ) : suggestedSlots.length > 0 ? (
              <div className="slots-grid">
                {suggestedSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`slot-btn ${startTime === slot.startTime && endTime === slot.endTime ? 'selected' : ''}`}
                    onClick={() => {
                      setStartTime(slot.startTime);
                      setEndTime(slot.endTime);
                    }}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-slots-text">No suggested free slots found for this date.</div>
            )}
          </div>
        )}

        <div className="time-inputs">
          <div className="form-group">
            <label htmlFor="start-time">Start Time</label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-time">End Time</label>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionBooking;