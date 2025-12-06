import hre from 'hardhat';
const { ethers } = hre;
import { getCryptoPrice } from '../apis/crypto.js';
import { getSportsResult } from '../apis/sports.js';
import { updateMarketStatus, saveResolution } from '../database/marketStore.js';

/**
 * Oracle Resolver Service
 * Resolves markets based on real-world outcomes
 */
export async function resolveMarket(marketData, signer) {
    try {
        console.log(`\n🔮 Resolving market: ${marketData.question}`);

        // Fetch outcome from appropriate API
        const outcomeData = await fetchOutcome(marketData);

        if (outcomeData === null) {
            console.log(`   ⚠️  Could not determine outcome, skipping`);
            return {
                success: false,
                reason: 'outcome_unavailable',
            };
        }

        console.log(`   📊 Outcome: ${outcomeData.outcome === 0 ? 'YES' : outcomeData.outcome === 1 ? 'NO' : 'INVALID'}`);
        console.log(`   📍 Source: ${outcomeData.source}`);

        // Get Oracle contract
        const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;
        if (!oracleAddress) {
            throw new Error('NEXT_PUBLIC_ORACLE_ADDRESS not set');
        }

        const oracle = await ethers.getContractAt('Oracle', oracleAddress, signer);

        // Check if already resolved
        const resolution = await oracle.getResolution(marketData.marketAddress);
        if (resolution.state !== 0) { // 0 = None
            console.log(`   ℹ️  Market already has a resolution proposal`);
            return {
                success: false,
                reason: 'already_proposed',
            };
        }

        // Propose resolution
        console.log(`   📝 Proposing resolution...`);
        const tx = await oracle.proposeResolution(
            marketData.marketAddress,
            outcomeData.outcome
        );
        await tx.wait();
        console.log(`   ✅ Resolution proposed`);

        // For testnet with single resolver, finalize immediately
        // In production, wait for multi-sig confirmation
        const requiredConfirmations = await oracle.requiredConfirmations();

        if (requiredConfirmations === BigInt(1)) {
            console.log(`   ⏭️  Single resolver mode, finalizing...`);

            // Wait for time-lock (if any)
            const timeLockDuration = await oracle.timeLockDuration();
            if (timeLockDuration > BigInt(0)) {
                console.log(`   ⏰ Waiting for time-lock (${timeLockDuration}s)...`);
                await new Promise(resolve => setTimeout(resolve, Number(timeLockDuration) * 1000 + 1000));
            }

            const finalizeTx = await oracle.finalizeResolution(marketData.marketAddress);
            await finalizeTx.wait();
            console.log(`   ✅ Resolution finalized`);
        }

        // Update database
        updateMarketStatus(marketData.marketId, 'resolved', {
            winningOutcome: outcomeData.outcome,
            resolvedAt: Math.floor(Date.now() / 1000),
        });

        saveResolution({
            marketId: marketData.marketId,
            marketAddress: marketData.marketAddress,
            outcome: outcomeData.outcome,
            outcomeData: outcomeData,
            source: outcomeData.source,
            proposer: signer.address,
        });

        console.log(`   💾 Saved to database\n`);

        return {
            success: true,
            outcome: outcomeData.outcome,
        };

    } catch (error) {
        console.error(`   ❌ Error resolving market:`, error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Fetch outcome from appropriate API based on event type
 */
async function fetchOutcome(marketData) {
    const eventType = marketData.eventType;
    const eventData = marketData.eventData;

    try {
        switch (eventType) {
            case 'crypto':
                return await resolveCryptoEvent(marketData);

            case 'sports':
                return await resolveSportsEvent(marketData);

            case 'news':
            case 'gdelt':
                // For news/GDELT events, manual resolution may be needed
                console.log(`   ⚠️  ${eventType} events require manual resolution`);
                return null;

            default:
                console.log(`   ⚠️  Unknown event type: ${eventType}`);
                return null;
        }
    } catch (error) {
        console.error(`   ❌ Error fetching outcome:`, error.message);
        return null;
    }
}

/**
 * Resolve crypto price prediction event
 */
async function resolveCryptoEvent(marketData) {
    const { coinId, targetPrice, threshold } = marketData.eventData;

    const currentPrice = await getCryptoPrice(coinId);

    if (currentPrice === null) {
        return null;
    }

    // Determine if prediction was correct
    let outcome;
    if (threshold > 1) {
        // Price should be higher
        outcome = currentPrice >= targetPrice ? 0 : 1; // 0 = YES, 1 = NO
    } else {
        // Price should be lower
        outcome = currentPrice <= targetPrice ? 0 : 1;
    }

    return {
        outcome,
        source: 'coingecko',
        data: {
            currentPrice,
            targetPrice,
            threshold,
        },
    };
}

/**
 * Resolve sports event
 */
async function resolveSportsEvent(marketData) {
    const result = await getSportsResult(marketData.eventId, marketData.eventData);

    if (!result) {
        return null;
    }

    return {
        outcome: result.outcome,
        source: result.source,
        data: {
            winner: result.winner,
        },
    };
}

/**
 * Resolve multiple markets
 */
export async function resolveMarkets(markets, signer) {
    console.log(`\n🔮 Resolving ${markets.length} markets...\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const marketData of markets) {
        const result = await resolveMarket(marketData, signer);
        results.push(result);

        if (result.success) {
            successCount++;
        } else {
            failCount++;
        }

        // Small delay between resolutions
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n📊 Resolution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    return results;
}
