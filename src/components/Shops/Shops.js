import React, { useState, useEffect, useCallback } from 'react';
import AddEditItemModal from './AddEditItemModal';
import './Shops.css';

let ipcRenderer = null;
if (window.require) {
  try {
    const electron = window.require('electron');
    if (electron && electron.ipcRenderer) {
      ipcRenderer = electron.ipcRenderer;
    }
  } catch (e) {
    console.warn("Could not load electron.ipcRenderer:", e);
  }
}

const API_BASE_URL = 'http://localhost:3001';

const generateUniqueId = () => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function Shops() {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchShops = useCallback(async () => {
    try {
      console.log('Fetching shops...');
      const response = await fetch(`${API_BASE_URL}/shops`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Shops fetched successfully:', data);
      setShops(data);
      if (data.length > 0 && !selectedShopId) {
        setSelectedShopId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      const savedShops = localStorage.getItem('shops');
      if (savedShops) {
        console.log('Loading shops from localStorage');
        setShops(JSON.parse(savedShops));
      }
    }
  }, [selectedShopId]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    if (!ipcRenderer) return;

    const handleImportResult = (event, { success, items, categoryType, error }) => {
      setIsImporting(false);
      if (success) {
        const newShops = shops.map(shop => {
          if (shop.id === selectedShopId) {
            const newCategories = shop.categories.map(cat => {
              if (cat.type === categoryType) {
                const newItems = [...cat.items];
                items.forEach(item => {
                  const newItem = { ...item, id: generateUniqueId() };
                  newItems.push(newItem);
                });
                return { ...cat, items: newItems };
              }
              return cat;
            });
            return { ...shop, categories: newCategories };
          }
          return shop;
        });
        setShops(newShops);
        saveShops(newShops);
      } else {
        console.error(`Error al importar items: ${error}`);
      }
    };

    const handleExportResult = (event, { success, error }) => {
      setIsExporting(false);
      if (!success) {
        console.error(`Error al exportar items: ${error}`);
      }
    };

    ipcRenderer.on('imported-items', handleImportResult);
    ipcRenderer.on('export-items-result', handleExportResult);

    return () => {
      ipcRenderer.removeListener('imported-items', handleImportResult);
      ipcRenderer.removeListener('export-items-result', handleExportResult);
    };
  }, [shops, selectedShopId]);

  const saveShops = async (updatedShops) => {
    try {
      console.log('Saving shops to backend:', updatedShops);
      const response = await fetch(`${API_BASE_URL}/shops/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedShops),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Shops saved to backend successfully');
      localStorage.setItem('shops', JSON.stringify(updatedShops));
    } catch (error) {
      console.error('Error saving shops to backend:', error);
    }
  };

  const handleOpenModal = (item = null, category) => {
    setEditingItem(item);
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedCategory(null);
  };

  const handleSaveItem = (itemData) => {
    console.log('Saving item:', itemData);
    const newShops = shops.map(shop => {
      if (shop.id === selectedShopId) {
        const newCategories = shop.categories.map(cat => {
          if (cat.id === selectedCategory.id) {
            if (editingItem) {
              // Edit item
              const newItems = cat.items.map(it => it.id === editingItem.id ? { ...it, ...itemData } : it);
              return { ...cat, items: newItems };
            } else {
              // Add new item
              const newItem = { ...itemData, id: generateUniqueId() };
              return { ...cat, items: [...cat.items, newItem] };
            }
          }
          return cat;
        });
        return { ...shop, categories: newCategories };
      }
      return shop;
    });
    setShops(newShops);
    saveShops(newShops);
    handleCloseModal();
  };

  const handleDeleteItem = (itemToDelete, category) => {
    console.log('Deleting item:', itemToDelete);
    const newShops = shops.map(shop => {
      if (shop.id === selectedShopId) {
        const newCategories = shop.categories.map(cat => {
          if (cat.id === category.id) {
            const newItems = cat.items.filter(it => it.id !== itemToDelete.id);
            return { ...cat, items: newItems };
          }
          return cat;
        });
        return { ...shop, categories: newCategories };
      }
      return shop;
    });
    setShops(newShops);
    saveShops(newShops);
  };

  const handleImportItems = (categoryType) => {
    if (!ipcRenderer) {
      alert("La importación de Excel solo está disponible en la aplicación de escritorio.");
      return;
    }
    setIsImporting(true);
    ipcRenderer.send('import-items-from-excel', { categoryType });
  };

  const handleExportItems = (category) => {
    if (!ipcRenderer) {
      alert("La exportación a Excel solo está disponible en la aplicación de escritorio.");
      return;
    }
    setIsExporting(true);
    ipcRenderer.send('export-items-to-excel', { items: category.items, categoryName: category.name });
  };

  const selectedShop = shops.find(shop => shop.id === selectedShopId);

  return (
    <div className="shops-container">
      <h2>Tiendas</h2>
      <div className="shops-controls">
        <select onChange={(e) => setSelectedShopId(e.target.value)} value={selectedShopId || ''}>
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>
      {selectedShop && (
        <div className="shop-details">
          <h3>{selectedShop.name}</h3>
          {selectedShop.categories.map(category => (
            <div key={category.id} className="category-section">
              <h4>{category.name}</h4>
              <div className="category-controls">
                <button onClick={() => handleImportItems(category.type)} disabled={isImporting}>
                  {isImporting ? 'Importando...' : `Importar ${category.name}`}
                </button>
                <button onClick={() => handleExportItems(category)} disabled={isExporting}>
                  {isExporting ? 'Exportando...' : `Exportar ${category.name}`}
                </button>
              </div>
              <table className="item-table">
                <thead>
                  <tr>
                    {category.items.length > 0 && Object.keys(category.items[0]).map(key => {
                      if (key === 'id' || key === 'category_id') return null;
                      return <th key={key}>{key}</th>
                    })}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map(item => (
                    <tr key={item.id}>
                      {Object.entries(item).map(([key, value]) => {
                        if (key === 'id' || key === 'category_id') return null;
                        if (typeof value === 'object' && value !== null) {
                          return <td key={key}>{JSON.stringify(value)}</td>;
                        }
                        return <td key={key}>{value}</td>;
                      })}
                      <td>
                        <button onClick={() => handleOpenModal(item, category)}>Editar</button>
                        <button onClick={() => handleDeleteItem(item, category)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="add-item-btn" onClick={() => handleOpenModal(null, category)}>Añadir {category.name.slice(0, -1)}</button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <AddEditItemModal
          item={editingItem}
          category={selectedCategory}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

export default Shops;