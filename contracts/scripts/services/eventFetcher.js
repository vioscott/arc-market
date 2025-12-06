import { fetchCryptoEvents } from '../apis/crypto.js';
import { fetchSportsEvents } from '../apis/sports.js';
import { fetchNewsEvents } from '../apis/news.js';
import { fetchGDELTEvents } from '../apis/gdelt.js';

/**
 * Event Fetcher Service
 * Aggregates events from multiple API sources
 */
export async function fetchAllEvents() {
    console.log('📡 Fetching events from all sources...\n');

    const results = await Promise.allSettled([
        fetchCryptoEvents(),
        fetchSportsEvents(),
        fetchNewsEvents(),
        fetchGDELTEvents(),
    ]);

    const allEvents = [];

    for (const result of results) {
        if (result.status === 'fulfilled') {
            allEvents.push(...result.value);
        } else {
            console.error('❌ Error fetching from source:', result.reason);
        }
    }

    console.log(`\n📊 Total events fetched: ${allEvents.length}`);
    return allEvents;
}

/**
 * Fetch events from specific source
 */
export async function fetchEventsBySource(source) {
    switch (source) {
        case 'crypto':
            return await fetchCryptoEvents();
        case 'sports':
            return await fetchSportsEvents();
        case 'news':
            return await fetchNewsEvents();
        case 'gdelt':
            return await fetchGDELTEvents();
        default:
            throw new Error(`Unknown source: ${source}`);
    }
}

/**
 * Fetch events by category
 */
export async function fetchEventsByCategory(category) {
    const allEvents = await fetchAllEvents();
    return allEvents.filter(event =>
        event.category.toLowerCase() === category.toLowerCase()
    );
}
