import React, { useState, useEffect } from 'react';
import './AddEditItemModal.css';

function AddEditItemModal({ item, category, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Set default fields based on category
      const defaultFields = category.name === 'Armas' 
        ? { name: '', type: '', price: '', damage: '', weight: '', properties: '', origin: '' }
        : { name: '', type: '', price: '', armorClass: '', strength: '', stealth: '', weight: '', origin: '' };
      setFormData(defaultFields);
    }
  }, [item, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{item ? 'Edit' : 'Add'} {category.name.slice(0, -1)}</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map(key => {
            if (key === 'id') return null;
            return (
              <div key={key} className="form-group">
                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                />
              </div>
            );
          })}
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditItemModal;
