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

// SQL to create the tables
const createTablesStmt = `

CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT, vd TEXT, type TEXT, alignment TEXT, origin TEXT, size TEXT, px TEXT, armor TEXT, hp TEXT, speed TEXT, str TEXT, dex TEXT, con TEXT, int TEXT, wis TEXT, car TEXT, savingThrows TEXT, skills TEXT, senses TEXT, languages TEXT, damageResistances TEXT, damageImmunities TEXT, conditionImmunities TEXT, damageVulnerabilities TEXT, traits TEXT, actions TEXT, legendaryActions TEXT, reactions TEXT, description TEXT, image TEXT
);

CREATE TABLE IF NOT EXISTS maps (
    id TEXT PRIMARY KEY, name TEXT, group_name TEXT, url TEXT, imagePath TEXT, image_data BLOB, keepOpen INTEGER, zoom REAL, rotation REAL, panX REAL, panY REAL, original_width INTEGER, original_height INTEGER, notes TEXT, song_id TEXT, campaign_id TEXT, FOREIGN KEY (song_id) REFERENCES songs (id), FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

CREATE TABLE IF NOT EXISTS shops ( id TEXT PRIMARY KEY, name TEXT );

CREATE TABLE IF NOT EXISTS categories ( id TEXT PRIMARY KEY, shop_id TEXT, name TEXT, type TEXT, FOREIGN KEY (shop_id) REFERENCES shops (id) );

CREATE TABLE IF NOT EXISTS items_weapons (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    Nombre TEXT,
    Tipo TEXT,
    Precio TEXT,
    Daño TEXT,
    Peso TEXT,
    Propiedades TEXT,
    Origen TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS items_armors (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    Nombre TEXT,
    Tipo TEXT,
    Precio TEXT,
    "Tipo de armadura" TEXT,
    "Clase de Armadura (CA)" TEXT,
    Fuerza TEXT,
    Sigilo TEXT,
    Origen TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    name TEXT,
    group_name TEXT,
    filePath TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_data BLOB,
    description TEXT,
    author TEXT,
    game TEXT,
    participants TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT,
    level INTEGER,
    background TEXT,
    race TEXT,
    alignment TEXT,
    playerName TEXT,
    experiencePoints INTEGER,
    strength INTEGER,
    dexterity INTEGER,
    constitution INTEGER,
    intelligence INTEGER,
    wisdom INTEGER,
    charisma INTEGER,
    proficiencyBonus INTEGER,
    armorClass INTEGER,
    initiative INTEGER,
    speed INTEGER,
    maxHitPoints INTEGER,
    currentHitPoints INTEGER,
    temporaryHitPoints INTEGER,
    hitDice TEXT,
    otherProficienciesAndLanguages TEXT,
    equipment TEXT,
    featuresAndTraits TEXT,
    age TEXT,
    height TEXT,
    weight TEXT,
    eyes TEXT,
    skin TEXT,
    hair TEXT,
    image BLOB,
    spellcastingAbility TEXT,
    spellSaveDC INTEGER,
    spellAttackBonus INTEGER,
    campaign_id TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);
`;

// Add migration for song_id column to maps table
const addSongIdColumnStmt = `
    PRAGMA foreign_keys = OFF;
    CREATE TABLE IF NOT EXISTS maps_backup (
        id TEXT PRIMARY KEY, name TEXT, group_name TEXT, url TEXT, imagePath TEXT, image_data BLOB, keepOpen INTEGER, zoom REAL, rotation REAL, panX REAL, panY REAL, original_width INTEGER, original_height INTEGER, notes TEXT, song_id TEXT
    );
    INSERT OR IGNORE INTO maps_backup SELECT id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, NULL FROM maps;
    DROP TABLE IF EXISTS maps;
    ALTER TABLE maps_backup RENAME TO maps;
    CREATE INDEX IF NOT EXISTS idx_maps_song_id ON maps (song_id);
    PRAGMA foreign_keys = ON;
`;

const addCampaignIdColumnStmt = `
    PRAGMA foreign_keys = OFF;
    CREATE TABLE IF NOT EXISTS maps_backup_campaign (
        id TEXT PRIMARY KEY, name TEXT, group_name TEXT, url TEXT, imagePath TEXT, image_data BLOB, keepOpen INTEGER, zoom REAL, rotation REAL, panX REAL, panY REAL, original_width INTEGER, original_height INTEGER, notes TEXT, song_id TEXT, campaign_id TEXT
    );
    INSERT OR IGNORE INTO maps_backup_campaign SELECT id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, song_id, NULL FROM maps;
    DROP TABLE IF EXISTS maps;
    ALTER TABLE maps_backup_campaign RENAME TO maps;
    CREATE INDEX IF NOT EXISTS idx_maps_campaign_id ON maps (campaign_id);
    PRAGMA foreign_keys = ON;
`;

