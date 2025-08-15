const express = require('express');
const cors = require('cors');
const { setupDatabase, migrateDataFromJsons, getMonsters, addMonster, updateMonster, deleteMonster, deleteAllMonsters, getMaps, addMap, updateMap, deleteMap, getShops, addShop, updateShop, deleteShop, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem } = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize database and migrate data on startup
setupDatabase();
migrateDataFromJsons();

// API Endpoints for Monsters
app.get('/monsters', (req, res) => {
    const result = getMonsters();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/monsters', (req, res) => {
    const result = addMonster(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.put('/monsters/:id', (req, res) => {
    const monster = { ...req.body, id: req.params.id };
    const result = updateMonster(monster);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/monsters/:id', (req, res) => {
    const result = deleteMonster(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/monsters', (req, res) => {
    const result = deleteAllMonsters();
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// API Endpoints for Maps
app.get('/maps', (req, res) => {
    const result = getMaps();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/maps', (req, res) => {
    const result = addMap(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.put('/maps/:id', (req, res) => {
    const map = { ...req.body, id: req.params.id };
    const result = updateMap(map);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/maps/:id', (req, res) => {
    const result = deleteMap(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// API Endpoints for Shops
app.get('/shops', (req, res) => {
    const result = getShops();
    if (result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.post('/shops', (req, res) => {
    const result = addShop(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.put('/shops/:id', (req, res) => {
    const shop = { ...req.body, id: req.params.id };
    const result = updateShop(shop);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/shops/:id', (req, res) => {
    const result = deleteShop(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// API Endpoints for Categories
app.post('/categories', (req, res) => {
    const result = addCategory(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.put('/categories/:id', (req, res) => {
    const category = { ...req.body, id: req.params.id };
    const result = updateCategory(category);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/categories/:id', (req, res) => {
    const result = deleteCategory(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// API Endpoints for Items
app.post('/items', (req, res) => {
    const result = addItem(req.body);
    if (result.success) {
        res.status(201).json({ id: result.id });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.put('/items/:id', (req, res) => {
    const item = { ...req.body, id: req.params.id };
    const result = updateItem(item);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.delete('/items/:id', (req, res) => {
    const result = deleteItem(req.params.id);
    if (result.success) {
        res.json({ changes: result.changes });
    } else {
        res.status(500).json({ error: result.error });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});