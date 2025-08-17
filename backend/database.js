const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Paths
const dbPath = path.resolve(__dirname, '..', 'data', 'dms_tool.db');
const dataDir = path.resolve(__dirname, '..', 'data');
const monstersFilePath = path.join(dataDir, 'monsters.json');
const mapsFilePath = path.join(dataDir, 'maps.json');
const shopsFilePath = path.join(dataDir, 'shops.json');

const db = new Database(dbPath);

// SQL para crear las tablas
const createTablesStmt = `

CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT, vd TEXT, type TEXT, alignment TEXT, origin TEXT, size TEXT, px TEXT, armor TEXT, hp TEXT, speed TEXT, str TEXT, dex TEXT, con TEXT, int TEXT, wis TEXT, car TEXT, savingThrows TEXT, skills TEXT, senses TEXT, languages TEXT, damageResistances TEXT, damageImmunities TEXT, conditionImmunities TEXT, damageVulnerabilities TEXT, traits TEXT, actions TEXT, legendaryActions TEXT, reactions TEXT, description TEXT, image TEXT
);

CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY, name TEXT, group_name TEXT, url TEXT, imagePath TEXT, image_data BLOB, keepOpen INTEGER, zoom REAL, rotation REAL, panX REAL, panY REAL, original_width INTEGER, original_height INTEGER
);

CREATE TABLE IF NOT EXISTS shops ( id TEXT PRIMARY KEY, name TEXT );

CREATE TABLE IF NOT EXISTS categories ( id TEXT PRIMARY KEY, shop_id TEXT, name TEXT, FOREIGN KEY (shop_id) REFERENCES shops (id) );

CREATE TABLE IF NOT EXISTS items ( id TEXT PRIMARY KEY, category_id TEXT, name TEXT, details TEXT, FOREIGN KEY (category_id) REFERENCES categories (id) );

CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    name TEXT,
    group_name TEXT,
    filePath TEXT
);
`;

// Función para inicializar la base de datos
function setupDatabase() {
    db.exec(createTablesStmt);
    console.log('Base de datos SQLite inicializada y lista.');
}

