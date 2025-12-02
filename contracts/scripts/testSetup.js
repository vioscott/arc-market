// contracts/scripts/testSetup.js
import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Deployer: ${deployer.address}\n`);

    const marketFactoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS;
    const outcomeTokenAddress = process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS;
    const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;

    console.log(`📋 Contract Addresses:`);
    console.log(`   MarketFactory: ${marketFactoryAddress}`);
    console.log(`   OutcomeToken:  ${outcomeTokenAddress}`);
    console.log(`   Oracle:        ${oracleAddress}\n`);

    // Get contracts
    const marketFactory = await ethers.getContractAt("MarketFactory", marketFactoryAddress);
    const outcomeToken = await ethers.getContractAt("OutcomeToken", outcomeTokenAddress);

    // Check OutcomeToken owner
    const outcomeTokenOwner = await outcomeToken.owner();
    console.log(`👤 OutcomeToken owner: ${outcomeTokenOwner}`);
    console.log(`   Is MarketFactory? ${outcomeTokenOwner.toLowerCase() === marketFactoryAddress.toLowerCase() ? '✅ YES' : '❌ NO'}\n`);

    // Check MarketFactory owner
    const marketFactoryOwner = await marketFactory.owner();
    console.log(`👤 MarketFactory owner: ${marketFactoryOwner}`);
    console.log(`   Is deployer? ${marketFactoryOwner.toLowerCase() === deployer.address.toLowerCase() ? '✅ YES' : '❌ NO'}\n`);

    // Check market count
    const marketCount = await marketFactory.getMarketCount();
    console.log(`📊 Total markets created: ${marketCount}\n`);

    // Check minLiquidityParameter
    const minLiquidity = await marketFactory.minLiquidityParameter();
    console.log(`💧 Min liquidity parameter: ${ethers.formatEther(minLiquidity)} ETH`);
    console.log(`   Our parameter (100 ETH): ${ethers.formatEther(ethers.parseEther("100"))} ETH`);
    console.log(`   Is sufficient? ${ethers.parseEther("100") >= minLiquidity ? '✅ YES' : '❌ NO'}\n`);

    console.log(`✅ Setup verification complete!`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