// Function to check if a column exists
function columnExists(tableName, columnName) {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return result.some(column => column.name === columnName);
}

// Function to initialize the database
function setupDatabase() {
    db.exec('DROP TABLE IF EXISTS items;');
    db.exec(createTablesStmt);

    // Run migration for song_id column if it doesn't exist
    if (!columnExists('maps', 'song_id')) {
        console.log('Adding song_id column to maps table...');
        db.exec(addSongIdColumnStmt);
        console.log('song_id column added to maps table.');
    }
    if (!columnExists('maps', 'campaign_id')) {
        console.log('Adding campaign_id column to maps table...');
        db.exec(addCampaignIdColumnStmt);
        console.log('campaign_id column added to maps table.');
    }
    if (!columnExists('categories', 'type')) {
        db.exec('ALTER TABLE categories ADD COLUMN type TEXT;');
    }
    if (columnExists('campaigns', 'image')) {
        db.exec('ALTER TABLE campaigns RENAME COLUMN image TO image_data_old');
        db.exec('ALTER TABLE campaigns ADD COLUMN image_data BLOB');
        // Here you could add logic to migrate data from image to image_data if needed
        db.exec('ALTER TABLE campaigns DROP COLUMN image_data_old');
    }
    db.exec(`PRAGMA foreign_keys = ON;`); // Ensure foreign keys are on after setup
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
        const stmt = db.prepare('UPDATE monsters SET name = @name, vd = @vd, type = @type, alignment = @alignment, origin = @origin, size = @size, px = @px, armor = @armor, hp = @hp, speed = @speed, str = @str, dex = @dex, con = @con, int = @int, wis = @wis, car = @car, savingThrows = @savingThrows, skills = @skills, senses = @senses, languages = @languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image = @image WHERE id = @id');
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
        const stmt = db.prepare('SELECT m.*, s.name AS song_name, s.filePath AS song_filePath, c.name AS campaign_name FROM maps m LEFT JOIN songs s ON m.song_id = s.id LEFT JOIN campaigns c ON m.campaign_id = c.id');
        const data = stmt.all();
        const mapsWithImageData = data.map(map => {
            const newMap = { ...map }; // Create a copy to avoid modifying the original map object
            if (newMap.image_data) {
                newMap.image_data = `data:image/png;base64,${newMap.image_data.toString('base64')}`;
            }
            // If song_filePath exists, extract only the filename
            if (newMap.song_filePath) {
                newMap.song_filePath = path.basename(newMap.song_filePath);
            }
            return newMap;
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

        const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, song_id, campaign_id) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height, @notes, @song_id, @campaign_id)');
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
            original_height: map.originalHeight || null,
            notes: map.notes || null,
            song_id: map.song_id || null,
            campaign_id: map.campaign_id || null
        };
        const info = stmt.run(mapToInsert);
        console.log('Backend: addMap successful, info:', info);
        return { success: true, id: map.id };
    } catch (error) {
        console.error('Backend: Error in addMap:', error.message);
        return { success: false, error: error.message };
    }
}

