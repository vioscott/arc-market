import hre from 'hardhat';

async function main() {
    const usdcAddress = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
    console.log(`Checking USDC at ${usdcAddress}`);

    const code = await hre.ethers.provider.getCode(usdcAddress);
    console.log(`Code size: ${code.length}`);
    if (code === '0x') {
        console.log("❌ NO CODE AT ADDRESS");
        return;
    }

    const usdc = await hre.ethers.getContractAt("IERC20Metadata", usdcAddress);

    try {
        const decimals = await usdc.decimals();
        console.log(`Decimals: ${decimals}`);
        const symbol = await usdc.symbol();
        console.log(`Symbol: ${symbol}`);
    } catch (e) {
        console.log("Could not fetch decimals:", e.shortMessage || e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
