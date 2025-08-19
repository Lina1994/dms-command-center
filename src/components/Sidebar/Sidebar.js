import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { useSidebar } from '../../contexts/SidebarContext'; // Import useSidebar
import Logo from '../../Images/Logo.png'; // Import Logo.png
import './Sidebar.css';

function Sidebar({ isCollapsed, toggleSidebar }) {
  const { currentSong, isPlaying, togglePlayPause, setVolume } = useAudioPlayer();
  const [showVolume, setShowVolume] = useState(false);
  const { sidebarItems } = useSidebar(); // Get sidebarItems from context

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <NavLink to="/database" className="database-logo-link">
        <div className="database-logo">
          <img src={Logo} alt="Database Logo" /> {/* Replace SVG with img tag */}
        </div>
      </NavLink>
      <ul className="sidebar-nav">
        {sidebarItems.filter(item => item.isVisible).map(item => (
          <li key={item.id}>
            <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
              <div dangerouslySetInnerHTML={{ __html: item.icon }} /> {/* Render icon HTML */}
              <span className="link-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        {currentSong && (
          <div className="audio-player-controls">
            <div className="song-title-wrapper">
              <p className="song-title-text">Reproduciendo: {currentSong.name} - {currentSong.group}</p>
            </div>
            <div className="custom-audio-controls">
              <button className="play-pause-button" onClick={togglePlayPause}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </button>
              <div className={`volume-control ${showVolume ? 'show-slider' : ''}`} onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                <button className="volume-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <input type="range" min="0" max="1" step="0.01" defaultValue="1" onChange={handleVolumeChange} className="volume-slider" />
              </div>
            </div>
          </div>
        )}
        <button className="sidebar-toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevrons-right"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevrons-left"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