function addMaps(maps) {
    const stmt = db.prepare('INSERT INTO maps (id, name, group_name, url, imagePath, image_data, keepOpen, zoom, rotation, panX, panY, original_width, original_height, notes, song_id, campaign_id) VALUES (@id, @name, @group_name, @url, @imagePath, @image_data, @keepOpen, @zoom, @rotation, @panX, @panY, @original_width, @original_height, @notes, @song_id, @campaign_id)');
    const transaction = db.transaction((maps) => {
        const ids = [];
        for (const map of maps) {
            let imageDataBuffer = null;
            if (map.image_data) {
                const base64Data = map.image_data.replace(/^data:image\/\w+;base64,/, "");
                imageDataBuffer = Buffer.from(base64Data, 'base64');
            }
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
                original_height: map.originalHeight || null,
                notes: map.notes || null,
                song_id: map.song_id || null,
                campaign_id: map.campaign_id || null
            };
            stmt.run(mapToInsert);
            ids.push({ id: map.id });
        }
        return ids;
    });

    try {
        const ids = transaction(maps);
        return { success: true, ids };
    } catch (error) {
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

        const stmt = db.prepare('UPDATE maps SET name = @name, group_name = @group_name, url = @url, imagePath = @imagePath, image_data = @image_data, keepOpen = @keepOpen, zoom = @zoom, rotation = @rotation, panX = @panX, panY = @panY, original_width = @original_width, original_height = @original_height, notes = @notes, song_id = @song_id, campaign_id = @campaign_id WHERE id = @id');
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
            original_height: map.originalHeight || null,
            notes: map.notes || null,
            song_id: map.song_id || null,
            campaign_id: map.campaign_id || null
        };
        const info = stmt.run(mapToUpdate);
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
        const weapons = db.prepare('SELECT * FROM items_weapons').all();
        const armors = db.prepare('SELECT * FROM items_armors').all();

        const shopsMap = new Map(shops.map(s => [s.id, { ...s, categories: [] }]));
        const categoriesMap = new Map(categories.map(c => [c.id, { ...c, items: [] }]));

        weapons.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push(item);
            }
        });

        armors.forEach(item => {
            if (categoriesMap.has(item.category_id)) {
                categoriesMap.get(item.category_id).items.push(item);
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
            const categories = db.prepare('SELECT id FROM categories WHERE shop_id = ?').all(shopId);
            const categoryIds = categories.map(c => c.id);
            if (categoryIds.length > 0) {
                const placeholders = categoryIds.map(() => '?').join(',');
                db.prepare(`DELETE FROM items_weapons WHERE category_id IN (${placeholders})`).run(...categoryIds);
                db.prepare(`DELETE FROM items_armors WHERE category_id IN (${placeholders})`).run(...categoryIds);
            }
            db.prepare('DELETE FROM categories WHERE shop_id = ?').run(shopId);
            db.prepare('DELETE FROM shops WHERE id = ?').run(shopId);
        })();
        return { success: true, changes: 1 }; // Indicate at least one change
    } catch (error) {
        return { success: false, error: error.message };
    }
}


