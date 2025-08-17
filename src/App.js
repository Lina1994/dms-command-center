import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Maps from './components/Maps/Maps';
import Bestiary from './components/Bestiary/Bestiary';
import Database from './components/Database/Database';
import Shops from './components/Shops/Shops';
import Soundtrack from './components/Soundtrack/Soundtrack';
import Campaign from './components/Campaign/Campaign';
import PlayerView from './components/PlayerView/PlayerView';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import './styles/main.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
      <AudioPlayerProvider>
        <Routes>
          {/* Ruta para la vista del jugador (sin sidebar) */}
          <Route path="/player-view" element={<PlayerView />} />

          {/* Rutas para la vista del master (con sidebar) */}
          <Route
            path="/*"
            element={
              <div className="App">
                <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                <div className={`content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                  <Routes>
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/bestiary" element={<Bestiary />} />
                    <Route path="/database" element={<Database />} />
                    <Route path="/shops" element={<Shops />} />
                    <Route path="/soundtrack" element={<Soundtrack />} />
                    <Route path="/campaign" element={<Campaign />} />
                    <Route path="/" element={<h1>Bienvenido al DMS Tabletop Tool</h1>} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </AudioPlayerProvider>
    </Router>
  );
}

export default App;