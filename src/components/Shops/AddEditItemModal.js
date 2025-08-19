import React, { useState, useEffect } from 'react';
import './AddEditItemModal.css';

function AddEditItemModal({ item, category, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      let defaultFields = {};
      if (category.type === 'weapons') {
        defaultFields = {
          Nombre: '',
          Tipo: '',
          Precio: '',
          Daño: '',
          Peso: '',
          Propiedades: '',
          Origen: ''
        };
      } else if (category.type === 'armors') {
        defaultFields = {
          Nombre: '',
          Tipo: '',
          Precio: '',
          "Tipo de armadura": '',
          "Clase de Armadura (CA)": '',
          Fuerza: '',
          Sigilo: '',
          Origen: ''
        };
      }
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
        <h2>{item ? 'Editar' : 'Añadir'} {category.name.slice(0, -1)}</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map(key => {
            if (key === 'id' || key === 'category_id') return null;
            return (
              <div key={key} className="form-group">
                <label htmlFor={key}>{key}:</label>
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
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditItemModal;