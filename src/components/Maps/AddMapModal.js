import React, { useState } from 'react';
import './AddMapModal.css';

function AddMapModal({ onClose, onAddMap }) {
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [mapFile, setMapFile] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [keepOpen, setKeepOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMapFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageData = null;
    if (mapFile) {
      const reader = new FileReader();
      reader.readAsDataURL(mapFile);
      reader.onload = () => {
        imageData = reader.result;
        onAddMap({ 
          name: mapName, 
          group: mapGroup, 
          url: mapUrl, 
          imageData, 
          originalWidth: dimensions.width, 
          originalHeight: dimensions.height, 
          keepOpen: keepOpen 
        });
        if (!keepOpen) {
          onClose();
        } else {
          setMapName('');
          setMapGroup('');
          setMapUrl('');
          setMapFile(null);
          setDimensions(null);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
    } else {
      onAddMap({ name: mapName, group: mapGroup, url: mapUrl, keepOpen: keepOpen });
      if (!keepOpen) {
        onClose();
      } else {
        setMapName('');
        setMapGroup('');
        setMapUrl('');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir Nuevo Mapa</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mapName">Nombre del Mapa:</label>
            <input
              type="text"
              id="mapName"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapGroup">Grupo:</label>
            <input
              type="text"
              id="mapGroup"
              value={mapGroup}
              onChange={(e) => setMapGroup(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapUrl">URL del Mapa:</label>
            <input
              type="url"
              id="mapUrl"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mapFile">Archivo de Mapa:</label>
            <input
              type="file"
              id="mapFile"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="keepOpen"
              checked={keepOpen}
              onChange={(e) => setKeepOpen(e.target.checked)}
            />
            <label htmlFor="keepOpen">Mantener abierto después de añadir</label>
          </div>

          <div className="modal-actions">
            <button type="submit">Añadir Mapa</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMapModal;