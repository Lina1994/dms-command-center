import React, { useState, useEffect, useCallback } from 'react';
import AddEditItemModal from './AddEditItemModal';
import './Shops.css';

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

  const fetchShops = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shops`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setShops(data);
      if (data.length > 0 && !selectedShopId) {
        setSelectedShopId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  }, [selectedShopId]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Effect to save shops to backend when 'shops' state changes
  useEffect(() => {
    const saveShopsToBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shops`);
        const currentShopsInDb = await response.json();

        const shopsFromRendererMap = new Map(shops.map(s => [s.id, s]));
        const currentShopsInDbMap = new Map(currentShopsInDb.map(s => [s.id, s]));

        // Sync Shops
        for (const shop of shops) {
          if (currentShopsInDbMap.has(shop.id)) {
            await fetch(`${API_BASE_URL}/shops/${shop.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(shop),
            });
          } else {
            await fetch(`${API_BASE_URL}/shops`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(shop),
            });
          }

          const currentCategoriesInDbMap = new Map(currentShopsInDbMap.has(shop.id) ? currentShopsInDbMap.get(shop.id).categories.map(c => [c.id, c]) : []);
          const categoriesFromRendererMap = new Map(shop.categories.map(c => [c.id, c]));

          // Sync Categories for current shop
          for (const category of shop.categories) {
            if (currentCategoriesInDbMap.has(category.id)) {
              await fetch(`${API_BASE_URL}/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category),
              });
            } else {
              await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category),
              });
            }

            const currentItemsInDbMap = new Map(currentCategoriesInDbMap.has(category.id) ? currentCategoriesInDbMap.get(category.id).items.map(i => [i.id, i]) : []);
            const itemsFromRendererMap = new Map(category.items.map(i => [i.id, i]));

            // Sync Items for current category
            for (const item of category.items) {
              if (currentItemsInDbMap.has(item.id)) {
                await fetch(`${API_BASE_URL}/items/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item),
                });
              } else {
                await fetch(`${API_BASE_URL}/items`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item),
                });
              }
            }

            // Delete items not present in renderer's list for this category
            for (const itemId of currentItemsInDbMap.keys()) {
              if (!itemsFromRendererMap.has(itemId)) {
                await fetch(`${API_BASE_URL}/items/${itemId}`, {
                  method: 'DELETE',
                });
              }
            }
          }

          // Delete categories not present in renderer's list for this shop
          for (const categoryId of currentCategoriesInDbMap.keys()) {
            if (!categoriesFromRendererMap.has(categoryId)) {
              await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
                method: 'DELETE',
              });
            }
          }
        }

        // Delete shops not present in the renderer's list
        for (const shopId of currentShopsInDbMap.keys()) {
          if (!shopsFromRendererMap.has(shopId)) {
            await fetch(`${API_BASE_URL}/shops/${shopId}`, {
              method: 'DELETE',
            });
          }
        }

        console.log('Tiendas guardadas exitosamente en la base de datos a través del backend.');
      } catch (error) {
        console.error('Error al guardar tiendas en la base de datos a través del backend:', error);
      }
    };

    // Only save if shops array is not empty to avoid saving an empty state on initial load
    if (shops.length > 0) {
      saveShopsToBackend();
    }
  }, [shops]);

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
    handleCloseModal();
  };

  const handleDeleteItem = (itemToDelete, category) => {
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
  };

  const selectedShop = shops.find(shop => shop.id === selectedShopId);

  return (
    <div className="shops-container">
      <h2>Shops</h2>
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
              <div className="item-list">
                {category.items.map(item => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <strong>{item.name}</strong>
                      <div className="item-actions">
                        <button onClick={() => handleOpenModal(item, category)}>Edit</button>
                        <button onClick={() => handleDeleteItem(item, category)}>Delete</button>
                      </div>
                    </div>
                    <div className="item-body">
                      {Object.entries(item).map(([key, value]) => {
                        if (key === 'id' || key === 'name') return null; // Skip id and name
                        if (typeof value === 'object' && value !== null) {
                          // If value is an object (like 'details'), iterate its entries
                          return Object.entries(value).map(([detailKey, detailValue]) => (
                            <p key={`${key}-${detailKey}`}><strong>{detailKey}:</strong> {detailValue}</p>
                          ));
                        }
                        return <p key={key}><strong>{key}:</strong> {value}</p>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button className="add-item-btn" onClick={() => handleOpenModal(null, category)}>Add New {category.name.slice(0, -1)}</button>
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