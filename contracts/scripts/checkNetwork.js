
import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`);

    const marketFactoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x7B661633B83Cb0FfCE227b3F498Be904429917a3';
    console.log(`MarketFactory: ${marketFactoryAddress}`);

    const marketFactory = await ethers.getContractAt("MarketFactory", marketFactoryAddress);

    try {
        const usdcAddress = await marketFactory.usdc();
        console.log(`MarketFactory.usdc(): ${usdcAddress}`);

        const code = await ethers.provider.getCode(usdcAddress);
        console.log(`Code length at USDC: ${code.length}`);

        if (code === "0x") {
            console.error("❌ No code at USDC address! MarketFactory is misconfigured.");
        } else {
            console.log("✅ Contract exists at USDC address.");
        }
    } catch (e) {
        console.error("❌ Could not call MarketFactory.usdc():", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
