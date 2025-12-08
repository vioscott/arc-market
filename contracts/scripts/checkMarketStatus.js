import hre from 'hardhat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('Starting market check...');
    const marketsPath = path.join(__dirname, 'database', 'markets.json');
    const marketsData = JSON.parse(fs.readFileSync(marketsPath, 'utf8'));
    const markets = marketsData.markets;

    const factoryAddress = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x1E9dD2639f4508Bc390e1e85DbEdefbf52e7440e';
    console.log(`Using MarketFactory: ${factoryAddress}`);
    const MarketFactory = await hre.ethers.getContractAt("MarketFactory", factoryAddress);

    // Check USDC
    const usdcAddress = await MarketFactory.usdc();
    console.log(`Factory USDC: ${usdcAddress}`);

    // Check Block Timestamp
    const blockNum = await hre.ethers.provider.getBlockNumber();
    const block = await hre.ethers.provider.getBlock(blockNum);
    console.log(`\n⛓️ Current Block: ${blockNum}`);
    console.log(`⏱️ Current Block Timestamp: ${block.timestamp} (${new Date(block.timestamp * 1000).toISOString()})`);
    console.log(`🖥️ Local System Time:       ${Math.floor(Date.now() / 1000)} (${new Date().toISOString()})`);

    // Check first few markets
    const idsToCheck = [0, 1, 33, 47];

    for (const id of idsToCheck) {
        if (!markets[id]) {
            console.log(`\nMarket ID ${id} not found in JSON.`);
            continue;
        }

        console.log(`\nChecking Market ID: ${id}`);
        console.log(`JSON Address: ${markets[id].marketAddress}`);
        console.log(`JSON CloseTime: ${new Date(markets[id].closeTime * 1000).toISOString()}`);

        try {
            const onChainAddress = await MarketFactory.getMarket(BigInt(id));
            console.log(`Factory Address: ${onChainAddress}`);

            if (onChainAddress === '0x0000000000000000000000000000000000000000') {
                console.log("❌ Market does not exist on this Factory.");
                continue;
            }

            if (onChainAddress !== markets[id].marketAddress) {
                console.log("⚠️  MISMATCH: JSON address differs from Factory address!");
            }

            // Check Market Contract
            const Market = await hre.ethers.getContractAt("Market", onChainAddress);
            const closeTime = await Market.closeTime();
            console.log(`On-Chain CloseTime: ${new Date(Number(closeTime) * 1000).toISOString()}`);

            const now = Math.floor(Date.now() / 1000);
            if (Number(closeTime) < now) {
                console.log("❌ MARKET IS CLOSED (Past CloseTime)");
            } else {
                console.log("✅ Market is OPEN");
            }

            // Check status directly if available
            try {
                const isClosed = await Market.closed();
                console.log(`On-Chain Closed Status: ${isClosed}`);
            } catch (e) {
                console.log("Warning: Could not read 'closed' property directly");
            }

        } catch (error) {
            console.error("Error checking market:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
