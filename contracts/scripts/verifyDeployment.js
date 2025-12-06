// Verify the ACTUAL deployed contracts from latest deployment
import hre from 'hardhat';
const { ethers } = hre;

async function main() {
    // These are from the LATEST deployment (arcTestnet-1764991669449.json)
    const addresses = {
        marketFactory: '0x1E9dD2639f4508Bc390e1e85DbEdefbf52e7440e',
        oracle: '0xB38326843A22B2cF2A23a4938b37d2a7ad9AaB38',
        outcomeToken: '0x3848AB88D9A1B6D9c162B6a8Ef929FB1bf90f148',
    };

    console.log('\n🔍 Verifying Latest Deployment...\n');

    for (const [name, address] of Object.entries(addresses)) {
        const code = await ethers.provider.getCode(address);
        const hasCode = code !== '0x';
        console.log(`${name}:`);
        console.log(`  Address: ${address}`);
        console.log(`  Has Code: ${hasCode ? '✅ YES' : '❌ NO'}`);
        console.log('');
    }

    if (await ethers.provider.getCode(addresses.marketFactory) !== '0x') {
        console.log('✅ Contracts are deployed!');
        console.log('\nTrying to interact with MarketFactory...\n');

        try {
            const factory = await ethers.getContractAt('MarketFactory', addresses.marketFactory);
            const fee = await factory.marketCreationFee();
            const count = await factory.getMarketCount();

            console.log(`✅ marketCreationFee: ${ethers.formatEther(fee)} ETH`);
            console.log(`✅ Market Count: ${count}`);
            console.log('\n🎉 Contracts are working!\n');
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
