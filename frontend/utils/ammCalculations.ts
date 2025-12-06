/**
 * AMM (Automated Market Maker) Calculation Utilities
 * For LMSR (Logarithmic Market Scoring Rule) pricing
 */

/**
 * Calculate the price of an outcome based on share quantities
 * Price = shares / (yesShares + noShares)
 */
export function calculatePrice(yesShares: bigint, noShares: bigint, outcome: 'yes' | 'no'): number {
    const total = yesShares + noShares;
    if (total === BigInt(0)) return 0.5; // Default 50/50

    const shares = outcome === 'yes' ? yesShares : noShares;
    return Number(shares) / Number(total);
}

/**
 * Calculate implied probability from price
 */
export function calculateProbability(price: number): number {
    return price * 100;
}

/**
 * Format price as percentage
 */
export function formatPrice(price: number): string {
    return `${(price * 100).toFixed(1)}%`;
}

/**
 * Format probability
 */
export function formatProbability(probability: number): string {
    return `${probability.toFixed(1)}%`;
}

/**
 * Calculate potential payout for a given stake
 */
export function calculatePayout(stake: number, price: number): number {
    if (price === 0) return 0;
    return stake / price;
}

/**
 * Calculate profit from payout
 */
export function calculateProfit(stake: number, payout: number): number {
    return payout - stake;
}

/**
 * Format USDC amount
 */
export function formatUSDC(amount: bigint, decimals: number = 6): string {
    const value = Number(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Parse USDC amount to bigint
 */
export function parseUSDC(amount: string, decimals: number = 6): bigint {
    const value = parseFloat(amount);
    if (isNaN(value)) return BigInt(0);
    return BigInt(Math.floor(value * Math.pow(10, decimals)));
}

/**
 * Calculate price impact of a trade
 */
export function calculatePriceImpact(
    currentPrice: number,
    newPrice: number
): number {
    return Math.abs(newPrice - currentPrice) / currentPrice;
}

/**
 * Format price impact as percentage
 */
export function formatPriceImpact(impact: number): string {
    return `${(impact * 100).toFixed(2)}%`;
}

/**
 * Calculate time remaining until market closes
 */
export function calculateTimeRemaining(closeTime: number): {
    days: number;
    hours: number;
    minutes: number;
    total: number;
} {
    const now = Math.floor(Date.now() / 1000);
    const remaining = closeTime - now;

    if (remaining <= 0) {
        return { days: 0, hours: 0, minutes: 0, total: 0 };
    }

    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);

    return { days, hours, minutes, total: remaining };
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(closeTime: number): string {
    const { days, hours, minutes, total } = calculateTimeRemaining(closeTime);

    if (total <= 0) return 'Closed';
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * Get market status
 */
export function getMarketStatus(closeTime: number, resolved: boolean): 'active' | 'closed' | 'resolved' {
    if (resolved) return 'resolved';
    const now = Math.floor(Date.now() / 1000);
    return now >= closeTime ? 'closed' : 'active';
}
