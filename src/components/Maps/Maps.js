import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AddMapModal from './AddMapModal';
import EditMapModal from './EditMapModal';
import ConfirmModal from './ConfirmModal';
import './Maps.css';

let ipcRenderer = null;
if (window.require) {
  try {
    const electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;
  } catch (e) {
    console.warn("Could not load electron modules:", e);
  }
}

const API_BASE_URL = 'http://localhost:3001';

const generateUniqueId = () => {
  return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function Maps() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [maps, setMaps] = useState([]);
  const [currentPreviewMap, setCurrentPreviewMap] = useState(null);
  const [editingMap, setEditingMap] = useState(null);
  const [mapToDelete, setMapToDelete] = useState(null);
  const [openSettingsMenu, setOpenSettingsMenu] = useState(null);
  const [openPlayerSettingsMenu, setOpenPlayerSettingsMenu] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [playerWindowDimensions, setPlayerWindowDimensions] = useState(null);

  const previewContainerRef = useRef(null);
  const previewImageRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const initialPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (ipcRenderer) {
      const handleDimensions = (event, dimensions) => {
        setPlayerWindowDimensions(dimensions);
      };
      ipcRenderer.on('player-window-dimensions', handleDimensions);

      return () => {
        ipcRenderer.removeListener('player-window-dimensions', handleDimensions);
      };
    }
  }, []);

  const getMapImageSource = useCallback((map) => {
    if (map.image_data) {
      return map.image_data; // This is already a base64 string
    }
    if (map.imageDataUrl) {
      return map.imageDataUrl;
    }
    if (map.imagePath) {
      // In a web context, we can't access file:// paths directly.
      // This would need to be handled by serving the images from the backend
      // or using blobs. For now, we'll just return the path.
      return map.imagePath;
    }
    if (map.url) {
      return map.url;
    }
    return ''; // No image source
  }, []);

  const fetchMaps = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/maps`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const loadedMaps = await response.json();
      setMaps(loadedMaps.map(map => ({
        ...map,
        group: map.group_name,
        id: map.id || generateUniqueId(),
        zoom: map.zoom !== undefined ? map.zoom : 1,
        rotation: map.rotation !== undefined ? map.rotation : 0,
        panX: map.panX !== undefined ? map.panX : 0,
        panY: map.panY !== undefined ? map.panY : 0,
        originalWidth: map.original_width,
        originalHeight: map.original_height,
      })));
    } catch (error) {
      console.error('Error fetching maps:', error);
    }
  }, []);

  useEffect(() => {
    fetchMaps();

    if (ipcRenderer) {
      const persistedMap = ipcRenderer.sendSync('get-current-preview-map');
      if (persistedMap) {
        setCurrentPreviewMap(persistedMap);
      }

      const handleUpdatePreview = (event, mapData) => {
        setCurrentPreviewMap(mapData);
      };
      ipcRenderer.on('update-master-preview', handleUpdatePreview);
      return () => {
        ipcRenderer.removeListener('update-master-preview', handleUpdatePreview);
      };
    }
  }, [fetchMaps]);

  useEffect(() => {
    if (ipcRenderer && currentPreviewMap) {
      ipcRenderer.send('set-current-preview-map', currentPreviewMap);
    }
  }, [currentPreviewMap]);

  const uniqueGroups = useMemo(() => {
    const groups = maps.map(map => map.group_name).filter(Boolean);
    return [...new Set(groups)];
  }, [maps]);

  const toggleSettingsMenu = (mapId) => {
    setOpenSettingsMenu(prev => (prev === mapId ? null : mapId));
  };

  const togglePlayerSettingsMenu = () => {
    setOpenPlayerSettingsMenu(prev => !prev);
  };

  const togglePreview = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleOpenEditModal = (map) => {
    setEditingMap(map);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditingMap(null);
    setIsEditModalOpen(false);
  };

  const handleAddMap = async (mapData) => {
    const { group, imageData, originalWidth, originalHeight, ...rest } = mapData;
    const newMap = {
      ...rest,
      id: mapData.id || generateUniqueId(),
      group_name: group,
      image_data: imageData,
      zoom: 1, rotation: 0, panX: 0, panY: 0,
      originalWidth,
      originalHeight
    };

    try {
      const response = await fetch(`${API_BASE_URL}/maps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMap),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const savedMap = await response.json();
      setMaps(prevMaps => [...prevMaps, { ...newMap, id: savedMap.id }]);
      if (!mapData.keepOpen) {
        handleCloseAddModal();
      }
    } catch (error) {
      console.error('Error adding map:', error);
    }
  };

  const handleEditMap = async (editedMap) => {
    const { group, ...rest } = editedMap;
    const mapToUpdate = {
      ...rest,
      group_name: group,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/maps/${mapToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapToUpdate),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setMaps(prevMaps => prevMaps.map(map => (map.id === mapToUpdate.id ? editedMap : map)));
      handleCloseEditModal();
    } catch (error) {
      console.error('Error editing map:', error);
    }
  };

  const handleDeleteRequest = (map) => {
    setMapToDelete(map);
    setIsConfirmModalOpen(true);
  };

  const handleCancelDelete = () => {
    setMapToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (mapToDelete) {
      try {
        const response = await fetch(`${API_BASE_URL}/maps/${mapToDelete.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setMaps(prevMaps => prevMaps.filter(map => map.id !== mapToDelete.id));
        handleCancelDelete();
      } catch (error) {
        console.error('Error deleting map:', error);
      }
    }
  };

  const handleOpenPlayerWindow = () => {
    if (ipcRenderer) {
      ipcRenderer.send('open-player-window');
    } else {
      console.log("Player window functionality is not available in web mode.");
    }
  };

  const handleDisplayMapInPlayerWindow = (map) => {
    console.log('Maps.js: Sending map to player window:', map);
    if (ipcRenderer) {
      ipcRenderer.send('display-map-player-window', map);
    }
    setCurrentPreviewMap(map);
  };

  const updateCurrentMapTransform = async (updates) => {
    if (!currentPreviewMap) return;
    const updatedMap = { ...currentPreviewMap, ...updates };
    setCurrentPreviewMap(updatedMap);
    setMaps(prevMaps => {
      const mapIndex = prevMaps.findIndex(m => m.id === updatedMap.id);
      if (mapIndex > -1) {
        const updatedMaps = [...prevMaps];
        updatedMaps[mapIndex] = updatedMap;
        return updatedMaps;
      }
      return prevMaps;
    });
    if (ipcRenderer) {
      ipcRenderer.send('display-map-player-window', updatedMap);
    }

    // Save changes to backend
    try {
      const response = await fetch(`${API_BASE_URL}/maps/${updatedMap.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMap),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Map transform updated in backend.');
    } catch (error) {
      console.error('Error updating map transform in backend:', error);
    }
  };

  const handleZoomIn = () => updateCurrentMapTransform({ zoom: currentPreviewMap.zoom + 0.1 });
  const handleZoomOut = () => updateCurrentMapTransform({ zoom: Math.max(0.1, currentPreviewMap.zoom - 0.1) });
  const handleRotateLeft = () => updateCurrentMapTransform({ rotation: (currentPreviewMap.rotation - 90) % 360 });
  const handleRotateRight = () => updateCurrentMapTransform({ rotation: (currentPreviewMap.rotation + 90) % 360 });

  const handlePan = (direction) => {
    const panStep = 20;
    let newPanX = currentPreviewMap.panX;
    let newPanY = currentPreviewMap.panY;

    switch (direction) {
      case 'up':
        newPanY -= panStep;
        break;
      case 'down':
        newPanY += panStep;
        break;
      case 'left':
        newPanX -= panStep;
        break;
      case 'right':
        newPanX += panStep;
        break;
      default:
        break;
    }
    updateCurrentMapTransform({ panX: newPanX, panY: newPanY });
  };

  const currentPanPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null); // Keep this for requestAnimationFrame
  const debounceTimeoutRef = useRef(null); // For debouncing IPC sends

  const handleMouseDown = (e) => {
    if (!currentPreviewMap) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPanPoint({ x: e.clientX, y: e.clientY });
    initialPan.current = { x: currentPreviewMap.panX, y: currentPreviewMap.panY };
    currentPanPositionRef.current = { x: currentPreviewMap.panX, y: currentPreviewMap.panY }; // Initialize currentPanPositionRef
    if (previewImageRef.current) {
      previewImageRef.current.classList.add('panning');
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isPanning || !currentPreviewMap) return;
    e.preventDefault();

    const deltaX = e.clientX - startPanPoint.x;
    const deltaY = e.clientY - startPanPoint.y;

    currentPanPositionRef.current = {
      x: initialPan.current.x + deltaX,
      y: initialPan.current.y + deltaY,
    };

    // Update the style directly for smooth visual feedback
    if (previewImageRef.current) {
      previewImageRef.current.style.transform = `translate(${currentPanPositionRef.current.x}px, ${currentPanPositionRef.current.y}px) scale(${currentPreviewMap.zoom}) rotate(${currentPreviewMap.rotation}deg)`;
    }

    // Debounce sending updates to the main process/player window
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      updateCurrentMapTransform({
        panX: currentPanPositionRef.current.x,
        panY: currentPanPositionRef.current.y
      });
      debounceTimeoutRef.current = null;
    }, 30); // Send updates every 30ms

  }, [isPanning, currentPreviewMap, startPanPoint, updateCurrentMapTransform]);

  const handleMouseUp = () => {
    setIsPanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    // Ensure the final position is sent to the state and IPC
    if (currentPreviewMap && (currentPanPositionRef.current.x !== currentPreviewMap.panX || currentPanPositionRef.current.y !== currentPreviewMap.panY)) {
      updateCurrentMapTransform({
        panX: currentPanPositionRef.current.x,
        panY: currentPanPositionRef.current.y
      });
    }
    if (previewImageRef.current) {
      previewImageRef.current.classList.remove('panning');
    }
  };

  const handleMouseLeave = () => {
    if (isPanning) {
      handleMouseUp(); // End panning if mouse leaves the area while dragging
    }
  };

  

  const filteredMaps = maps.filter(map => {
    const matchesSearchTerm = map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (map.group_name && map.group_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGroup = selectedGroup === '' || (map.group_name && map.group_name === selectedGroup);
    return matchesSearchTerm && matchesGroup;
  });

  const previewImageSource = currentPreviewMap ? getMapImageSource(currentPreviewMap) : '';

  const getPlayerWindowFrameStyle = () => {
    if (!playerWindowDimensions || !previewContainerRef.current) {
        return { display: 'none' };
    }
    const container = previewContainerRef.current.getBoundingClientRect();

    const scaleX = container.width / playerWindowDimensions.width;
    const scaleY = container.height / playerWindowDimensions.height;
    const scale = Math.min(scaleX, scaleY);

    return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${playerWindowDimensions.width}px`,
        height: `${playerWindowDimensions.height}px`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center',
    };
  }

  const getPreviewImageStyle = () => {
      if (!currentPreviewMap) return {};
      return {
        transform: `translate(${currentPreviewMap.panX}px, ${currentPreviewMap.panY}px) scale(${currentPreviewMap.zoom}) rotate(${currentPreviewMap.rotation}deg)`,
      }
  }

  return (
    <div className="maps-container">
      <div className="maps-buttons-container">
        <button onClick={handleOpenAddModal} className="add-map-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          <span>+</span>
        </button>
        <button onClick={handleOpenPlayerWindow} className="open-player-window-btn">Abrir Ventana de Jugadores</button>
      </div>

      <div className={`player-view-preview ${isPreviewExpanded ? 'expanded' : ''}`}>
        <div className="preview-header">
          <h3>Previsualización de Ventana de Jugadores</h3>
          <button onClick={togglePreview} className="preview-toggle-button">
            {isPreviewExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minimize-2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            )}
          </button>
        </div>
        {currentPreviewMap ? (
          <div 
            className="preview-content-wrapper"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="preview-image-container" ref={previewContainerRef}>
                {playerWindowDimensions && (
                    <div
                        className="player-window-frame"
                        style={getPlayerWindowFrameStyle()}
                    >
                        <div className="map-transform-wrapper">
                            {previewImageSource && (
                                <img
                                    ref={previewImageRef}
                                    src={previewImageSource}
                                    alt={currentPreviewMap.name}
                                    className="preview-map-image"
                                    style={getPreviewImageStyle()}
                                    onMouseDown={handleMouseDown}
                                    draggable="false"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="player-view-controls-container">
              <button onClick={togglePlayerSettingsMenu} className="settings-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 6.2 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              {openPlayerSettingsMenu && (
                <div className="player-view-settings-dropdown">
                  <div className="zoom-controls">
                    <button onClick={handleZoomIn}>&#x2B;</button>
                    <button onClick={handleZoomOut}>&#x2212;</button>
                  </div>
                  <div className="rotate-controls">
                    <button onClick={handleRotateLeft}>&#x21BA;</button>
                    <button onClick={handleRotateRight}>&#x21BB;</button>
                  </div>
                </div>
              )}
            </div>
            {playerWindowDimensions && (
              <div className="player-window-dimensions">
                {playerWindowDimensions.width} x {playerWindowDimensions.height}
              </div>
            )}
          </div>
        ) : (
          <p>Ningún mapa seleccionado para la ventana de jugadores.</p>
        )}
      </div>

      <div className="search-filter-container">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Buscar mapas por nombre o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="map-search-input"
          />
        </div>
        <div className="group-filter-container">
          <label htmlFor="group-select">Filtrar por Grupo:</label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="group-select"
          >
            <option value="">Todos los grupos</option>
            {uniqueGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-list">
        {filteredMaps.length === 0 ? (
          <p>No hay mapas que coincidan con tu búsqueda.</p>
        ) : (
          <ul>
            {filteredMaps.map((map) => {
              const imageSource = getMapImageSource(map);
              return (
                <li key={map.id} className="map-item" style={{ backgroundImage: imageSource ? `url('${imageSource.split('\\').join('/')}')` : 'none' }}>
                  <div className="map-info-container">
                    {imageSource && (
                      <img src={imageSource} alt={map.name} className="map-thumbnail" />
                    )}
                    <div className="map-details">
                      <h3>{map.name}</h3>
                      {map.group_name && <p>Grupo: {map.group_name}</p>}
                    </div>
                  </div>
                  <div className="map-actions">
                    <button onClick={() => handleDisplayMapInPlayerWindow(map)} className="display-map-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="feather feather-arrow-up-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                    </button>
                    <div className="settings-menu-container">
                      <button onClick={() => toggleSettingsMenu(map.id)} className="settings-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings" style={{ width: '18px', height: '18px' }}>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 6.2 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                      </button>
                      {openSettingsMenu === map.id && (
                        <div className="settings-dropdown">
                          <button onClick={() => { handleOpenEditModal(map); setOpenSettingsMenu(null); }}>Editar</button>
                          <button onClick={() => { handleDeleteRequest(map); setOpenSettingsMenu(null); }}>Eliminar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isAddModalOpen && (
        <AddMapModal onClose={handleCloseAddModal} onAddMap={handleAddMap} />
      )}

      {isEditModalOpen && (
        <EditMapModal onClose={handleCloseEditModal} onEditMap={handleEditMap} map={editingMap} />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          message={`¿Estás seguro de que quieres eliminar el mapa "${mapToDelete?.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default Maps;