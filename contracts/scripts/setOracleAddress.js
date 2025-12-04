// contracts/scripts/setOracleAddress.js
import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Deployer address: ${deployer.address}`);

    const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;
    if (!oracleAddress) {
        throw new Error("NEXT_PUBLIC_ORACLE_ADDRESS not set in .env");
    }

    console.log(`📡 Connecting to Oracle at ${oracleAddress}...`);
    const oracle = await ethers.getContractAt("Oracle", oracleAddress);

    // Get role hashes
    const ADMIN_ROLE = await oracle.ADMIN_ROLE();
    const RESOLVER_ROLE = await oracle.RESOLVER_ROLE();

    console.log(`\n🔍 Checking roles for deployer...`);

    // Check if deployer has ADMIN_ROLE
    const hasAdminRole = await oracle.hasRole(ADMIN_ROLE, deployer.address);
    console.log(`   ADMIN_ROLE: ${hasAdminRole ? '✅ Yes' : '❌ No'}`);

    // Check if deployer has RESOLVER_ROLE
    const hasResolverRole = await oracle.hasRole(RESOLVER_ROLE, deployer.address);
    console.log(`   RESOLVER_ROLE: ${hasResolverRole ? '✅ Yes' : '❌ No'}`);

    if (hasAdminRole && hasResolverRole) {
        console.log("\n✅ Deployer already has both ADMIN_ROLE and RESOLVER_ROLE!");
        return;
    }

    // Grant missing roles
    if (!hasAdminRole) {
        console.log(`\n📝 Granting ADMIN_ROLE to deployer...`);
        const tx1 = await oracle.grantRole(ADMIN_ROLE, deployer.address);
        await tx1.wait();
        console.log("✅ ADMIN_ROLE granted!");
    }

    if (!hasResolverRole) {
        console.log(`\n📝 Granting RESOLVER_ROLE to deployer...`);
        const tx2 = await oracle.grantRole(RESOLVER_ROLE, deployer.address);
        await tx2.wait();
        console.log("✅ RESOLVER_ROLE granted!");
    }

    console.log("\n🎉 Oracle roles updated successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
