import axios from 'axios';
import { CATEGORIES } from '../config/apis.js';

/**
 * Fetch events from GDELT (Global Database of Events, Language, and Tone)
 * Free API, no key required
 */
export async function fetchGDELTEvents() {
    try {
        // GDELT GKG (Global Knowledge Graph) API
        // Fetch recent events with high tone (positive/negative sentiment)

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const dateStr = formatGDELTDate(yesterday);

        // Note: GDELT API is complex - this is a simplified example
        // For production, you may want to use their documentation more thoroughly

        console.log('⚠️  GDELT integration is complex - using simplified mock data');
        console.log('   For production, implement full GDELT API integration');

        // Return mock events for now
        return generateMockGDELTEvents();

    } catch (error) {
        console.error('❌ Error fetching GDELT events:', error.message);
        return [];
    }
}

/**
 * Generate mock GDELT-style events
 * Replace with real GDELT API calls in production
 */
function generateMockGDELTEvents() {
    const now = Math.floor(Date.now() / 1000);
    const events = [];

    const mockEvents = [
        {
            question: 'Will the UN Climate Summit reach a new agreement by end of month?',
            category: CATEGORIES.POLITICS,
            days: 30,
        },
        {
            question: 'Will global tech stocks rise by 5% this week?',
            category: CATEGORIES.ECONOMICS,
            days: 7,
        },
        {
            question: 'Will a major AI breakthrough be announced this month?',
            category: CATEGORIES.TECHNOLOGY,
            days: 30,
        },
    ];

    for (const mock of mockEvents) {
        const deadline = now + (mock.days * 24 * 60 * 60);

        events.push({
            eventId: `gdelt-mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            eventType: 'gdelt',
            source: 'gdelt-mock',
            question: mock.question,
            category: mock.category,
            closeTime: deadline,
            sourceUrl: 'https://www.gdeltproject.org',
            metadata: {
                mock: true,
            },
        });
    }

    console.log(`✅ Generated ${events.length} mock GDELT events`);
    return events;
}

/**
 * Format date for GDELT API
 */
function formatGDELTDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
