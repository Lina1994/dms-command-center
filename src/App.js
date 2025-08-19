import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Maps from './components/Maps/Maps';
import Bestiary from './components/Bestiary/Bestiary';
import Database from './components/Database/Database';
import Shops from './components/Shops/Shops';
import Soundtrack from './components/Soundtrack/Soundtrack';
import Campaign from './components/Campaign/Campaign';
import PlayerView from './components/PlayerView/PlayerView';
// Import new components
import Journal from './components/Journal/Journal';
import Encounters from './components/Encounters/Encounters';
import Combat from './components/Combat/Combat';
import Characters from './components/Characters/Characters';

import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { SidebarProvider } from './contexts/SidebarContext'; // Add this line
import './styles/main.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <AudioPlayerProvider>
        <SidebarProvider> {/* Wrap with SidebarProvider */}
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
                    <Route path="/" element={<h1>Bienvenido al DMS Tabletop Tool</h1>} />
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/bestiary" element={<Bestiary />} />
                    <Route path="/shops" element={<Shops />} />
                    <Route path="/soundtrack" element={<Soundtrack />} />
                    <Route path="/campaign" element={<Campaign />} />

                    {/* Nested routes for the Database section */}
                    <Route path="/database" element={<Database theme={theme} toggleTheme={toggleTheme} />}>
                      <Route path="maps" element={<Maps />} />
                      <Route path="bestiary" element={<Bestiary />} />
                      <Route path="shops" element={<Shops />} />
                      <Route path="soundtrack" element={<Soundtrack />} />
                      <Route path="campaign" element={<Campaign />} />
                      {/* Add new nested routes */}
                      <Route path="journal" element={<Journal />} />
                      <Route path="encounters" element={<Encounters />} />
                      <Route path="combat" element={<Combat />} />
                      <Route path="characters" element={<Characters />} />
                      <Route index element={<h2>Select a section from the Database navigator above.</h2>} />
                    </Route>
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </SidebarProvider> {/* Close SidebarProvider */}
      </AudioPlayerProvider>
    </Router>
  );
}

export default App;
