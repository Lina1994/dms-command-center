import React, { useState, useEffect } from 'react';
import './EditMapModal.css';

function EditMapModal({ onClose, onEditMap, map }) {
  console.log('EditMapModal: Renderizando. Mapa recibido:', map);
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');

  useEffect(() => {
    console.log('EditMapModal useEffect: Sincronizando estado con el mapa. Mapa:', map);
    if (map) {
      setMapName(map.name);
      setMapGroup(map.group || '');
    }
  }, [map]);

  const handleNameChange = (e) => {
    console.log('EditMapModal: Cambiando nombre a:', e.target.value);
    setMapName(e.target.value);
  };

  const handleGroupChange = (e) => {
    console.log('EditMapModal: Cambiando grupo a:', e.target.value);
    setMapGroup(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('EditMapModal: Enviando cambios...');
    onEditMap({ ...map, name: mapName, group: mapGroup });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Mapa</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mapName">Nombre del Mapa:</label>
            <input
              type="text"
              id="mapName"
              value={mapName}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapGroup">Grupo:</label>
            <input
              type="text"
              id="mapGroup"
              value={mapGroup}
              onChange={handleGroupChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMapModal;