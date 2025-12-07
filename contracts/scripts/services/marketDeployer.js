import hre from 'hardhat';
const { ethers } = hre;
import { MARKET_CONFIG } from '../config/markets.js';
import { saveMarket, saveEvent } from '../database/marketStore.js';

/**
 * Market Deployer Service
 * Deploys markets to the blockchain via MarketFactory
 */
export async function deployMarket(event, signer) {
    try {
        console.log(`\n🚀 Deploying market: ${event.question}`);

        // Get MarketFactory contract
        const factoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS;
        if (!factoryAddress) {
            throw new Error('NEXT_PUBLIC_MARKET_FACTORY_ADDRESS not set in environment');
        }

        const factory = await ethers.getContractAt('MarketFactory', factoryAddress, signer);

        // Get category-specific settings
        const categoryKey = event.category.toLowerCase();
        const categorySettings = MARKET_CONFIG.categorySettings[categoryKey]
            || MARKET_CONFIG.categorySettings.default;

        // Prepare market parameters
        const question = event.question;
        const sourceUrl = event.sourceUrl;
        const closeTime = event.closeTime; // Use closeTime instead of deadline
        const liquidityParameter = ethers.parseEther(categorySettings.liquidityParameter);

        // Get market creation fee (if any)
        const marketCreationFee = await factory.marketCreationFee();

        console.log(`   Question: ${question}`);
        console.log(`   Close Time: ${new Date(closeTime * 1000).toLocaleString()}`);
        console.log(`   Liquidity: ${categorySettings.liquidityParameter} USDC`);

        // Create market
        const tx = await factory.createMarket(
            question,
            sourceUrl,
            closeTime,
            liquidityParameter,
            { value: marketCreationFee }
        );

        console.log(`   ⏳ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   ✅ Transaction confirmed`);

        // Parse MarketCreated event
        let marketId, marketAddress;
        for (const log of receipt.logs) {
            try {
                const parsed = factory.interface.parseLog(log);
                if (parsed && parsed.name === 'MarketCreated') {
                    marketId = Number(parsed.args.marketId);
                    marketAddress = parsed.args.marketAddress;
                    break;
                }
            } catch (e) {
                // Not a factory event, continue
            }
        }

        if (!marketAddress) {
            throw new Error('MarketCreated event not found in transaction receipt');
        }

        console.log(`   📍 Market ID: ${marketId}`);
        console.log(`   📍 Market Address: ${marketAddress}`);

        // Save to database
        const marketData = {
            marketId,
            marketAddress,
            question,
            category: event.category,
            sourceUrl,
            closeTime,
            createdAt: Math.floor(Date.now() / 1000),
            liquidityParameter: categorySettings.liquidityParameter,

            // Event data
            eventId: event.eventId,
            eventType: event.eventType,
            eventData: event.metadata || {},

            // Status
            status: 'active',
            winningOutcome: null,
            resolvedAt: null,

            // Trading data (initial)
            yesShares: '0',
            noShares: '0',
            yesPrice: 0.5,
            noPrice: 0.5,
            volume: '0',

            // Metadata
            creator: signer.address,
            tags: [event.category, event.eventType],
        };

        saveMarket(marketData);
        saveEvent(event);

        console.log(`   💾 Saved to database\n`);

        return {
            success: true,
            marketId,
            marketAddress,
            marketData,
        };

    } catch (error) {
        console.error(`   ❌ Error deploying market:`, error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Deploy multiple markets
 */
export async function deployMarkets(events, signer) {
    console.log(`\n🚀 Deploying ${events.length} markets...\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
        const result = await deployMarket(event, signer);
        results.push(result);

        if (result.success) {
            successCount++;
        } else {
            failCount++;
        }

        // Small delay between deployments to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 Deployment Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    return results;
}

/**
 * Get deployed market details
 */
export async function getMarketDetails(marketAddress, signer) {
    try {
        const market = await ethers.getContractAt('Market', marketAddress, signer);

        const [
            marketId,
            question,
            sourceUrl,
            closeTime,
            state,
            yesShares,
            noShares,
        ] = await Promise.all([
            market.marketId(),
            market.question(),
            market.sourceUrl(),
            market.closeTime(),
            market.state(),
            market.yesShares(),
            market.noShares(),
        ]);

        return {
            marketId: Number(marketId),
            question,
            sourceUrl,
            closeTime: Number(closeTime),
            state: Number(state),
            yesShares: yesShares.toString(),
            noShares: noShares.toString(),
        };
    } catch (error) {
        console.error(`Error fetching market details:`, error.message);
        return null;
    }
}