function getMonsters() {
    try {
        const stmt = db.prepare('SELECT * FROM monsters');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addMonster(monster) {
    console.log('Backend: addMonster called with:', monster);
    try {
        const monsterToInsert = {
            ...monster,
            car: monster.cha // Map 'cha' from frontend to 'car' for DB
        };
        const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Paths
const dbPath = path.resolve(__dirname, '..', 'data', 'dms_tool.db');
const dataDir = path.resolve(__dirname, '..', 'data');
const monstersFilePath = path.join(dataDir, 'monsters.json');
const mapsFilePath = path.join(dataDir, 'maps.json');
const shopsFilePath = path.join(dataDir, 'shops.json');

const db = new Database(dbPath);

// SQL para crear las tablas
const createTablesStmt = `
CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT, vd TEXT, type TEXT, alignment TEXT, origin TEXT, size TEXT, px TEXT, armor TEXT, hp TEXT, speed TEXT, str TEXT, dex TEXT, con TEXT, int TEXT, wis TEXT, car TEXT, savingThrows TEXT, skills TEXT, senses TEXT, languages TEXT, damageResistances TEXT, damageImmunities TEXT, conditionImmunities TEXT, damageVulnerabilities TEXT, traits TEXT, actions TEXT, legendaryActions TEXT, reactions TEXT, description TEXT, image TEXT
);

CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY, name TEXT, group_name TEXT, url TEXT, imagePath TEXT, image_data BLOB, keepOpen INTEGER, zoom REAL, rotation REAL, panX REAL, panY REAL, original_width INTEGER, original_height INTEGER
);

CREATE TABLE IF NOT EXISTS shops ( id TEXT PRIMARY KEY, name TEXT );

CREATE TABLE IF NOT EXISTS categories ( id TEXT PRIMARY KEY, shop_id TEXT, name TEXT, FOREIGN KEY (shop_id) REFERENCES shops (id) );

CREATE TABLE IF NOT EXISTS items ( id TEXT PRIMARY KEY, category_id TEXT, name TEXT, details TEXT, FOREIGN KEY (category_id) REFERENCES categories (id) );

CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    name TEXT,
    group_name TEXT,
    filePath TEXT
);
`;

// Función para inicializar la base de datos
function setupDatabase() {
    db.exec(createTablesStmt);
    console.log('Base de datos SQLite inicializada y lista.');
}

function getMonsters() {
    try {
        const stmt = db.prepare('SELECT * FROM monsters');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addMonster(monster) {
    console.log('Backend: addMonster called with:', monster);
    try {
        const monsterToInsert = {
            ...monster,
            car: monster.cha // Map 'cha' from frontend to 'car' for DB
        };
        const stmt = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunities, @damageVulnerabilities, @traits, @actions, @legendaryActions, @reactions, @description, @image)');
        const info = stmt.run(monsterToInsert);
        console.log('Backend: addMonster successful, info:', info);
        return { success: true, id: monster.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Backend: Error in addMonster:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMonster(monster) {
    try {
        const monsterToUpdate = {
            ...monster,
            car: monster.cha // Map 'cha' from frontend to 'car' for DB
        };
        const stmt = db.prepare('UPDATE monsters SET name = @name, vd = @vd, type = @type, alignment = @alignment, origin = @origin, size = @size, px = @px, armor = @armor, hp = @hp, speed = @speed, str = @str, dex = @dex, con = @con, int = @int, wis = @wis, car = @car, savingThrows = @savingThrows, skills = @skills, senses = @senses, languages = @languages, damageResistances = @damageResistances, damageImmunities = @damageImmunities, conditionImmunities = @conditionImmunities, damageVulnerabilities = @damageVulnerabilities, traits = @traits, actions = @actions, legendaryActions = @legendaryActions, reactions = @reactions, description = @description, image = @image WHERE id = @id');
        const info = stmt.run(monsterToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteMonster(monsterId) {
    try {
        const stmt = db.prepare('DELETE FROM monsters WHERE id = ?');
        const info = stmt.run(monsterId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteAllMonsters() {
    try {
        const stmt = db.prepare('DELETE FROM monsters');
        const info = stmt.run();
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getMaps() {
    console.log('Backend: getMaps called');
    try {
        const stmt = db.prepare('SELECT * FROM maps');
        const data = stmt.all();
        const mapsWithImageData = data.map(map => {
            if (map.image_data) {
                return { ...map, image_data: `data:image/png;base64,${map.image_data.toString('base64')}` };
            }
            return map;
        });
        console.log('Backend: getMaps successful');
        return { success: true, data: mapsWithImageData };
    } catch (error) {
        console.error('Backend: Error in getMaps:', error.message);
        return { success: false, error: error.message };
    }
}

function addMap(map) {
    console.log('Backend: addMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height)');
        const mapToInsert = {
            id: map.id,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null
        };
        const info = stmt.run(mapToInsert);
        console.log('Backend: addMap successful, info:', info);
        return { success: true, id: map.id };
    } catch (error) {
        console.error('Backend: Error in addMap:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMap(map) {
    console.log('Backend: updateMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('UPDATE maps SET name = @name, group_name = @group_name, url = @url, imagePath = @imagePath, image_data = @image_data, keepOpen = @keepOpen, zoom = @zoom, rotation = @rotation, panX = @panX, panY = @panY, original_width = @original_width, original_height = @original_height WHERE id = @id');
        const mapToUpdate = {
            id: map.id,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null
        };
        const info = stmt.run(mapToUpdate);
        console.log('Backend: updateMap successful, info:', info);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Backend: Error in updateMap:', error.message);
        return { success: false, error: error.message };
    }
}

function deleteMap(mapId) {
    console.log('Backend: deleteMap called with ID:', mapId);
    try {
        const stmt = db.prepare('DELETE FROM maps WHERE id = ?');
        const info = stmt.run(mapId);
        console.log('Backend: deleteMap successful, info:', info);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Shop CRUD
function getShops() {
    try {
        const shops = db.prepare('SELECT * FROM shops').all();
        const categories = db.prepare('SELECT * FROM categories').all();
        const items = db.prepare('SELECT * FROM items').all();

        const shopsMap = new Map(shops.map(s => [s.id, { ...s, categories: [] }]));
        const categoriesMap = new Map(categories.map(c => [c.id, { ...c, items: [] }]));

        items.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push({ ...item, details: JSON.parse(item.details || '{}') });
            }
        });

        categories.forEach(category => {
            if (shopsMap.has(category.shop_id)) {
                shopsMap.get(category.shop_id).categories.push(categoriesMap.get(category.id));
            }
        });

        return { success: true, data: Array.from(shopsMap.values()) };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addShop(shop) {
    try {
        const stmt = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const info = stmt.run(shop);
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateShop(shop) {
    try {
        const stmt = db.prepare('UPDATE shops SET name = @name WHERE id = @id');
        const info = stmt.run(shop);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteShop(shopId) {
    try {
        db.transaction(() => {
            // Delete items first
            db.prepare('DELETE FROM items WHERE category_id IN (SELECT id FROM categories WHERE shop_id = ?)').run(shopId);
            // Delete categories
            db.prepare('DELETE FROM categories WHERE shop_id = ?)').run(shopId);
            // Delete shop
            db.prepare('DELETE FROM shops WHERE id = ?)').run(shopId);
        })();
        return { success: true, changes: 1 }; // Indicate at least one change
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Category CRUD
function addCategory(category) {
    try {
        const stmt = db.prepare('INSERT INTO categories (id, shop_id, name) VALUES (@id, @shop_id, @name)');
        const info = stmt.run(category);
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCategory(category) {
    try {
        const stmt = db.prepare('UPDATE categories SET name = @name WHERE id = @id');
        const info = stmt.run(category);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCategory(categoryId) {
    try {
        db.transaction(() => {
            // Delete items first
            db.prepare('DELETE FROM items WHERE category_id = ?)').run(categoryId);
            // Delete category
            db.prepare('DELETE FROM categories WHERE id = ?)').run(categoryId);
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Item CRUD
function addItem(item) {
    try {
        const stmt = db.prepare('INSERT INTO items (id, category_id, name, details) VALUES (@id, @category_id, @name, @details)');
        const info = stmt.run({ ...item, details: JSON.stringify(item.details || {}) });
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateItem(item) {
    try {
        const stmt = db.prepare('UPDATE items SET name = @name, details = @details WHERE id = @id');
        const info = stmt.run({ ...item, details: JSON.stringify(item.details || {}) });
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteItem(itemId) {
    try {
        const stmt = db.prepare('DELETE FROM items WHERE id = ?)');
        const info = stmt.run(itemId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Song CRUD
function getSongs() {
    try {
        const stmt = db.prepare('SELECT * FROM songs');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addSong(song) {
    console.log('Adding song to database:', song);
    try {
        const songToInsert = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('INSERT INTO songs (id, name, group_name, filePath) VALUES (@id, @name, @group_name, @filePath)');
        const info = stmt.run(songToInsert);
        console.log('Song added successfully:', info);
        return { success: true, id: song.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Error adding song to database:', error);
        return { success: false, error: error.message };
    }
}

function updateSong(song) {
    try {
        const songToUpdate = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('UPDATE songs SET name = @name, group_name = @group_name, filePath = @filePath WHERE id = @id');
        const info = stmt.run(songToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteSong(songId) {
    try {
        const stmt = db.prepare('DELETE FROM songs WHERE id = ?)');
        const info = stmt.run(songId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Función para migrar datos desde JSON
function migrateDataFromJsons() {
    console.log('Comprobando si es necesaria la migración de datos...');
    // Migrar Monstruos
    const monsterCount = db.prepare('SELECT COUNT(*) as count FROM monsters').get().count;
    if (monsterCount === 0 && fs.existsSync(monstersFilePath)) {
        const monsters = JSON.parse(fs.readFileSync(monstersFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunities, @damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image)');
        db.transaction((data) => {
            for (const monster of data) insert.run(monster);
        })(monsters);
        console.log(`${monsters.length} monstruos migrados.`);
    }

    // Migrar Mapas
    const mapCount = db.prepare('SELECT COUNT(*) as count FROM maps').get().count;
    if (mapCount === 0 && fs.existsSync(mapsFilePath)) {
        const maps = JSON.parse(fs.readFileSync(mapsFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, keepOpen, zoom, rotation, panX, panY) VALUES (@id, @name, @group_name, @url, @imagePath, @keepOpen, @zoom, @rotation, @panX, @panY)');
        
        const insertManyMaps = db.transaction((data) => {
            for (const map of data) {
                const mapToInsert = {
                    id: map.id,
                    name: map.name,
                    group_name: map.group, // Mapeo correcto
                    url: map.url,
                    imagePath: map.imagePath,
                    keepOpen: map.keepOpen ? 1 : 0,
                    zoom: map.zoom ?? 1,
                    rotation: map.rotation ?? 0,
                    panX: map.panX ?? 0,
                    panY: map.panY ?? 0
                };
                insert.run(mapToInsert);
            }
        });

        insertManyMaps(maps);
        console.log(`${maps.length} mapas migrados.`);
    }

    // Migrar Tiendas
    const shopCount = db.prepare('SELECT COUNT(*) as count FROM shops').get().count;
    if (shopCount === 0 && fs.existsSync(shopsFilePath)) {
        const shops = JSON.parse(fs.readFileSync(shopsFilePath, 'utf8'));
        const insertShop = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const insertCategory = db.prepare('INSERT INTO categories (id, shop_id, name) VALUES (@id, @shop_id, @name)');
        const insertItem = db.prepare('INSERT INTO items (id, category_id, name, details) VALUES (@id, @category_id, @name, @details)');
        
        db.transaction((data) => {
            for (const shop of data) {
                insertShop.run({ id: shop.id, name: shop.name });
                if (shop.categories) {
                    for (const category of shop.categories) {
                        insertCategory.run({ id: category.id, shop_id: shop.id, name: category.name });
                        if (category.items) {
                            for (const item of category.items) {
                                const { id, name, ...details } = item;
                                insertItem.run({ id, category_id: category.id, name, details: JSON.stringify(details) });
                            }
                        }
                    }
                }
            }
        })(shops);
        console.log(`${shops.length} tiendas migradas.`);
    }
    console.log('Migración de datos completada.');
}

// Exportamos
module.exports = { db, setupDatabase, migrateDataFromJsons, getMonsters, addMonster, updateMonster, deleteMonster, deleteAllMonsters, getMaps, addMap, updateMap, deleteMap, getShops, addShop, updateShop, deleteShop, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, getSongs, addSong, updateSong, deleteSong };
        const info = stmt.run(monsterToInsert);
        console.log('Backend: addMonster successful, info:', info);
        return { success: true, id: monster.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Backend: Error in addMonster:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMonster(monster) {
    try {
        const monsterToUpdate = {
            ...monster,
            car: monster.cha // Map 'cha' from frontend to 'car' for DB
        };
        const stmt = db.prepare('UPDATE monsters SET name = @name, vd = @vd, type = @type, alignment = @alignment, origin = @origin, size = @size, px = @px, armor = @armor, hp = @hp, speed = @speed, str = @str, dex = @dex, con = @con, int = @int, wis = @wis, car = @car, savingThrows = @savingThrows, skills = @skills, senses = @senses, languages = @languages, damageResistances = @damageResistances, damageImmunities = @damageImmunities, conditionImmunities = @conditionImmunities, damageVulnerabilities = @damageVulnerabilities, traits = @traits, actions = @actions, legendaryActions = @legendaryActions, reactions = @reactions, description = @description, image = @image WHERE id = @id');
        const info = stmt.run(monsterToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteMonster(monsterId) {
    try {
        const stmt = db.prepare('DELETE FROM monsters WHERE id = ?');
        const info = stmt.run(monsterId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteAllMonsters() {
    try {
        const stmt = db.prepare('DELETE FROM monsters');
        const info = stmt.run();
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getMaps() {
    console.log('Backend: getMaps called');
    try {
        const stmt = db.prepare('SELECT * FROM maps');
        const data = stmt.all();
        const mapsWithImageData = data.map(map => {
            if (map.image_data) {
                return { ...map, image_data: `data:image/png;base64,${map.image_data.toString('base64')}` };
            }
            return map;
        });
        console.log('Backend: getMaps successful');
        return { success: true, data: mapsWithImageData };
    } catch (error) {
        console.error('Backend: Error in getMaps:', error.message);
        return { success: false, error: error.message };
    }
}

function addMap(map) {
    console.log('Backend: addMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height)');
        const mapToInsert = {
            id: map.id,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null
        };
        const info = stmt.run(mapToInsert);
        console.log('Backend: addMap successful, info:', info);
        return { success: true, id: map.id };
    } catch (error) {
        console.error('Backend: Error in addMap:', error.message);
        return { success: false, error: error.message };
    }
}

function updateMap(map) {
    console.log('Backend: updateMap called with:', map.name);
    try {
        let imageDataBuffer = null;
        if (map.image_data) {
            const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('UPDATE maps SET name = @name, group_name = @group_name, url = @url, imagePath = @imagePath, image_data = @image_data, keepOpen = @keepOpen, zoom = @zoom, rotation = @rotation, panX = @panX, panY = @panY, original_width = @original_width, original_height = @original_height WHERE id = @id');
        const mapToUpdate = {
            id: map.id,
            name: map.name,
            group_name: map.group_name || null,
            url: map.url || null,
            imagePath: map.imagePath || null,
            image_data: imageDataBuffer,
            keepOpen: map.keepOpen ? 1 : 0,
            zoom: map.zoom || 1,
            rotation: map.rotation || 0,
            panX: map.panX || 0,
            panY: map.panY || 0,
            original_width: map.originalWidth || null,
            original_height: map.originalHeight || null
        };
        const info = stmt.run(mapToUpdate);
        console.log('Backend: updateMap successful, info:', info);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Backend: Error in updateMap:', error.message);
        return { success: false, error: error.message };
    }
}

function deleteMap(mapId) {
    console.log('Backend: deleteMap called with ID:', mapId);
    try {
        const stmt = db.prepare('DELETE FROM maps WHERE id = ?');
        const info = stmt.run(mapId);
        console.log('Backend: deleteMap successful, info:', info);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Shop CRUD
function getShops() {
    try {
        const shops = db.prepare('SELECT * FROM shops').all();
        const categories = db.prepare('SELECT * FROM categories').all();
        const items = db.prepare('SELECT * FROM items').all();

        const shopsMap = new Map(shops.map(s => [s.id, { ...s, categories: [] }]));
        const categoriesMap = new Map(categories.map(c => [c.id, { ...c, items: [] }]));

        items.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push({ ...item, details: JSON.parse(item.details || '{}') });
            }
        });

        categories.forEach(category => {
            if (shopsMap.has(category.shop_id)) {
                shopsMap.get(category.shop_id).categories.push(categoriesMap.get(category.id));
            }
        });

        return { success: true, data: Array.from(shopsMap.values()) };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addShop(shop) {
    try {
        const stmt = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const info = stmt.run(shop);
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateShop(shop) {
    try {
        const stmt = db.prepare('UPDATE shops SET name = @name WHERE id = @id');
        const info = stmt.run(shop);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteShop(shopId) {
    try {
        db.transaction(() => {
            // Delete items first
            db.prepare('DELETE FROM items WHERE category_id IN (SELECT id FROM categories WHERE shop_id = ?)').run(shopId);
            // Delete categories
            db.prepare('DELETE FROM categories WHERE shop_id = ?').run(shopId);
            // Delete shop
            db.prepare('DELETE FROM shops WHERE id = ?').run(shopId);
        })();
        return { success: true, changes: 1 }; // Indicate at least one change
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Category CRUD
function addCategory(category) {
    try {
        const stmt = db.prepare('INSERT INTO categories (id, shop_id, name) VALUES (@id, @shop_id, @name)');
        const info = stmt.run(category);
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCategory(category) {
    try {
        const stmt = db.prepare('UPDATE categories SET name = @name WHERE id = @id');
        const info = stmt.run(category);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCategory(categoryId) {
    try {
        db.transaction(() => {
            // Delete items first
            db.prepare('DELETE FROM items WHERE category_id = ?').run(categoryId);
            // Delete category
            db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Item CRUD
function addItem(item) {
    try {
        const stmt = db.prepare('INSERT INTO items (id, category_id, name, details) VALUES (@id, @category_id, @name, @details)');
        const info = stmt.run({ ...item, details: JSON.stringify(item.details || {}) });
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateItem(item) {
    try {
        const stmt = db.prepare('UPDATE items SET name = @name, details = @details WHERE id = @id');
        const info = stmt.run({ ...item, details: JSON.stringify(item.details || {}) });
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteItem(itemId) {
    try {
        const stmt = db.prepare('DELETE FROM items WHERE id = ?');
        const info = stmt.run(itemId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Song CRUD
function getSongs() {
    try {
        const stmt = db.prepare('SELECT * FROM songs');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addSong(song) {
    console.log('Adding song to database:', song);
    try {
        const songToInsert = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('INSERT INTO songs (id, name, group_name, filePath) VALUES (@id, @name, @group_name, @filePath)');
        const info = stmt.run(songToInsert);
        console.log('Song added successfully:', info);
        return { success: true, id: song.id }; // Return the ID that was passed in
    } catch (error) {
        console.error('Error adding song to database:', error);
        return { success: false, error: error.message };
    }
}

function updateSong(song) {
    try {
        const songToUpdate = {
            id: song.id,
            name: song.name,
            group_name: song.group, // Map 'group' from frontend to 'group_name' for DB
            filePath: song.filePath
        };
        const stmt = db.prepare('UPDATE songs SET name = @name, group_name = @group_name, filePath = @filePath WHERE id = @id');
        const info = stmt.run(songToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteSong(songId) {
    try {
        const stmt = db.prepare('DELETE FROM songs WHERE id = ?');
        const info = stmt.run(songId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Función para migrar datos desde JSON
function migrateDataFromJsons() {
    console.log('Comprobando si es necesaria la migración de datos...');
    // Migrar Monstruos
    const monsterCount = db.prepare('SELECT COUNT(*) as count FROM monsters').get().count;
    if (monsterCount === 0 && fs.existsSync(monstersFilePath)) {
        const monsters = JSON.parse(fs.readFileSync(monstersFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunities, @damageVulnerabilities, @traits, @actions, @legendaryActions, @reactions, @description, @image)');
        db.transaction((data) => {
            for (const monster of data) insert.run(monster);
        })(monsters);
        console.log(`${monsters.length} monstruos migrados.`);
    }

    // Migrar Mapas
    const mapCount = db.prepare('SELECT COUNT(*) as count FROM maps').get().count;
    if (mapCount === 0 && fs.existsSync(mapsFilePath)) {
        const maps = JSON.parse(fs.readFileSync(mapsFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, keepOpen, zoom, rotation, panX, panY) VALUES (@id, @name, @group_name, @url, @imagePath, @keepOpen, @zoom, @rotation, @panX, @panY)');
        
        const insertManyMaps = db.transaction((data) => {
            for (const map of data) {
                const mapToInsert = {
                    id: map.id,
                    name: map.name,
                    group_name: map.group, // Mapeo correcto
                    url: map.url,
                    imagePath: map.imagePath,
                    keepOpen: map.keepOpen ? 1 : 0,
                    zoom: map.zoom ?? 1,
                    rotation: map.rotation ?? 0,
                    panX: map.panX ?? 0,
                    panY: map.panY ?? 0
                };
                insert.run(mapToInsert);
            }
        });

        insertManyMaps(maps);
        console.log(`${maps.length} mapas migrados.`);
    }

    // Migrar Tiendas
    const shopCount = db.prepare('SELECT COUNT(*) as count FROM shops').get().count;
    if (shopCount === 0 && fs.existsSync(shopsFilePath)) {
        const shops = JSON.parse(fs.readFileSync(shopsFilePath, 'utf8'));
        const insertShop = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const insertCategory = db.prepare('INSERT INTO categories (id, shop_id, name) VALUES (@id, @shop_id, @name)');
        const insertItem = db.prepare('INSERT INTO items (id, category_id, name, details) VALUES (@id, @category_id, @name, @details)');
        
        db.transaction((data) => {
            for (const shop of data) {
                insertShop.run({ id: shop.id, name: shop.name });
                if (shop.categories) {
                    for (const category of shop.categories) {
                        insertCategory.run({ id: category.id, shop_id: shop.id, name: category.name });
                        if (category.items) {
                            for (const item of category.items) {
                                const { id, name, ...details } = item;
                                insertItem.run({ id, category_id: category.id, name, details: JSON.stringify(details) });
                            }
                        }
                    }
                }
            }
        })(shops);
        console.log(`${shops.length} tiendas migradas.`);
    }
    console.log('Migración de datos completada.');
}

// Exportamos
module.exports = { db, setupDatabase, migrateDataFromJsons, getMonsters, addMonster, updateMonster, deleteMonster, deleteAllMonsters, getMaps, addMap, updateMap, deleteMap, getShops, addShop, updateShop, deleteShop, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, getSongs, addSong, updateSong, deleteSong };