const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying Arc Prediction Market contracts...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Arc Testnet USDC address (native token)
    const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

    // Configuration
    const MIN_LIQUIDITY_PARAMETER = hre.ethers.parseEther("100"); // 100 USDC minimum
    const REQUIRED_CONFIRMATIONS = 1; // 1-of-N for testing (change to 2+ for production)
    const TIME_LOCK_DURATION = 24 * 60 * 60; // 24 hours
    const DISPUTE_PERIOD = 48 * 60 * 60; // 48 hours

    // Deploy OutcomeToken
    console.log("\n📝 Deploying OutcomeToken...");
    const OutcomeToken = await hre.ethers.getContractFactory("OutcomeToken");
    const outcomeToken = await OutcomeToken.deploy();
    await outcomeToken.waitForDeployment();
    const outcomeTokenAddress = await outcomeToken.getAddress();
    console.log("✅ OutcomeToken deployed to:", outcomeTokenAddress);

    // Deploy Oracle
    console.log("\n📝 Deploying Oracle...");
    const resolvers = [deployer.address]; // Add more resolver addresses here
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
        USDC_ADDRESS,
        outcomeTokenAddress,
        oracleAddress,
        MIN_LIQUIDITY_PARAMETER
    );
    await marketFactory.waitForDeployment();
    const marketFactoryAddress = await marketFactory.getAddress();
    console.log("✅ MarketFactory deployed to:", marketFactoryAddress);

    // Transfer OutcomeToken ownership to MarketFactory
    console.log("\n📝 Transferring OutcomeToken ownership to MarketFactory...");
    const tx = await outcomeToken.transferOwnership(marketFactoryAddress);
    await tx.wait();
    console.log("✅ Ownership transferred");

    // Save deployment addresses
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            USDC: USDC_ADDRESS,
            OutcomeToken: outcomeTokenAddress,
            Oracle: oracleAddress,
            MarketFactory: marketFactoryAddress,
        },
        configuration: {
            minLiquidityParameter: MIN_LIQUIDITY_PARAMETER.toString(),
            requiredConfirmations: REQUIRED_CONFIRMATIONS,
            timeLockDuration: TIME_LOCK_DURATION,
            disputePeriod: DISPUTE_PERIOD,
        },
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const deploymentFile = path.join(
        deploymentsDir,
        `${hre.network.name}-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📄 Deployment info saved to:", deploymentFile);
    console.log("\n✨ Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("USDC:           ", USDC_ADDRESS);
    console.log("OutcomeToken:   ", outcomeTokenAddress);
    console.log("Oracle:         ", oracleAddress);
    console.log("MarketFactory:  ", marketFactoryAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n🔍 Verifying contracts on ArcScan...");
    console.log("Run the following commands to verify:");
    console.log(`npx hardhat verify --network arcTestnet ${outcomeTokenAddress}`);
    console.log(`npx hardhat verify --network arcTestnet ${oracleAddress} '${JSON.stringify(resolvers)}' ${REQUIRED_CONFIRMATIONS} ${TIME_LOCK_DURATION} ${DISPUTE_PERIOD}`);
    console.log(`npx hardhat verify --network arcTestnet ${marketFactoryAddress} ${USDC_ADDRESS} ${outcomeTokenAddress} ${oracleAddress} ${MIN_LIQUIDITY_PARAMETER}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
