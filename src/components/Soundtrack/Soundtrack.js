import React, { useState, useEffect, useCallback } from 'react';
import AddEditSongModal from './AddEditSongModal';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import './Soundtrack.css';

const generateUniqueId = () => {
  return `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function Soundtrack() {
  const [songs, setSongs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Add search term state
  const { playSong, currentSong } = useAudioPlayer();

  const loadSongs = useCallback(async () => {
    if (window.ipcRenderer) {
      try {
        const response = await window.ipcRenderer.invoke('load-songs');
        if (response.success) {
          const processedSongs = response.songs.map(song => ({
            ...song,
            filePath: song.filePath ? song.filePath.split(/[\\/]/).pop() : ''
          }));
          setSongs(processedSongs);
        } else {
          console.error('Error loading songs (Electron):', response.error);
        }
      } catch (error) {
        console.error('Error invoking load-songs (Electron):', error);
      }
    } else {
      console.warn('ipcRenderer not available. Running in web mode. Loading songs from backend...');
      try {
        const response = await fetch('http://localhost:3001/songs');
        if (response.ok) {
          const data = await response.json();
          const processedSongs = data.map(song => ({
            ...song,
            filePath: song.filePath ? song.filePath.split(/[\\/]/).pop() : ''
          }));
          setSongs(processedSongs);
        } else {
          console.error('Error loading songs (Web):', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching songs (Web):', error);
      }
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const handleOpenModal = (song = null) => {
    setSongToEdit(song);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSongToEdit(null);
  };

  const handleSaveSong = async (songData) => {
    // ... (existing save logic remains the same)
  };

  const handleDeleteSong = async (songId) => {
    // ... (existing delete logic remains the same)
  };

  // Filter songs based on search term
  const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.group && song.group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="soundtrack-container">
      <h2>Soundtrack</h2>
      <div className="soundtrack-controls">
        <button onClick={() => handleOpenModal()}>Añadir Canción</button>
        <input
          type="text"
          placeholder="Buscar por nombre o grupo..."
          className="soundtrack-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="song-list">
        {filteredSongs.map(song => (
          <div
            key={song.id}
            className={`song-item ${currentSong && currentSong.id === song.id ? 'playing' : ''}`}
            onClick={() => playSong(song)}
          >
            <div className="song-info">
              <span className="song-name">{song.name}</span>
              <span className="song-group">{song.group}</span>
            </div>
            <div className="song-controls">
              <button onClick={(e) => { e.stopPropagation(); handleOpenModal(song); }}>Editar</button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <AddEditSongModal
          song={songToEdit}
          onClose={handleCloseModal}
          onSave={handleSaveSong}
        />
      )}
    </div>
  );
}

export default Soundtrack;
