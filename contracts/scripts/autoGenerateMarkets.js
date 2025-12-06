// Main script for automatic market generation
import hre from 'hardhat';
const { ethers } = hre;
import { fetchAllEvents } from './services/eventFetcher.js';
import { validateEvents, getValidEvents, logValidationResults } from './services/eventValidator.js';
import { deployMarkets } from './services/marketDeployer.js';

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('🤖 AUTO-GENERATE MARKETS');
    console.log('═══════════════════════════════════════════════\n');

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using account: ${deployer.address}\n`);

    // Step 1: Fetch events from all APIs
    console.log('STEP 1: Fetching Events');
    console.log('───────────────────────────────────────────────');
    const events = await fetchAllEvents();

    if (events.length === 0) {
        console.log('\n⚠️  No events fetched. Exiting.');
        return;
    }

    // Step 2: Validate events
    console.log('\nSTEP 2: Validating Events');
    console.log('───────────────────────────────────────────────');
    const validationResults = validateEvents(events);
    logValidationResults(validationResults);

    const validEvents = getValidEvents(validationResults);

    if (validEvents.length === 0) {
        console.log('\n⚠️  No valid events to create markets for. Exiting.');
        return;
    }

    // Step 3: Deploy markets
    console.log('\nSTEP 3: Deploying Markets');
    console.log('───────────────────────────────────────────────');
    const deploymentResults = await deployMarkets(validEvents, deployer);

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Events Fetched:    ${events.length}`);
    console.log(`Events Valid:      ${validEvents.length}`);
    console.log(`Markets Created:   ${deploymentResults.filter(r => r.success).length}`);
    console.log(`Markets Failed:    ${deploymentResults.filter(r => !r.success).length}`);
    console.log('═══════════════════════════════════════════════\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Fatal Error:', error);
        process.exit(1);
    });
