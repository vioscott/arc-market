
import hre from "hardhat";
const { ethers } = hre;

async function main() {
    console.log("🚀 Attempting cheap deployment of MockUSDC...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");

    // Try with 10 gwei
    const gasPrice = ethers.parseUnits("10", "gwei");
    console.log(`Using gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);

    try {
        const mockUSDC = await MockUSDC.deploy({
            gasPrice: gasPrice
        });

        console.log("Transaction sent, waiting for deployment...");
        await mockUSDC.waitForDeployment();

        const address = await mockUSDC.getAddress();
        console.log("✅ MockUSDC deployed to:", address);
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
