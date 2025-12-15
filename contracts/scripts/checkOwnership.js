
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    console.log("🔍 Checking contract ownership...\n");

    const [signer] = await hre.ethers.getSigners();
    console.log("Caller:", signer.address);

    // Get contract addresses from env or hardcoded fallback (synced with wagmi.ts)
    // Using addresses from recent conversation/logs
    const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || "0xa52e6618a12E5932256cC0C9EAc5Efd2C34C70Af";
    const OUTCOME_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || "0x83C754b59cEa49F441602DfF046806f273675b20";
    const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "0xf9f08F485363B603Ce021CEEF7B4C2f0bc180ac9";

    console.log("MarketFactory:", MARKET_FACTORY_ADDRESS);
    console.log("OutcomeToken:", OUTCOME_TOKEN_ADDRESS);
    console.log("Oracle:       ", ORACLE_ADDRESS);
    console.log("----------------------------------------");

    // Check MarketFactory
    try {
        const MarketFactory = await hre.ethers.getContractAt("MarketFactory", MARKET_FACTORY_ADDRESS);
        const factoryOwner = await MarketFactory.owner();
        console.log("\n🏭 [MarketFactory]");
        console.log("   Owner:", factoryOwner);
    } catch (e) {
        console.log("   Error fetch owner:", e.message);
    }

    // Check OutcomeToken
    try {
        const OutcomeToken = await hre.ethers.getContractAt("OutcomeToken", OUTCOME_TOKEN_ADDRESS);
        const tokenOwner = await OutcomeToken.owner();
        console.log("\n🪙 [OutcomeToken]");
        console.log("   Owner:", tokenOwner);
        if (tokenOwner === MARKET_FACTORY_ADDRESS) {
            console.log("   (Owned by MarketFactory - Correct)");
        }
    } catch (e) {
        console.log("   Error fetch owner:", e.message);
    }

    // Check Oracle
    try {
        const Oracle = await hre.ethers.getContractAt("Oracle", ORACLE_ADDRESS);
        const DEFAULT_ADMIN_ROLE = await Oracle.DEFAULT_ADMIN_ROLE();
        const isAdmin = await Oracle.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        console.log("\n🔮 [Oracle] (AccessControl)");
        console.log(`   Is Caller (${signer.address}) Admin?`, isAdmin);

        // Cannot easily read "who is admin" without events, but we can check if caller is admin
    } catch (e) {
        console.log("   Error fetch Oracle roles:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