function deleteAllShops() {
    try {
        db.transaction(() => {
            db.prepare('DELETE FROM items_weapons').run();
            db.prepare('DELETE FROM items_armors').run();
            db.prepare('DELETE FROM categories').run();
            db.prepare('DELETE FROM shops').run();
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function syncShops(shops) {
    try {
        deleteAllShops();
        const insertShop = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const insertCategory = db.prepare('INSERT INTO categories (id, shop_id, name, type) VALUES (@id, @shop_id, @name, @type)');
        const insertWeapon = db.prepare('INSERT INTO items_weapons (id, category_id, Nombre, Tipo, Precio, Daño, Peso, Propiedades, Origen) VALUES (@id, @category_id, @Nombre, @Tipo, @Precio, @Daño, @Peso, @Propiedades, @Origen)');
        const insertArmor = db.prepare('INSERT INTO items_armors (id, category_id, Nombre, Tipo, Precio, "Tipo de armadura", "Clase de Armadura (CA)", Fuerza, Sigilo, Origen) VALUES (@id, @category_id, @Nombre, @Tipo, @Precio, @Tipo_de_armadura, @Clase_de_Armadura_CA, @Fuerza, @Sigilo, @Origen)');

        db.transaction((data) => {
            for (const shop of data) {
                insertShop.run({ id: shop.id, name: shop.name });
                if (shop.categories) {
                    for (const category of shop.categories) {
                        insertCategory.run({ id: category.id, shop_id: shop.id, name: category.name, type: category.type });
                        if (category.items) {
                            for (const item of category.items) {
                                if (category.type === 'weapons') {
                                    insertWeapon.run({
                                        id: item.id,
                                        category_id: category.id,
                                        Nombre: item.Nombre,
                                        Tipo: item.Tipo,
                                        Precio: item.Precio,
                                        Daño: item.Daño,
                                        Peso: item.Peso,
                                        Propiedades: item.Propiedades,
                                        Origen: item.Origen
                                    });
                                } else if (category.type === 'armors') {
                                    insertArmor.run({
                                        id: item.id,
                                        category_id: category.id,
                                        Nombre: item.Nombre,
                                        Tipo: item.Tipo,
                                        Precio: item.Precio,
                                        Tipo_de_armadura: item["Tipo de armadura"],
                                        Clase_de_Armadura_CA: item["Clase de Armadura (CA)"],
                                        Fuerza: item.Fuerza,
                                        Sigilo: item.Sigilo,
                                        Origen: item.Origen
                                    });
                                }
                            }
                        }
                    }
                }
            }
        })(shops);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Category CRUD
function addCategory(category) {
    try {
        const stmt = db.prepare('INSERT INTO categories (id, shop_id, name, type) VALUES (@id, @shop_id, @name, @type)');
        const info = stmt.run(category);
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCategory(category) {
    try {
        const stmt = db.prepare('UPDATE categories SET name = @name, type = @type WHERE id = @id');
        const info = stmt.run(category);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCategory(categoryId) {
    try {
        db.transaction(() => {
            db.prepare('DELETE FROM items_weapons WHERE category_id = ?').run(categoryId);
            db.prepare('DELETE FROM items_armors WHERE category_id = ?').run(categoryId);
            db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
        })();
        return { success: true, changes: 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Item CRUD
function addItem(item) {
    // This function needs to be adapted based on whether you are adding a weapon or an armor
    // For now, it's a placeholder.
    return { success: false, error: "addItem is not implemented for new schema" };
}

function updateItem(item) {
    // This function needs to be adapted based on whether you are updating a weapon or an armor
    // For now, it's a placeholder.
    return { success: false, error: "updateItem is not implemented for new schema" };
}

function deleteItem(itemId, categoryType) {
    try {
        let stmt;
        if (categoryType === 'weapons') {
            stmt = db.prepare('DELETE FROM items_weapons WHERE id = ?');
        } else if (categoryType === 'armors') {
            stmt = db.prepare('DELETE FROM items_armors WHERE id = ?');
        } else {
            throw new Error('Invalid category type');
        }
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

// Campaign CRUD
function getCampaigns() {
    try {
        const stmt = db.prepare('SELECT * FROM campaigns');
        const data = stmt.all();
        const campaignsWithImageData = data.map(campaign => {
            const newCampaign = { ...campaign };
            if (newCampaign.image_data) {
                newCampaign.image_data = `data:image/png;base64,${newCampaign.image_data.toString('base64')}`;
            }
            return newCampaign;
        });
        return { success: true, data: campaignsWithImageData };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addCampaign(campaign) {
    try {
        let imageDataBuffer = null;
        if (campaign.image_data) {
            const base64Data = campaign.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const stmt = db.prepare('INSERT INTO campaigns (id, name, image_data, description, author, game, participants, notes) VALUES (@id, @name, @image_data, @description, @author, @game, @participants, @notes)');
        const campaignToInsert = { ...campaign, image_data: imageDataBuffer };
        const info = stmt.run(campaignToInsert);
        return { success: true, id: campaign.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCampaign(campaign) {
    try {
        let imageDataBuffer = null;
        if (campaign.image_data && campaign.image_data.startsWith('data:image')) {
            const base64Data = campaign.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const stmt = db.prepare('UPDATE campaigns SET name = @name, image_data = @image_data, description = @description, author = @author, game = @game, participants = @participants, notes = @notes WHERE id = @id');
        const campaignToUpdate = { ...campaign, image_data: imageDataBuffer };
        const info = stmt.run(campaignToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCampaign(campaignId) {
    try {
        const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
        const info = stmt.run(campaignId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Character CRUD
function getCharacters(campaignId = null) {
    try {
        let stmt;
        if (campaignId) {
            stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id WHERE c.campaign_id = ?');
            return { success: true, data: stmt.all(campaignId).map(char => {
                if (char.image) {
                    char.image = `data:image/png;base64,${char.image.toString('base64')}`;
                }
                return char;
            }) };
        } else {
            stmt = db.prepare('SELECT c.*, ca.name AS campaign_name FROM characters c LEFT JOIN campaigns ca ON c.campaign_id = ca.id');
            return { success: true, data: stmt.all().map(char => {
                if (char.image) {
                    char.image = `data:image/png;base64,${char.image.toString('base64')}`;
                }
                return char;
            }) };
        }
    } catch (error) {
        console.error('Backend: Error in getCharacters:', error.message);
        return { success: false, error: error.message };
    }
}

function addCharacter(character) {
    console.log('Backend: addCharacter called with:', character.name);
    try {
        let imageDataBuffer = null;
        if (character.image) {
            const base64Data = character.image.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }

        const stmt = db.prepare('INSERT INTO characters (id, name, class, level, background, race, alignment, playerName, experiencePoints, strength, dexterity, constitution, intelligence, wisdom, charisma, proficiencyBonus, armorClass, initiative, speed, maxHitPoints, currentHitPoints, temporaryHitPoints, hitDice, otherProficienciesAndLanguages, equipment, featuresAndTraits, age, height, weight, eyes, skin, hair, image, spellcastingAbility, spellSaveDC, spellAttackBonus, campaign_id) VALUES (@id, @name, @class, @level, @background, @race, @alignment, @playerName, @experiencePoints, @strength, @dexterity, @constitution, @intelligence, @wisdom, @charisma, @proficiencyBonus, @armorClass, @initiative, @speed, @maxHitPoints, @currentHitPoints, @temporaryHitPoints, @hitDice, @otherProficienciesAndLanguages, @equipment, @featuresAndTraits, @age, @height, @weight, @eyes, @skin, @hair, @image, @spellcastingAbility, @spellSaveDC, @spellAttackBonus, @campaign_id)');
        const characterToInsert = {
            ...character,
            image: imageDataBuffer,
            level: character.level || null,
            experiencePoints: character.experiencePoints || null,
            strength: character.strength || null,
            dexterity: character.dexterity || null,
            constitution: character.constitution || null,
            intelligence: character.intelligence || null,
            wisdom: character.wisdom || null,
            charisma: character.charisma || null,
            proficiencyBonus: character.proficiencyBonus || null,
            armorClass: character.armorClass || null,
            initiative: character.initiative || null,
            speed: character.speed || null,
            maxHitPoints: character.maxHitPoints || null,
            currentHitPoints: character.currentHitPoints || null,
            temporaryHitPoints: character.temporaryHitPoints || null,
            spellSaveDC: character.spellSaveDC || null,
            spellAttackBonus: character.spellAttackBonus || null,
        };
        const info = stmt.run(characterToInsert);
        console.log('Backend: addCharacter successful, info:', info);
        return { success: true, id: character.id };
    } catch (error) {
        console.error('Backend: Error in addCharacter:', error.message);
        return { success: false, error: error.message };
    }
}

function updateCharacter(character) {
    console.log('Backend: updateCharacter called with:', character.name);
    try {
        let imageDataBuffer = null;
        if (character.image && character.image.startsWith('data:image')) {
            const base64Data = character.image.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        } else {
            imageDataBuffer = character.image; // Keep existing BLOB data if not a new base64 string
        }

        const stmt = db.prepare('UPDATE characters SET name = @name, class = @class, level = @level, background = @background, race = @race, alignment = @alignment, playerName = @playerName, experiencePoints = @experiencePoints, strength = @strength, dexterity = @dexterity, constitution = @constitution, intelligence = @intelligence, wisdom = @wisdom, charisma = @charisma, proficiencyBonus = @proficiencyBonus, armorClass = @armorClass, initiative = @initiative, speed = @speed, maxHitPoints = @maxHitPoints, currentHitPoints = @currentHitPoints, temporaryHitPoints = @temporaryHitPoints, hitDice = @hitDice, otherProficienciesAndLanguages = @otherProficienciesAndLanguages, equipment = @equipment, featuresAndTraits = @featuresAndTraits, age = @age, height = @height, weight = @weight, eyes = @eyes, skin = @skin, hair = @hair, image = @image, spellcastingAbility = @spellcastingAbility, spellSaveDC = @spellSaveDC, spellAttackBonus = @spellAttackBonus, campaign_id = @campaign_id WHERE id = @id');
        const characterToUpdate = {
            ...character,
            image: imageDataBuffer,
            level: character.level || null,
            experiencePoints: character.experiencePoints || null,
            strength: character.strength || null,
            dexterity: character.dexterity || null,
            constitution: character.constitution || null,
            intelligence: character.intelligence || null,
            wisdom: character.wisdom || null,
            charisma: character.charisma || null,
            proficiencyBonus: character.proficiencyBonus || null,
            armorClass: character.armorClass || null,
            initiative: character.initiative || null,
            speed: character.speed || null,
            maxHitPoints: character.maxHitPoints || null,
            currentHitPoints: character.currentHitPoints || null,
            temporaryHitPoints: character.temporaryHitPoints || null,
            spellSaveDC: character.spellSaveDC || null,
            spellAttackBonus: character.spellAttackBonus || null,
        };
        const info = stmt.run(characterToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Backend: Error in updateCharacter:', error.message);
        return { success: false, error: error.message };
    }
}

function deleteCharacter(characterId) {
    console.log('Backend: deleteCharacter called with ID:', characterId);
    try {
        const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
        const info = stmt.run(characterId);
        return { success: true, changes: info.changes };
    } catch (error) {
        console.error('Backend: Error in deleteCharacter:', error.message);
        return { success: false, error: error.message };
    }
}

// Function to migrate data from JSON
function migrateDataFromJsons() {
    console.log('Comprobando si es necesaria la migración de datos...');
    // Migrate Monsters
    const monsterCount = db.prepare('SELECT COUNT(*) as count FROM monsters').get().count;
    if (monsterCount === 0 && fs.existsSync(monstersFilePath)) {
        const monsters = JSON.parse(fs.readFileSync(monstersFilePath, 'utf8'));
        const insert = db.prepare('INSERT INTO monsters (id, name, vd, type, alignment, origin, size, px, armor, hp, speed, str, dex, con, int, wis, car, savingThrows, skills, senses, languages, damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, traits, actions, legendaryActions, reactions, description, image) VALUES (@id, @name, @vd, @type, @alignment, @origin, @size, @px, @armor, @hp, @speed, @str, @dex, @con, @int, @wis, @car, @savingThrows, @skills, @senses, @languages, @damageResistances, @damageImmunities, @conditionImmunabilities, @damageVulnerabilities, @traits, @actions, @legendaryActions, @reactions, @description, @image)');
        db.transaction((data) => {
            for (const monster of data) insert.run(monster);
        })(monsters);
        console.log(`${monsters.length} monstruos migrados.`);
    }

    // Migrate Maps
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

    // Migrate Tiendas
    const shopCount = db.prepare('SELECT COUNT(*) as count FROM shops').get().count;
    if (shopCount === 0 && fs.existsSync(shopsFilePath)) {
        const shops = JSON.parse(fs.readFileSync(shopsFilePath, 'utf8'));
        const insertShop = db.prepare('INSERT INTO shops (id, name) VALUES (@id, @name)');
        const insertCategory = db.prepare('INSERT INTO categories (id, shop_id, name, type) VALUES (@id, @shop_id, @name, @type)');
        const insertWeapon = db.prepare('INSERT INTO items_weapons (id, category_id, Nombre, Tipo, Precio, Daño, Peso, Propiedades, Origen) VALUES (@id, @category_id, @Nombre, @Tipo, @Precio, @Daño, @Peso, @Propiedades, @Origen)');
        const insertArmor = db.prepare('INSERT INTO items_armors (id, category_id, Nombre, Tipo, Precio, "Tipo de armadura", "Clase de Armadura (CA)", Fuerza, Sigilo, Origen) VALUES (@id, @category_id, @Nombre, @Tipo, @Precio, @Tipo_de_armadura, @Clase_de_Armadura_CA, @Fuerza, @Sigilo, @Origen)');
        
        db.transaction((data) => {
            for (const shop of data) {
                insertShop.run({ id: shop.id, name: shop.name });
                if (shop.categories) {
                    for (const category of shop.categories) {
                        const categoryType = category.name.toLowerCase().includes('armaduras') ? 'armors' : 'weapons';
                        insertCategory.run({ id: category.id, shop_id: shop.id, name: category.name, type: categoryType });
                        if (category.items) {
                            for (const item of category.items) {
                                if (category.type === 'weapons') {
                                    insertWeapon.run({
                                        id: item.id,
                                        category_id: category.id,
                                        Nombre: item.name,
                                        Tipo: item.type,
                                        Precio: item.price,
                                        Daño: item.damage,
                                        Peso: item.weight,
                                        Propiedades: item.properties,
                                        Origen: item.origin
                                    });
                                } else if (category.type === 'armors') {
                                    insertArmor.run({
                                        id: item.id,
                                        category_id: category.id,
                                        Nombre: item.name,
                                        Tipo: item.type,
                                        Precio: item.price,
                                        Tipo_de_armadura: item.type,
                                        Clase_de_Armadura_CA: item.armorClass,
                                        Fuerza: item.strength,
                                        Sigilo: item.stealth,
                                        Origen: item.origin
                                    });
                                }
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
module.exports = { db, setupDatabase, migrateDataFromJsons, getMonsters, addMonster, updateMonster, deleteMonster, deleteAllMonsters, getMaps, addMap, addMaps, updateMap, deleteMap, getShops, addShop, updateShop, deleteShop, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem, getSongs, addSong, updateSong, deleteSong, syncShops, getCampaigns, addCampaign, updateCampaign, deleteCampaign, getCharacters, addCharacter, updateCharacter, deleteCharacter };