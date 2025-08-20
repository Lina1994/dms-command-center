import React, { useState } from 'react';
import './AddMapModal.css';

function AddMapModal({ onClose, onAddMap, onAddMaps }) {
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [mapFile, setMapFile] = useState(null);
  const [mapFiles, setMapFiles] = useState([]);
  const [dimensions, setDimensions] = useState(null);
  const [keepOpen, setKeepOpen] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 1) {
      setMapFiles(Array.from(e.target.files));
      setMapFile(null);
    } else {
      const file = e.target.files[0];
      setMapFile(file);
      setMapFiles([]);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mapFiles.length > 0) {
      const mapsData = [];
      for (const file of mapFiles) {
        const reader = new FileReader();
        const promise = new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              resolve({
                name: file.name.replace(/\.[^/.]+$/, ""),
                group: mapGroup,
                imageData: event.target.result,
                originalWidth: img.width,
                originalHeight: img.height,
              });
            };
            img.onerror = reject;
            img.src = event.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mapsData.push(await promise);
      }
      onAddMaps(mapsData);
      if (!keepOpen) {
        onClose();
      } else {
        setMapFiles([]);
        setMapGroup('');
      }
    } else if (mapFile) {
      let imageData = null;
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
              required={mapFiles.length === 0}
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

          <div className="form-group">
            <label htmlFor="mapFolder">Carpeta de Mapas:</label>
            <input
              type="file"
              id="mapFolder"
              onChange={handleFileChange}
              webkitdirectory=""
              directory=""
              multiple
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
