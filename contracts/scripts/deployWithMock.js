
import hre from "hardhat";
const { ethers } = hre;
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log("🚀 Deploying Arc Prediction Market contracts with Mock USDC...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy MockUSDC
    console.log("\n📝 Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const usdcAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", usdcAddress);

    // Configuration
    const MIN_LIQUIDITY_PARAMETER = hre.ethers.parseEther("100"); // 100 USDC minimum
    const REQUIRED_CONFIRMATIONS = 1;
    const TIME_LOCK_DURATION = 24 * 60 * 60;
    const DISPUTE_PERIOD = 48 * 60 * 60;

    // 2. Deploy OutcomeToken
    console.log("\n📝 Deploying OutcomeToken...");
    const OutcomeToken = await hre.ethers.getContractFactory("OutcomeToken");
    const outcomeToken = await OutcomeToken.deploy();
    await outcomeToken.waitForDeployment();
    const outcomeTokenAddress = await outcomeToken.getAddress();
    console.log("✅ OutcomeToken deployed to:", outcomeTokenAddress);

    // 3. Deploy Oracle
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

    // 4. Deploy MarketFactory
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

    // 5. Setup Permissions
    console.log("\n📝 Setting permissions...");
    await (await outcomeToken.setMarketFactory(marketFactoryAddress)).wait();
    await (await outcomeToken.transferOwnership(marketFactoryAddress)).wait();
    console.log("✅ Permissions set");

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            USDC: usdcAddress,
            OutcomeToken: outcomeTokenAddress,
            Oracle: oracleAddress,
            MarketFactory: marketFactoryAddress,
        },
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const deploymentFile = path.join(
        deploymentsDir,
        `mock-${hre.network.name}-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentFile);

    console.log("\n⚠️ Please update your .env file with these new addresses:");
    console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
    console.log(`NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=${marketFactoryAddress}`);
    console.log(`NEXT_PUBLIC_ORACLE_ADDRESS=${oracleAddress}`);
    console.log(`NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=${outcomeTokenAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
