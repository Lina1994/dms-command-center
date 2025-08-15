import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Maps from './components/Maps/Maps';
import Bestiary from './components/Bestiary/Bestiary'; // Importar el componente Bestiary
import Database from './components/Database/Database'; // Importar el componente Database
import Shops from './components/Shops/Shops'; // Importar el componente Shops
import Soundtrack from './components/Soundtrack/Soundtrack'; // Importar el componente Soundtrack
import Campaign from './components/Campaign/Campaign'; // Importar el componente Campaign
import PlayerView from './components/PlayerView/PlayerView';
import './styles/main.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
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
                  <Route path="/bestiary" element={<Bestiary />} />{/* Nueva ruta para Bestiary */}
                  <Route path="/database" element={<Database />} /> {/* Nueva ruta para Database */}
                  <Route path="/shops" element={<Shops />} /> {/* Nueva ruta para Shops */}
                  <Route path="/soundtrack" element={<Soundtrack />} /> {/* Nueva ruta para Soundtrack */}
                  <Route path="/campaign" element={<Campaign />} /> {/* Nueva ruta para Campaign */}
                  {/* Aquí se añadirán más rutas para Bestiary, Shops, etc. */}
                  <Route path="/" element={<h1>Bienvenido al DMS Tabletop Tool</h1>} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;