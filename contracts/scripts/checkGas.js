
import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const feeData = await ethers.provider.getFeeData();
    console.log(`Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    if (feeData.maxFeePerGas) {
        console.log(`Max Fee Per Gas: ${ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei`);
        console.log(`Max Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")} gwei`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
