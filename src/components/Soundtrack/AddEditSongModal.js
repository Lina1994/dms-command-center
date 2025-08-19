import React, { useState, useEffect } from 'react';
import './AddEditSongModal.css';

const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;
const path = window.require ? window.require('path') : null;

function AddEditSongModal({ song, onClose, onSave }) {
  const [songData, setSongData] = useState({
    name: '',
    group: '',
    filePath: '',
  });

  useEffect(() => {
    if (song) {
      setSongData({ ...song, group: song.group || '' });
    } else {
      setSongData({
        name: '',
        group: '',
        filePath: '',
      });
    }
  }, [song]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSongData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectFile = async () => {
    if (ipcRenderer) {
      const result = await ipcRenderer.invoke('select-song-file');
      if (result.success) {
        const originalPath = result.filePath;
        const copyResult = await ipcRenderer.invoke('copy-song-file', originalPath);
        if (copyResult.success) {
          const newFilePath = copyResult.newPath;
          setSongData(prevData => {
            const newName = prevData.name || (path ? path.basename(newFilePath, path.extname(newFilePath)) : '');
            return { ...prevData, filePath: newFilePath, name: newName };
          });
        } else {
          console.error('Error copying file:', copyResult.error);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(songData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{song ? 'Editar Canción' : 'Añadir Canción'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={songData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="group">Grupo:</label>
            <input
              type="text"
              id="group"
              name="group"
              value={songData.group}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Archivo MP3:</label>
            <button type="button" onClick={handleSelectFile}>
              Seleccionar Archivo
            </button>
            {songData.filePath && <p>Archivo seleccionado: {songData.filePath}</p>}
          </div>
          <div className="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditSongModal;