// contracts/scripts/createTestMarket.js
import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using deployer ${deployer.address}\n`);

    const marketFactory = await ethers.getContractAt(
        "MarketFactory",
        process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS
    );

    const question = "Test Market: Will this work?";
    const sourceUrl = "https://example.com";
    const closeTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
    const liquidityParameter = ethers.parseEther("100");

    console.log(`📝 Creating test market...`);
    console.log(`   Question: ${question}`);
    console.log(`   Close time: ${new Date(closeTime * 1000).toLocaleString()}`);
    console.log(`   Liquidity: ${ethers.formatEther(liquidityParameter)} ETH\n`);

    try {
        const tx = await marketFactory.createMarket(
            question,
            sourceUrl,
            closeTime,
            liquidityParameter,
            { value: 0 } // No creation fee
        );

        console.log(`⏳ Transaction sent: ${tx.hash}`);
        console.log(`   Waiting for confirmation...\n`);

        const receipt = await tx.wait();

        console.log(`✅ Market created successfully!`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

        // Find the MarketCreated event
        const event = receipt.logs.find(log => {
            try {
                const parsed = marketFactory.interface.parseLog(log);
                return parsed.name === 'MarketCreated';
            } catch {
                return false;
            }
        });

        if (event) {
            const parsed = marketFactory.interface.parseLog(event);
            console.log(`\n📊 Market Details:`);
            console.log(`   Market ID: ${parsed.args.marketId}`);
            console.log(`   Market Address: ${parsed.args.marketAddress}`);
        }

    } catch (error) {
        console.error(`❌ Error creating market:`);
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
