import { ExclamationCircleIcon, PhotographIcon, ShieldCheckIcon, TagIcon, XIcon } from '@heroicons/react/outline';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import api from '../services/api';
import './ComplaintForm.css';

const ComplaintForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    complaintTitle: '',
    description: '',
    category: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    'Hostel Maintenance',
    'Water & Sanitation',
    'Electricity & Power',
    'Security & Safety',
    'Food & Mess',
    'Other'
  ];

  const handleChange = e => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    setError('');
  };

  const handleRemoveImage = () => {
    setPreview('');
    setForm(f => ({ ...f, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.complaintTitle || !form.description || !form.category) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
    
    try {
      await api.post('/complaints', data);
      setForm({ complaintTitle: '', description: '', category: '', image: null });
      setPreview('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="complaint-form-container"
    >
      <form onSubmit={handleSubmit} className="complaint-form">
        <h2 className="form-title">Raise a Concern</h2>
        <p className="form-subtitle">Formal ticket submission for campus issues</p>
        
        {error && (
          <div className="error-message">
            <ExclamationCircleIcon className="icon" style={{ width: '18px' }} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="complaintTitle">Ticket Title*</label>
          <div className="input-with-icon">
            <ShieldCheckIcon className="input-icon" />
            <input
              id="complaintTitle"
              name="complaintTitle"
              className="icon-padding"
              placeholder="e.g. Broken AC in Room 204"
              value={form.complaintTitle}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category*</label>
          <div className="input-with-icon">
            <TagIcon className="input-icon" />
            <select
              id="category"
              name="category"
              className="icon-padding"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description*</label>
          <textarea
            id="description"
            name="description"
            placeholder="Please provide specifics to help us resolve this faster..."
            value={form.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Evidence / Photo (Optional)</label>
          {preview ? (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={preview} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image-button"
                  onClick={handleRemoveImage}
                >
                  <XIcon style={{ width: '16px' }} />
                </button>
              </div>
            </div>
          ) : (
            <label className="file-upload-label">
              <PhotographIcon className="upload-icon" />
              <span>Attach a photo of the issue</span>
              <input 
                id="image"
                type="file" 
                name="image" 
                accept="image/*" 
                onChange={handleChange}
                ref={fileInputRef}
                className="file-input"
              />
            </label>
          )}
        </div>

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Submitting Ticket...
            </>
          ) : (
            'File Complaint'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ComplaintForm;