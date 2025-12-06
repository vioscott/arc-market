import axios from 'axios';
import { API_CONFIG, CATEGORIES } from '../config/apis.js';

/**
 * Fetch crypto price prediction events
 * Uses CoinGecko API (free, no key required)
 */
export async function fetchCryptoEvents() {
    if (!API_CONFIG.coingecko.enabled) {
        console.log('⚠️  CoinGecko API disabled');
        return [];
    }

    try {
        // Fetch top cryptocurrencies
        const response = await axios.get(
            `${API_CONFIG.coingecko.baseUrl}/coins/markets`,
            {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                },
            }
        );

        const coins = response.data;
        const events = [];
        const now = Math.floor(Date.now() / 1000);

        // Create price prediction markets for top coins
        for (const coin of coins.slice(0, 5)) { // Top 5 coins
            const currentPrice = coin.current_price;

            // Generate prediction thresholds
            const thresholds = [
                { multiplier: 1.1, label: '10% higher' },
                { multiplier: 1.2, label: '20% higher' },
                { multiplier: 0.9, label: '10% lower' },
            ];

            for (const threshold of thresholds) {
                const targetPrice = Math.round(currentPrice * threshold.multiplier);
                const deadline = now + (7 * 24 * 60 * 60); // 1 week from now

                events.push({
                    eventId: `crypto-${coin.id}-${targetPrice}-${deadline}`,
                    eventType: 'crypto',
                    source: 'coingecko',
                    question: `Will ${coin.name} (${coin.symbol.toUpperCase()}) be ${threshold.label} than $${currentPrice.toLocaleString()} by ${new Date(deadline * 1000).toLocaleDateString()}?`,
                    category: CATEGORIES.CRYPTO,
                    closeTime: deadline,
                    sourceUrl: `https://www.coingecko.com/en/coins/${coin.id}`,
                    metadata: {
                        coinId: coin.id,
                        symbol: coin.symbol,
                        currentPrice: currentPrice,
                        targetPrice: targetPrice,
                        threshold: threshold.multiplier,
                    },
                });
            }
        }

        console.log(`✅ Fetched ${events.length} crypto events from CoinGecko`);
        return events;

    } catch (error) {
        console.error('❌ Error fetching crypto events:', error.message);
        return [];
    }
}

/**
 * Get crypto price for resolution
 */
export async function getCryptoPrice(coinId) {
    try {
        const response = await axios.get(
            `${API_CONFIG.coingecko.baseUrl}/simple/price`,
            {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                },
            }
        );

        return response.data[coinId]?.usd || null;
    } catch (error) {
        console.error(`❌ Error fetching price for ${coinId}:`, error.message);
        return null;
    }
}
