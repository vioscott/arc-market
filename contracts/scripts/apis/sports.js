import axios from 'axios';
import { API_CONFIG, CATEGORIES } from '../config/apis.js';

/**
 * Fetch sports events (mock data for now - can integrate real API later)
 * For production, use API-Sports.io with API key
 */
export async function fetchSportsEvents() {
    // Mock NBA games for demonstration
    // In production, replace with actual API calls

    const teams = [
        'Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks',
        'Suns', 'Nuggets', '76ers', 'Mavericks', 'Clippers'
    ];

    const events = [];
    const now = Math.floor(Date.now() / 1000);

    // Generate 3 upcoming games
    for (let i = 0; i < 3; i++) {
        const homeTeam = teams[Math.floor(Math.random() * teams.length)];
        let awayTeam = teams[Math.floor(Math.random() * teams.length)];

        // Ensure different teams
        while (awayTeam === homeTeam) {
            awayTeam = teams[Math.floor(Math.random() * teams.length)];
        }

        // Game in 2-5 days
        const daysUntilGame = 2 + i;
        const gameTime = now + (daysUntilGame * 24 * 60 * 60);
        const gameDate = new Date(gameTime * 1000).toLocaleDateString();

        events.push({
            eventId: `nba-${homeTeam}-${awayTeam}-${gameTime}`,
            eventType: 'sports',
            source: 'mock-nba',
            question: `Will ${homeTeam} beat ${awayTeam} on ${gameDate}?`,
            category: CATEGORIES.SPORTS,
            closeTime: gameTime,
            sourceUrl: 'https://www.nba.com',
            metadata: {
                sport: 'basketball',
                league: 'NBA',
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                gameTime: gameTime,
            },
        });
    }

    console.log(`✅ Generated ${events.length} mock sports events`);
    return events;
}

/**
 * Fetch sports result for resolution (mock)
 * In production, fetch from actual sports API
 */
export async function getSportsResult(eventId, metadata) {
    // Mock resolution - randomly determine winner
    // In production, fetch actual game results from API

    console.log(`⚠️  Using mock sports result for ${eventId}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Randomly determine outcome (50/50)
    const homeTeamWon = Math.random() > 0.5;

    return {
        outcome: homeTeamWon ? 0 : 1, // 0 = YES (home team won), 1 = NO
        winner: homeTeamWon ? metadata.homeTeam : metadata.awayTeam,
        source: 'mock',
    };
}

/**
 * Real API-Sports integration (requires API key)
 * Uncomment and configure when you have an API key
 */
/*
export async function fetchSportsEventsReal() {
    if (!API_CONFIG.sportsApi.enabled) {
        console.log('⚠️  Sports API disabled (no API key)');
        return [];
    }

    try {
        const response = await axios.get(
            `${API_CONFIG.sportsApi.baseUrl}/fixtures`,
            {
                headers: {
                    'x-rapidapi-key': API_CONFIG.sportsApi.apiKey,
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                },
                params: {
                    league: 39, // Premier League
                    season: 2024,
                    next: 10, // Next 10 fixtures
                },
            }
        );

        const fixtures = response.data.response;
        const events = [];

        for (const fixture of fixtures) {
            const gameTime = Math.floor(new Date(fixture.fixture.date).getTime() / 1000);
            
            events.push({
                eventId: `football-${fixture.fixture.id}`,
                eventType: 'sports',
                source: 'api-sports',
                question: `Will ${fixture.teams.home.name} beat ${fixture.teams.away.name}?`,
                category: CATEGORIES.SPORTS,
                deadline: gameTime,
                sourceUrl: `https://www.api-sports.io`,
                metadata: {
                    sport: 'football',
                    league: fixture.league.name,
                    homeTeam: fixture.teams.home.name,
                    awayTeam: fixture.teams.away.name,
                    fixtureId: fixture.fixture.id,
                },
            });
        }

        return events;
    } catch (error) {
        console.error('❌ Error fetching sports events:', error.message);
        return [];
    }
}
*/
