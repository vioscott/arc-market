import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.resolve(__dirname, 'markets.json');

// Initialize database file if it doesn't exist
function initDB() {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            markets: {},
            events: {},
            resolutions: {},
            metadata: {
                version: '1.0.0',
                createdAt: Date.now(),
                lastUpdated: Date.now(),
            },
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Load database
function loadDB() {
    initDB();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Save database
function saveDB(data) {
    data.metadata.lastUpdated = Date.now();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ===== MARKET OPERATIONS =====

export function saveMarket(marketData) {
    const db = loadDB();
    db.markets[marketData.marketId] = {
        ...marketData,
        createdAt: marketData.createdAt || Date.now(),
    };
    saveDB(db);
    return marketData;
}

export function getMarket(marketId) {
    const db = loadDB();
    return db.markets[marketId] || null;
}

export function getAllMarkets() {
    const db = loadDB();
    return Object.values(db.markets);
}

export function getActiveMarkets() {
    const db = loadDB();
    return Object.values(db.markets).filter(m => m.status === 'active');
}

export function getMarketsByCategory(category) {
    const db = loadDB();
    return Object.values(db.markets).filter(
        m => m.category.toLowerCase() === category.toLowerCase()
    );
}

export function updateMarketStatus(marketId, status, additionalData = {}) {
    const db = loadDB();
    if (db.markets[marketId]) {
        db.markets[marketId].status = status;
        Object.assign(db.markets[marketId], additionalData);
        saveDB(db);
        return db.markets[marketId];
    }
    return null;
}

export function updateMarketPrices(marketId, yesShares, noShares, yesPrice, noPrice) {
    const db = loadDB();
    if (db.markets[marketId]) {
        db.markets[marketId].yesShares = yesShares;
        db.markets[marketId].noShares = noShares;
        db.markets[marketId].yesPrice = yesPrice;
        db.markets[marketId].noPrice = noPrice;
        saveDB(db);
    }
}

// ===== EVENT OPERATIONS =====

export function saveEvent(eventData) {
    const db = loadDB();
    db.events[eventData.eventId] = {
        ...eventData,
        fetchedAt: eventData.fetchedAt || Date.now(),
    };
    saveDB(db);
    return eventData;
}

export function getEvent(eventId) {
    const db = loadDB();
    return db.events[eventId] || null;
}

export function eventExists(eventId) {
    const db = loadDB();
    return !!db.events[eventId];
}

// ===== RESOLUTION OPERATIONS =====

export function saveResolution(resolutionData) {
    const db = loadDB();
    db.resolutions[resolutionData.marketId] = {
        ...resolutionData,
        proposedAt: resolutionData.proposedAt || Date.now(),
    };
    saveDB(db);
    return resolutionData;
}

export function getResolution(marketId) {
    const db = loadDB();
    return db.resolutions[marketId] || null;
}

// ===== UTILITY FUNCTIONS =====

export function getStats() {
    const db = loadDB();
    const markets = Object.values(db.markets);

    return {
        totalMarkets: markets.length,
        activeMarkets: markets.filter(m => m.status === 'active').length,
        closedMarkets: markets.filter(m => m.status === 'closed').length,
        resolvedMarkets: markets.filter(m => m.status === 'resolved').length,
        totalEvents: Object.keys(db.events).length,
        totalResolutions: Object.keys(db.resolutions).length,
    };
}

export function clearDatabase() {
    const initialData = {
        markets: {},
        events: {},
        resolutions: {},
        metadata: {
            version: '1.0.0',
            createdAt: Date.now(),
            lastUpdated: Date.now(),
        },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

// Initialize on import
initDB();
