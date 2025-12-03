// contracts/scripts/checkAuth.js
import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using deployer ${deployer.address}`);

    const outcomeTokenAddress = process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS;
    const marketFactoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS;

    console.log(`📝 OutcomeToken: ${outcomeTokenAddress}`);
    console.log(`📝 MarketFactory: ${marketFactoryAddress}`);

    const outcomeToken = await ethers.getContractAt("OutcomeToken", outcomeTokenAddress);

    // Check owner
    const owner = await outcomeToken.owner();
    console.log(`👤 OutcomeToken owner: ${owner}`);
    console.log(`   Matches MarketFactory? ${owner.toLowerCase() === marketFactoryAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);

    // Check marketFactory variable
    try {
        const storedFactory = await outcomeToken.marketFactory();
        console.log(`🏭 Stored marketFactory: ${storedFactory}`);
        console.log(`   Matches MarketFactory? ${storedFactory.toLowerCase() === marketFactoryAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
    } catch (e) {
        console.log(`❌ Could not read marketFactory variable. Contract might not be updated.`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
