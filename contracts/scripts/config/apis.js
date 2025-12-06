// Configuration for API integrations
export const API_CONFIG = {
    // GDELT - Free, no API key needed
    gdelt: {
        baseUrl: 'https://api.gdeltproject.org/api/v2',
        enabled: true,
        rateLimit: 100, // requests per minute
    },

    // CoinGecko - Free tier
    coingecko: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        enabled: true,
        rateLimit: 50,
    },

    // News API - Requires free API key
    newsApi: {
        baseUrl: 'https://newsapi.org/v2',
        apiKey: process.env.NEWS_API_KEY || '',
        enabled: !!process.env.NEWS_API_KEY,
        rateLimit: 100,
    },

    // API-Sports - Requires free API key
    sportsApi: {
        baseUrl: 'https://v3.football.api-sports.io',
        apiKey: process.env.SPORTS_API_KEY || '',
        enabled: !!process.env.SPORTS_API_KEY,
        rateLimit: 100,
    },

    // Retry configuration
    retry: {
        maxRetries: 3,
        retryDelay: 1000, // ms
        backoffMultiplier: 2,
    },
};

// Categories for markets
export const CATEGORIES = {
    CRYPTO: 'Crypto',
    SPORTS: 'Sports',
    POLITICS: 'Politics',
    ECONOMICS: 'Economics',
    TECHNOLOGY: 'Technology',
    ENTERTAINMENT: 'Entertainment',
    WEATHER: 'Weather',
    SCIENCE: 'Science',
};
