// Deploy to local Hardhat network with mock USDC
import hre from "hardhat";
const { ethers } = hre;

async function main() {
    console.log("🚀 Deploying to LOCAL Hardhat Network...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy Mock USDC for local testing
    console.log("\n📝 Deploying Mock USDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockERC20");
    const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("✅ Mock USDC deployed to:", usdcAddress);

    // Mint some USDC to deployer for testing
    const mintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
    await usdc.mint(deployer.address, mintAmount);
    console.log("✅ Minted 1,000,000 USDC to deployer");

    // Configuration
    const MIN_LIQUIDITY_PARAMETER = hre.ethers.parseEther("100");
    const REQUIRED_CONFIRMATIONS = 1;
    const TIME_LOCK_DURATION = 0; // No time-lock for local testing
    const DISPUTE_PERIOD = 0; // No dispute period for local testing

    // Deploy OutcomeToken
    console.log("\n📝 Deploying OutcomeToken...");
    const OutcomeToken = await hre.ethers.getContractFactory("OutcomeToken");
    const outcomeToken = await OutcomeToken.deploy();
    await outcomeToken.waitForDeployment();
    const outcomeTokenAddress = await outcomeToken.getAddress();
    console.log("✅ OutcomeToken deployed to:", outcomeTokenAddress);

    // Deploy Oracle
    console.log("\n📝 Deploying Oracle...");
    const resolvers = [deployer.address];
    const Oracle = await hre.ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy(
        resolvers,
        REQUIRED_CONFIRMATIONS,
        TIME_LOCK_DURATION,
        DISPUTE_PERIOD
    );
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("✅ Oracle deployed to:", oracleAddress);

    // Deploy MarketFactory
    console.log("\n📝 Deploying MarketFactory...");
    const MarketFactory = await hre.ethers.getContractFactory("MarketFactory");
    const marketFactory = await MarketFactory.deploy(
        usdcAddress,
        outcomeTokenAddress,
        oracleAddress,
        MIN_LIQUIDITY_PARAMETER
    );
    await marketFactory.waitForDeployment();
    const marketFactoryAddress = await marketFactory.getAddress();
    console.log("✅ MarketFactory deployed to:", marketFactoryAddress);

    // Set MarketFactory address in OutcomeToken
    console.log("\n📝 Setting MarketFactory address in OutcomeToken...");
    await outcomeToken.setMarketFactory(marketFactoryAddress);
    console.log("✅ MarketFactory address set");

    // Transfer OutcomeToken ownership to MarketFactory
    console.log("\n📝 Transferring OutcomeToken ownership to MarketFactory...");
    await outcomeToken.transferOwnership(marketFactoryAddress);
    console.log("✅ Ownership transferred");

    // Summary
    console.log("\n✨ LOCAL DEPLOYMENT COMPLETE!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("USDC:           ", usdcAddress);
    console.log("OutcomeToken:   ", outcomeTokenAddress);
    console.log("Oracle:         ", oracleAddress);
    console.log("MarketFactory:  ", marketFactoryAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n📝 Update contracts/.env with these addresses:");
    console.log(`NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=${marketFactoryAddress}`);
    console.log(`NEXT_PUBLIC_ORACLE_ADDRESS=${oracleAddress}`);
    console.log(`NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=${outcomeTokenAddress}`);
    console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);

    console.log("\n🎯 Now run: node scripts/autoGenerateMarkets.js");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
