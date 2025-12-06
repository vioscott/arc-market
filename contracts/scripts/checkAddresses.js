// Check both MarketFactory addresses to see which one is deployed
import hre from 'hardhat';
const { ethers } = hre;

async function main() {
    console.log('🔍 Checking Contract Addresses\n');

    const addresses = [
        { name: 'MarketFactory (first)', address: '0xf0fEf819e7AB17789884748E5d3DB3e710034fbC' },
        { name: 'MarketFactory (second)', address: '0x7B661633B83Cb0FfCE227b3F498Be904429917a3' },
        { name: 'Oracle (first)', address: '0xcC105245d8006BFbdbb4E848D38C592a3ec017ed' },
        { name: 'Oracle (second)', address: '0x6174dd78631FE0c01f06Cb0036f4245d212Be3dB' },
    ];

    for (const { name, address } of addresses) {
        const code = await ethers.provider.getCode(address);
        const hasCode = code !== '0x';

        console.log(`${name}:`);
        console.log(`  Address: ${address}`);
        console.log(`  Has Code: ${hasCode ? '✅ YES' : '❌ NO'}`);
        console.log('');
    }

    console.log('\n📝 Recommendation:');
    console.log('Use the addresses that have code deployed.');
    console.log('Update contracts/.env to use only the working addresses.\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
