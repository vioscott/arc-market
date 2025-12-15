
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const NEW_OWNER = "0xa5c2Ef5D0007fCD7Fa99d12148F8D30ECE537FfD";

    console.log("🚀 Transferring ownership to:", NEW_OWNER);
    console.log("----------------------------------------");

    const [signer] = await hre.ethers.getSigners();
    console.log("Caller:", signer.address);

    const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || "0xa52e6618a12E5932256cC0C9EAc5Efd2C34C70Af";
    const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "0xf9f08F485363B603Ce021CEEF7B4C2f0bc180ac9";

    // 1. Transfer MarketFactory
    try {
        console.log("\n🏭 [MarketFactory] Transferring ownership...");
        const MarketFactory = await hre.ethers.getContractAt("MarketFactory", MARKET_FACTORY_ADDRESS);
        const currentOwner = await MarketFactory.owner();

        if (currentOwner.toLowerCase() === signer.address.toLowerCase()) {
            const tx = await MarketFactory.transferOwnership(NEW_OWNER);
            console.log("   Tx sent:", tx.hash);
            await tx.wait();
            console.log("   ✅ Ownership transferred!");
        } else {
            console.log(`   ⚠️ Caller is not owner! (Owner: ${currentOwner})`);
        }
    } catch (e) {
        console.error("   ❌ Error:", e.message);
    }

    // 2. Update Oracle Roles
    try {
        console.log("\n🔮 [Oracle] Granting Admin roles...");
        const Oracle = await hre.ethers.getContractAt("Oracle", ORACLE_ADDRESS);

        const DEFAULT_ADMIN_ROLE = await Oracle.DEFAULT_ADMIN_ROLE();
        const ADMIN_ROLE = await Oracle.ADMIN_ROLE();

        // Grant DEFAULT_ADMIN_ROLE
        const tx1 = await Oracle.grantRole(DEFAULT_ADMIN_ROLE, NEW_OWNER);
        console.log("   Granting DEFAULT_ADMIN_ROLE:", tx1.hash);
        await tx1.wait();
        console.log("   ✅ DEFAULT_ADMIN_ROLE granted");

        // Grant ADMIN_ROLE
        const tx2 = await Oracle.grantRole(ADMIN_ROLE, NEW_OWNER);
        console.log("   Granting ADMIN_ROLE:", tx2.hash);
        await tx2.wait();
        console.log("   ✅ ADMIN_ROLE granted");

        console.log("\n   ⚠️ Note: The original admin (you) still has roles.");
        console.log("   To fully renounce, run `renounceRole` separately after verifying the new wallet.");

    } catch (e) {
        console.error("   ❌ Error:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
