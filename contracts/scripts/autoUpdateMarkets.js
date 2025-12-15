
import hre from 'hardhat';
const { ethers } = hre;
import { fetchSportsEventsReal } from './apis/sports.js';
import { validateEvents, getValidEvents, logValidationResults } from './services/eventValidator.js';
import { deployMarkets } from './services/marketDeployer.js';

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('🤖 AUTO-UPDATE SPORTS MARKETS');
    console.log('═══════════════════════════════════════════════\n');

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using account: ${deployer.address}\n`);

    // Step 1: Fetch events from Sports API
    console.log('STEP 1: Fetching Live Sports Events');
    console.log('───────────────────────────────────────────────');

    // Check for API Key first to avoid obscure failures
    if (!process.env.SPORTS_API_KEY) {
        console.error('❌ Error: SPORTS_API_KEY not set in .env');
        console.log('   Please add your API key from https://dashboard.api-football.com');
        return;
    }

    const events = await fetchSportsEventsReal();

    if (events.length === 0) {
        console.log('\n⚠️  No events fetched. Exiting.');
        return;
    }

    // Step 2: Validate events (Checks duplicates against markets.json)
    console.log('\nSTEP 2: Validating Events');
    console.log('───────────────────────────────────────────────');
    const validationResults = validateEvents(events);
    logValidationResults(validationResults);

    const validEvents = getValidEvents(validationResults);

    if (validEvents.length === 0) {
        console.log('\n⚠️  No new valid events to create markets for.');
        console.log('   (Markets for fetched events may already exist)');
        return;
    }

    // Step 3: Deploy markets
    console.log('\nSTEP 3: Deploying Markets');
    console.log('───────────────────────────────────────────────');
    const deploymentResults = await deployMarkets(validEvents, deployer);

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 UPDATE SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Events Fetched:    ${events.length}`);
    console.log(`New Markets:       ${deploymentResults.filter(r => r.success).length}`);
    console.log(`Failed:            ${deploymentResults.filter(r => !r.success).length}`);
    console.log('═══════════════════════════════════════════════\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Fatal Error:', error);
        process.exit(1);
    });
