import hre from 'hardhat';
const { ethers } = hre;
import { getActiveMarkets, updateMarketStatus } from '../database/marketStore.js';

/**
 * Market Monitor Service
 * Monitors active markets and closes them when deadline is reached
 */
export async function monitorMarkets(signer) {
    console.log('\n👀 Monitoring active markets...\n');

    const activeMarkets = getActiveMarkets();

    if (activeMarkets.length === 0) {
        console.log('   No active markets to monitor');
        return [];
    }

    console.log(`   Found ${activeMarkets.length} active markets`);

    const results = [];
    const now = Math.floor(Date.now() / 1000);

    for (const marketData of activeMarkets) {
        try {
            const market = await ethers.getContractAt('Market', marketData.marketAddress, signer);

            // Check if market should be closed
            if (now >= marketData.closeTime) {
                const state = await market.state();

                // State: 0 = Active, 1 = Closed, 2 = Resolved
                if (state === 0) {
                    console.log(`\n   ⏰ Closing market: ${marketData.question}`);

                    try {
                        const tx = await market.closeMarket();
                        await tx.wait();

                        updateMarketStatus(marketData.marketId, 'closed');

                        console.log(`      ✅ Market closed`);
                        results.push({
                            marketId: marketData.marketId,
                            action: 'closed',
                            success: true,
                        });
                    } catch (error) {
                        console.error(`      ❌ Error closing market:`, error.message);
                        results.push({
                            marketId: marketData.marketId,
                            action: 'close_failed',
                            error: error.message,
                        });
                    }
                } else if (state === 1) {
                    // Already closed, update database
                    updateMarketStatus(marketData.marketId, 'closed');
                    results.push({
                        marketId: marketData.marketId,
                        action: 'already_closed',
                        success: true,
                    });
                }
            } else {
                // Market still active
                const timeRemaining = marketData.closeTime - now;
                const hoursRemaining = Math.floor(timeRemaining / 3600);

                if (hoursRemaining <= 24) {
                    console.log(`   ⏱️  Market closing soon: ${marketData.question} (${hoursRemaining}h remaining)`);
                }
            }

        } catch (error) {
            console.error(`   ❌ Error monitoring market ${marketData.marketId}:`, error.message);
            results.push({
                marketId: marketData.marketId,
                action: 'monitor_failed',
                error: error.message,
            });
        }
    }

    return results;
}

/**
 * Get markets ready for resolution
 * Returns markets that are closed and past their deadline
 */
export async function getMarketsReadyForResolution() {
    const activeMarkets = getActiveMarkets();
    const now = Math.floor(Date.now() / 1000);

    const readyMarkets = [];

    for (const marketData of activeMarkets) {
        // Market is past deadline and should be resolved
        if (now >= marketData.closeTime + (60 * 60)) { // 1 hour grace period
            readyMarkets.push(marketData);
        }
    }

    return readyMarkets;
}

/**
 * Update market prices from contract
 */
export async function updateMarketPricesFromContract(marketData, signer) {
    try {
        const market = await ethers.getContractAt('Market', marketData.marketAddress, signer);

        const [yesShares, noShares, yesPrice, noPrice] = await Promise.all([
            market.yesShares(),
            market.noShares(),
            market.getPrice(0), // YES price
            market.getPrice(1), // NO price
        ]);

        return {
            yesShares: yesShares.toString(),
            noShares: noShares.toString(),
            yesPrice: Number(yesPrice) / 1e18,
            noPrice: Number(noPrice) / 1e18,
        };
    } catch (error) {
        console.error(`Error updating prices for market ${marketData.marketId}:`, error.message);
        return null;
    }
}
