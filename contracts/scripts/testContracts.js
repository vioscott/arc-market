// Test script to verify contract deployment and configuration
import hre from 'hardhat';
const { ethers } = hre;

async function main() {
    console.log('🔍 Testing Contract Configuration\n');

    const [deployer] = await ethers.getSigners();
    console.log(`Account: ${deployer.address}\n`);

    // Test MarketFactory
    const factoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS;
    console.log(`MarketFactory Address: ${factoryAddress}`);

    try {
        const factory = await ethers.getContractAt('MarketFactory', factoryAddress);

        const marketCount = await factory.getMarketCount();
        const oracle = await factory.oracle();
        const usdc = await factory.usdc();
        const outcomeToken = await factory.outcomeToken();

        console.log(`✅ MarketFactory is deployed`);
        console.log(`   Markets: ${marketCount}`);
        console.log(`   Oracle: ${oracle}`);
        console.log(`   USDC: ${usdc}`);
        console.log(`   OutcomeToken: ${outcomeToken}\n`);

        // Test Oracle
        const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;
        console.log(`Oracle Address: ${oracleAddress}`);

        const oracleContract = await ethers.getContractAt('Oracle', oracleAddress);
        const requiredConfirmations = await oracleContract.requiredConfirmations();

        console.log(`✅ Oracle is deployed`);
        console.log(`   Required Confirmations: ${requiredConfirmations}\n`);

        // Test if we can create a market
        console.log('🧪 Testing market creation...');

        const question = "Test market - Will this work?";
        const sourceUrl = "https://example.com";
        const closeTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
        const liquidityParameter = ethers.parseEther("100");

        const marketCreationFee = await factory.marketCreationFee();
        console.log(`   Market Creation Fee: ${ethers.formatEther(marketCreationFee)} ETH`);

        console.log(`   Creating test market...`);
        const tx = await factory.createMarket(
            question,
            sourceUrl,
            closeTime,
            liquidityParameter,
            { value: marketCreationFee }
        );

        const receipt = await tx.wait();
        console.log(`   ✅ Market created! TX: ${tx.hash}\n`);

        // Parse event
        for (const log of receipt.logs) {
            try {
                const parsed = factory.interface.parseLog(log);
                if (parsed && parsed.name === 'MarketCreated') {
                    console.log(`   Market ID: ${parsed.args.marketId}`);
                    console.log(`   Market Address: ${parsed.args.marketAddress}`);
                }
            } catch (e) { }
        }

        console.log('\n✅ All tests passed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
