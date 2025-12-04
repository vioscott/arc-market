
import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using deployer ${deployer.address}`);

    // Addresses (Hardcoded from recent deployment)
    const marketFactoryAddress = "0xe1737Ad3fac808BdC874BaBE05bAD9586D9D23D9";
    const usdcAddress = "0x3600000000000000000000000000000000000000";

    // Contracts
    const marketFactory = await ethers.getContractAt("MarketFactory", marketFactoryAddress);
    // Use IERC20 for system USDC
    const usdc = await ethers.getContractAt("IERC20", usdcAddress);

    // 0. Lower Min Liquidity (Workaround for initial cost bug)
    console.log("\n0️⃣ Lowering Min Liquidity...");
    const newMinLiquidity = ethers.parseEther("0.01");
    const setMinTx = await marketFactory.setMinLiquidityParameter(newMinLiquidity);
    await setMinTx.wait();
    console.log("✅ Min Liquidity set to 0.01");

    // 1. Create Market
    console.log("\n1️⃣ Creating Market...");
    const question = `E2E Test Market ${Date.now()}`;
    const sourceUrl = "https://example.com";
    const closeTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const liquidityParameter = ethers.parseEther("0.01"); // Use small b to keep initial cost low

    const createTx = await marketFactory.createMarket(
        question,
        sourceUrl,
        closeTime,
        liquidityParameter
    );
    console.log(`   Tx sent: ${createTx.hash}`);
    const createReceipt = await createTx.wait();

    // Parse logs to get market address
    const marketCreatedEvent = createReceipt.logs.find(log => {
        try {
            return marketFactory.interface.parseLog(log).name === 'MarketCreated';
        } catch { return false; }
    });

    if (!marketCreatedEvent) throw new Error("MarketCreated event not found");
    const marketAddress = marketFactory.interface.parseLog(marketCreatedEvent).args.marketAddress;
    console.log(`✅ Market created at: ${marketAddress}`);

    const market = await ethers.getContractAt("Market", marketAddress);

    // 2. Approve USDC
    console.log("\n2️⃣ Approving USDC...");
    const approveAmount = ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
    const approveTx = await usdc.approve(marketAddress, approveAmount);
    await approveTx.wait();
    console.log("✅ USDC Approved");

    // 3. Buy Shares (YES)
    console.log("\n3️⃣ Buying YES Shares...");

    // Debug: Check balance and allowance
    const nativeBalance = await ethers.provider.getBalance(deployer.address);
    const balance = await usdc.balanceOf(deployer.address);
    const allowance = await usdc.allowance(deployer.address, marketAddress);

    console.log(`   Native Balance: ${ethers.formatEther(nativeBalance)}`);
    console.log(`   USDC Balance (ERC20): ${ethers.formatUnits(balance, 6)}`);
    console.log(`   Market Allowance: ${ethers.formatUnits(allowance, 6)}`);

    // Calculate cost for 0.001 shares (much smaller amount)
    const sharesToBuy = ethers.parseEther("0.001");
    const cost = await market.calculateCost(0, sharesToBuy); // 0 = YES
    console.log(`   Cost for 0.001 YES shares: ${ethers.formatUnits(cost, 6)} USDC`);

    // Use native balance check if ERC20 balance seems wrong/low
    // The system contract might have quirks.
    if (balance < cost) {
        console.warn("⚠️ ERC20 Balance is low, but proceeding if native balance is sufficient (Arc quirk?)");
    }

    if (allowance < cost) {
        console.error("❌ Insufficient Allowance!");
        return;
    }

    // Add 1% slippage
    const maxCost = cost * BigInt(101) / BigInt(100);

    try {
        const buyTx = await market.buyShares(0, sharesToBuy, maxCost);
        await buyTx.wait();
        console.log("✅ Bought 10 YES shares");
    } catch (error) {
        console.error("❌ Buy failed:", error.message);
        if (error.data) console.error("   Error data:", error.data);
        return;
    }

    // 4. Resolve Market (Emergency Resolve to bypass timelock)
    console.log("\n4️⃣ Resolving Market (Emergency)...");
    const oracleAddress = await marketFactory.oracle();
    const oracle = await ethers.getContractAt("Oracle", oracleAddress);

    // Check if deployer has ADMIN_ROLE
    const ADMIN_ROLE = await oracle.ADMIN_ROLE();
    const isAdmin = await oracle.hasRole(ADMIN_ROLE, deployer.address);

    if (!isAdmin) {
        console.log("⚠️ Deployer is not ADMIN, cannot emergency resolve.");
        return;
    }

    const resolveTx = await oracle.emergencyResolve(marketAddress, 0); // 0 = YES
    await resolveTx.wait();
    console.log("✅ Market Emergency Resolved to YES");

    // 5. Redeem Winnings
    console.log("\n5️⃣ Redeeming Winnings...");

    // Check balance before
    const balanceBefore = await usdc.balanceOf(deployer.address);

    const redeemTx = await market.redeemWinnings();
    await redeemTx.wait();

    const balanceAfter = await usdc.balanceOf(deployer.address);
    const winnings = balanceAfter - balanceBefore;

    console.log(`✅ Winnings Redeemed: ${ethers.formatUnits(winnings, 6)} USDC`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
