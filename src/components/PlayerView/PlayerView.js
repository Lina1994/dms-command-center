import React, { useState, useEffect } from 'react';
import './PlayerView.css';

const ipcRenderer = window.require && window.require('electron') ? window.require('electron').ipcRenderer : null;

function PlayerView() {
  const [currentMap, setCurrentMap] = useState(null);

  useEffect(() => {
    if (ipcRenderer) {
      const handleUpdateMap = (event, mapData) => {
        setCurrentMap(mapData);
        console.log('PlayerView.js: Received update-player-map', mapData);
        console.log('PlayerView.js: image_data length:', mapData.image_data ? mapData.image_data.length : 'N/A');
        ipcRenderer.send('player-window-map-changed', mapData);
      };

      ipcRenderer.on('update-player-map', handleUpdateMap);

      return () => {
        ipcRenderer.removeListener('update-player-map', handleUpdateMap);
      };
    }
  }, []);

  useEffect(() => {
    const sendDimensions = () => {
      if (ipcRenderer) {
        ipcRenderer.send('player-window-resize', { 
          width: window.innerWidth, 
          height: window.innerHeight 
        });
      }
    };

    const interval = setInterval(sendDimensions, 1000); // Send dimensions every second

    // Also send dimensions on resize
    window.addEventListener('resize', sendDimensions);

    // Initial send
    sendDimensions();

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', sendDimensions);
    };
  }, []);

  const imageSource = currentMap ? (currentMap.image_data || currentMap.imageDataUrl || currentMap.imagePath || currentMap.url) : '';

  return (
    <div className="player-view-container">
      {currentMap ? (
        <div className="map-display">
          {imageSource ? (
            <img
              src={imageSource}
              alt={currentMap.name}
              className="player-map-image"
              style={{
                transform: `translate(${currentMap.panX}px, ${currentMap.panY}px) scale(${currentMap.zoom}) rotate(${currentMap.rotation}deg)`,
              }}
            />
          ) : (
            <p>No hay imagen para mostrar.</p>
          )}
        </div>
      ) : (
        <p>Esperando que el Master seleccione un mapa...</p>
      )}
    </div>
  );
}

export default PlayerView;