import React, { createContext, useState, useRef, useContext } from 'react';

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

  const playSong = (song) => {
    setCurrentSong(song);
    if (audioRef.current) {
      // Ensure the filePath is a valid file:// URL for Electron
      audioRef.current.src = `http://localhost:3001${song.filePath}`;
      audioRef.current.play();
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSong(null);
  };

  const setVolume = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        playSong,
        pauseSong,
        stopSong,
        setVolume,
        audioRef, // Provide audioRef for direct access if needed (e.g., for time updates)
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => useContext(AudioPlayerContext);