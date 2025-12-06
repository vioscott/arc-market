// Main script for monitoring and resolving markets
import hre from 'hardhat';
const { ethers } = hre;
import { monitorMarkets, getMarketsReadyForResolution } from './services/marketMonitor.js';
import { resolveMarkets } from './services/oracleResolver.js';

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('👀 MONITOR & RESOLVE MARKETS');
    console.log('═══════════════════════════════════════════════\n');

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using account: ${deployer.address}\n`);

    // Step 1: Monitor and close markets
    console.log('STEP 1: Monitoring Markets');
    console.log('───────────────────────────────────────────────');
    const monitorResults = await monitorMarkets(deployer);

    const closedCount = monitorResults.filter(r => r.action === 'closed').length;
    if (closedCount > 0) {
        console.log(`\n✅ Closed ${closedCount} markets`);
    }

    // Step 2: Resolve markets
    console.log('\nSTEP 2: Resolving Markets');
    console.log('───────────────────────────────────────────────');
    const marketsToResolve = await getMarketsReadyForResolution();

    if (marketsToResolve.length === 0) {
        console.log('   No markets ready for resolution');
    } else {
        console.log(`   Found ${marketsToResolve.length} markets ready for resolution`);
        const resolutionResults = await resolveMarkets(marketsToResolve, deployer);

        const resolvedCount = resolutionResults.filter(r => r.success).length;
        console.log(`\n✅ Resolved ${resolvedCount} markets`);
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Markets Monitored: ${monitorResults.length}`);
    console.log(`Markets Closed:    ${closedCount}`);
    console.log(`Markets Resolved:  ${marketsToResolve.length}`);
    console.log('═══════════════════════════════════════════════\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Fatal Error:', error);
        process.exit(1);
    });
