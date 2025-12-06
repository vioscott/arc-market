// Database schema definitions
export const MarketSchema = {
    marketId: 'number',
    marketAddress: 'string',
    question: 'string',
    category: 'string',
    sourceUrl: 'string',
    closeTime: 'number', // Unix timestamp
    createdAt: 'number', // Unix timestamp
    liquidityParameter: 'string',

    // Event data
    eventId: 'string',
    eventType: 'string',
    eventData: 'object', // Original event data from API

    // Status
    status: 'string', // 'active', 'closed', 'resolved'
    winningOutcome: 'number|null', // 0 = YES, 1 = NO, 2 = Invalid, null = not resolved
    resolvedAt: 'number|null', // Unix timestamp

    // Trading data (cached from contract)
    yesShares: 'string',
    noShares: 'string',
    yesPrice: 'number',
    noPrice: 'number',
    volume: 'string',

    // Metadata
    creator: 'string', // Address
    tags: 'array',
};

export const EventSchema = {
    eventId: 'string',
    eventType: 'string', // 'crypto', 'sports', 'news', etc.
    source: 'string', // API source
    question: 'string',
    category: 'string',
    deadline: 'number', // Unix timestamp
    sourceUrl: 'string',

    // Validation
    validated: 'boolean',
    validationErrors: 'array',

    // Outcome data (for resolution)
    outcomeData: 'object',
    outcomeSource: 'string',

    // Timestamps
    fetchedAt: 'number',
    createdAt: 'number',
};

export const ResolutionSchema = {
    marketId: 'number',
    marketAddress: 'string',
    outcome: 'number', // 0 = YES, 1 = NO, 2 = Invalid
    outcomeData: 'object', // Data used to determine outcome
    source: 'string', // API source for outcome
    proposedAt: 'number',
    finalizedAt: 'number|null',
    proposer: 'string', // Address
};
