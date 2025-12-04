// contracts/scripts/scheduleAutoMarkets.js
import cron from 'node-cron';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AUTO_CREATE = path.resolve(__dirname, 'autoCreateMarkets.js');
const UPDATE = path.resolve(__dirname, 'updateMarkets.js');

function runScript(scriptPath) {
    try {
        console.log(`▶️ Running ${path.basename(scriptPath)}...`);
        execSync(`npx hardhat run ${scriptPath} --network arcTestnet`, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    } catch (e) {
        console.error(`❌ Error running ${path.basename(scriptPath)}:`, e.message);
    }
}

// Hourly market creation
cron.schedule('0 * * * *', () => {
    runScript(AUTO_CREATE);
});

// Every 5 minutes market update (close & resolve)
cron.schedule('*/5 * * * *', () => {
    runScript(UPDATE);
});

console.log('🕒 Scheduler started: autoCreateMarkets hourly, updateMarkets every 5 minutes.');
