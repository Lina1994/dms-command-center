import React, { useState, useEffect } from 'react';
import './EditMapModal.css';

function EditMapModal({ onClose, onEditMap, map }) {
  const [mapName, setMapName] = useState('');
  const [mapGroup, setMapGroup] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState('');

  useEffect(() => {
    if (map) {
      setMapName(map.name);
      setMapGroup(map.group || '');
      setSelectedCampaign(map.campaign_id || '');
      setSelectedSong(map.song_id || '');
    }
  }, [map]);

  useEffect(() => {
    fetch('http://localhost:3001/campaigns')
      .then(response => response.json())
      .then(data => setCampaigns(data))
      .catch(error => console.error('Error fetching campaigns:', error));

    fetch('http://localhost:3001/songs')
      .then(response => response.json())
      .then(data => setSongs(data))
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  const handleNameChange = (e) => {
    setMapName(e.target.value);
  };

  const handleGroupChange = (e) => {
    setMapGroup(e.target.value);
  };

  const handleCampaignChange = (e) => {
    setSelectedCampaign(e.target.value);
  };

  const handleSongChange = (e) => {
    setSelectedSong(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditMap({ ...map, name: mapName, group: mapGroup, campaign_id: selectedCampaign, song_id: selectedSong });
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

          <div className="form-group">
            <label htmlFor="campaign">Campaña:</label>
            <select
              id="campaign"
              value={selectedCampaign}
              onChange={handleCampaignChange}
            >
              <option value="">Sin campaña</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="song">Canción:</label>
            <select
              id="song"
              value={selectedSong}
              onChange={handleSongChange}
            >
              <option value="">Sin canción</option>
              {songs.map(song => (
                <option key={song.id} value={song.id}>
                  {song.name}
                </option>
              ))}
            </select>
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