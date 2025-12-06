// Configuration for market creation
export const MARKET_CONFIG = {
    // Default liquidity parameter (b) for LMSR
    // Higher = less price movement per trade
    defaultLiquidityParameter: '100', // 100 USDC worth

    // Market duration defaults (in seconds)
    durations: {
        short: 24 * 60 * 60,        // 1 day
        medium: 7 * 24 * 60 * 60,   // 1 week
        long: 30 * 24 * 60 * 60,    // 1 month
    },

    // Minimum time before market closes
    minTimeToClose: 60 * 60, // 1 hour

    // Maximum time before market closes
    maxTimeToClose: 365 * 24 * 60 * 60, // 1 year

    // Validation rules
    validation: {
        minQuestionLength: 10,
        maxQuestionLength: 200,
        requiredFields: ['question', 'category', 'closeTime', 'sourceUrl'],

        // Keywords that indicate ambiguous questions
        ambiguousKeywords: [
            'maybe',
            'possibly',
            'might',
            'could be',
            'unclear',
        ],
    },

    // Category-specific settings
    categorySettings: {
        crypto: {
            defaultDuration: 24 * 60 * 60, // 1 day
            liquidityParameter: '50',
        },
        sports: {
            defaultDuration: 7 * 24 * 60 * 60, // 1 week
            liquidityParameter: '100',
        },
        politics: {
            defaultDuration: 30 * 24 * 60 * 60, // 1 month
            liquidityParameter: '200',
        },
        default: {
            defaultDuration: 7 * 24 * 60 * 60,
            liquidityParameter: '100',
        },
    },

    // Market creation limits
    limits: {
        maxMarketsPerHour: 10,
        maxMarketsPerDay: 50,
    },
};
