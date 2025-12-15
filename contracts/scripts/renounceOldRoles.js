
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    console.log("🚀 Renouncing roles for Old Admin...");

    const [signer] = await hre.ethers.getSigners();
    const OLD_ADMIN = signer.address;
    console.log("Caller (Old Admin):", OLD_ADMIN);

    // Ensure we are indeed the old admin before proceeding
    if (OLD_ADMIN.toLowerCase() !== "0x9CA978CAD623eb4630b8D1B93CdA2eF60a1b1C9f".toLowerCase()) {
        console.error("⚠️ Caller doesn't match the address to be removed!");
        return;
    }

    const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "0xf9f08F485363B603Ce021CEEF7B4C2f0bc180ac9";
    const Oracle = await hre.ethers.getContractAt("Oracle", ORACLE_ADDRESS);

    const DEFAULT_ADMIN_ROLE = await Oracle.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await Oracle.ADMIN_ROLE();
    const RESOLVER_ROLE = await Oracle.RESOLVER_ROLE();

    try {
        // 1. Renounce RESOLVER_ROLE (if held)
        if (await Oracle.hasRole(RESOLVER_ROLE, OLD_ADMIN)) {
            console.log("Renouncing RESOLVER_ROLE...");
            await (await Oracle.renounceRole(RESOLVER_ROLE, OLD_ADMIN)).wait();
            console.log("✅ RESOLVER_ROLE renounced");
        }

        // 2. Renounce ADMIN_ROLE
        console.log("Renouncing ADMIN_ROLE...");
        await (await Oracle.renounceRole(ADMIN_ROLE, OLD_ADMIN)).wait();
        console.log("✅ ADMIN_ROLE renounced");

        // 3. Renounce DEFAULT_ADMIN_ROLE (Last step)
        console.log("Renouncing DEFAULT_ADMIN_ROLE...");
        await (await Oracle.renounceRole(DEFAULT_ADMIN_ROLE, OLD_ADMIN)).wait();
        console.log("✅ DEFAULT_ADMIN_ROLE renounced");

        console.log("\n🎉 Address 0x9CA... is now fully removed from Oracle permissions.");

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
