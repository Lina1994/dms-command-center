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
  const { playSong, currentSong } = useAudioPlayer();

  const loadSongs = useCallback(async () => {
    if (window.ipcRenderer) {
      try {
        const response = await window.ipcRenderer.invoke('load-songs');
        if (response.success) {
          setSongs(response.songs);
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
          setSongs(data);
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
    if (window.ipcRenderer) {
      // Electron mode
      let updatedSongs;
      if (songToEdit) {
        updatedSongs = songs.map(s =>
          s.id === songToEdit.id
            ? { ...s, name: songData.name, group: songData.group, filePath: songData.filePath }
            : s
        );
      } else {
        const newSong = {
          id: generateUniqueId(),
          name: songData.name,
          group: songData.group,
          filePath: songData.filePath,
        };
        updatedSongs = [...songs, newSong];
      }
      setSongs(updatedSongs);
      try {
        const response = await window.ipcRenderer.invoke('save-songs', updatedSongs);
        if (!response.success) {
          console.error('Error saving songs (Electron):', response.error);
        }
      } catch (error) {
        console.error('Error invoking save-songs (Electron):', error);
      }
    } else {
      // Web mode
      try {
        let response;
        if (songToEdit) {
          // Update existing song
          const songToUpdate = { ...songData, id: songToEdit.id };
          response = await fetch(`http://localhost:3001/songs/${songToUpdate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(songToUpdate),
          });
        } else {
          // Add new song
          const newSong = {
            id: generateUniqueId(),
            name: songData.name,
            group: songData.group,
            filePath: songData.filePath,
          };
          response = await fetch('http://localhost:3001/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSong),
          });
        }

        if (response.ok) {
          loadSongs(); // Reload songs to reflect changes from backend
        } else {
          console.error('Error saving song (Web):', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching save song (Web):', error);
      }
    }
    handleCloseModal();
  };

  const handleDeleteSong = async (songId) => {
    if (window.ipcRenderer) {
      // Electron mode
      const updatedSongs = songs.filter(song => song.id !== songId);
      setSongs(updatedSongs);
      try {
        const response = await window.ipcRenderer.invoke('save-songs', updatedSongs);
        if (!response.success) {
          console.error('Error deleting song (Electron):', response.error);
        }
      } catch (error) {
        console.error('Error invoking save-songs (Electron) for delete:', error);
      }
    } else {
      // Web mode
      try {
        const response = await fetch(`http://localhost:3001/songs/${songId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          loadSongs(); // Reload songs to reflect changes from backend
        } else {
          console.error('Error deleting song (Web):', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching delete song (Web):', error);
      }
    }
  };

  return (
    <div className="soundtrack-container">
      <h2>Soundtrack</h2>
      <button onClick={() => handleOpenModal()}>Añadir Canción</button>
      <div className="song-list">
        {songs.map(song => (
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