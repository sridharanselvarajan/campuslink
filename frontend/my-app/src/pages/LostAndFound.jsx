import { CalendarIcon, LocationMarkerIcon, PencilIcon, TagIcon, TrashIcon } from '@heroicons/react/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import LostItemForm from '../components/LostItemForm';
import { AuthContext } from '../context/AuthContext';
import api, { fetchMyLostFound } from '../services/api';
import './LostAndFound.css';

const LostAndFound = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ type: 'lost', itemName: '', description: '', location: '', category: '', image: null });
  const { user } = useContext(AuthContext);

  const fetchItems = () => {
    if (user && user.role === 'admin') {
      api.get('/lostfound')
        .then(res => setItems(res.data))
        .catch(err => console.error(err));
    } else {
      fetchMyLostFound()
        .then(res => setItems(res.data))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const handleEditClick = item => {
    setEditing(item._id);
    setEditForm({
      type: item.type,
      itemName: item.itemName,
      description: item.description,
      location: item.location,
      category: item.category,
      image: null,
    });
  };

  const handleEditChange = e => {
    const { name, value, files } = e.target;
    setEditForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(editForm).forEach(([k, v]) => v && data.append(k, v));
    await api.put(`/lostfound/${editing}`, data);
    setEditing(null);
    setEditForm({ type: 'lost', itemName: '', description: '', location: '', category: '', image: null });
    fetchItems();
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await api.delete(`/lostfound/${id}`);
      fetchItems();
    }
  };

  if (!user) return (
    <div className="lost-found-container">
      <div className="no-announcements">Please login to view lost & found items.</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="lost-found-container"
    >
      <h2 className="lost-found-title">Campus Lost & Found</h2>
      
      <LostItemForm onSuccess={fetchItems} />

      <div className="complaints-list" style={{ marginTop: '4rem' }}>
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-announcements"
            >
              No items reported yet. Be the first to help out!
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div 
                key={item._id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="item-card"
              >
                {editing === item._id ? (
                  <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="radio-group" style={{ marginBottom: '1.5rem' }}>
                      <label className={`radio-option ${editForm.type === 'lost' ? 'active' : ''}`}>
                        <input type="radio" name="type" value="lost" checked={editForm.type === 'lost'} onChange={handleEditChange} /> Lost
                      </label>
                      <label className={`radio-option ${editForm.type === 'found' ? 'active' : ''}`}>
                        <input type="radio" name="type" value="found" checked={editForm.type === 'found'} onChange={handleEditChange} /> Found
                      </label>
                    </div>
                    <input className="edit-input" name="itemName" placeholder="Item Name" value={editForm.itemName} onChange={handleEditChange} required />
                    <input className="edit-input" name="location" placeholder="Location" value={editForm.location} onChange={handleEditChange} required />
                    <input className="edit-input" name="category" placeholder="Category" value={editForm.category} onChange={handleEditChange} required />
                    <textarea className="edit-input" name="description" placeholder="Description" value={editForm.description} onChange={handleEditChange} required />
                    <input className="edit-input" type="file" name="image" accept="image/*" onChange={handleEditChange} />
                    <div className="form-actions">
                      <button className="edit-btn" type="submit">Update Report</button>
                      <button type="button" className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="card-header">
                      <h3 className="item-name">{item.itemName}</h3>
                      <span className={`item-type-badge item-type-${item.type}`}>{item.type}</span>
                    </div>
                    
                    <div className="item-meta">
                      <span title="Category"><TagIcon style={{ width: '16px', display: 'inline', marginRight: '4px' }} /> {item.category}</span>
                      <span title="Location"><LocationMarkerIcon style={{ width: '16px', display: 'inline', marginRight: '4px', marginLeft: '12px' }} /> {item.location}</span>
                      <span title="Date"><CalendarIcon style={{ width: '16px', display: 'inline', marginRight: '4px', marginLeft: '12px' }} /> {new Date(item.dateReported).toLocaleDateString()}</span>
                    </div>

                    <p className="item-desc">{item.description}</p>
                    
                    {item.imagePath && (
                      <img 
                        src={`http://localhost:5000${item.imagePath}`} 
                        alt={item.itemName} 
                        className="item-image" 
                        loading="lazy"
                      />
                    )}
                    
                    {(user.role === 'admin' || user._id === item.reportedBy?._id) && (
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditClick(item)} title="Edit Report">
                          <PencilIcon style={{ width: '18px' }} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(item._id)} title="Delete Report">
                          <TrashIcon style={{ width: '18px' }} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LostAndFound;
