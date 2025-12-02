// contracts/scripts/authorizeMarketFactory.js
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

    // Check current owner
    const owner = await outcomeToken.owner();
    console.log(`👤 Current OutcomeToken owner: ${owner}`);

    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
        console.error(`❌ Error: You are not the owner of OutcomeToken`);
        console.error(`   Owner: ${owner}`);
        console.error(`   Your address: ${deployer.address}`);
        return;
    }

    // Transfer ownership to MarketFactory
    console.log(`🔄 Transferring OutcomeToken ownership to MarketFactory...`);
    const tx = await outcomeToken.transferOwnership(marketFactoryAddress);
    await tx.wait();

    console.log(`✅ Ownership transferred successfully!`);
    console.log(`   MarketFactory can now authorize markets`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
