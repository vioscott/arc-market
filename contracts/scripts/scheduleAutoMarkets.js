// contracts/scripts/scheduleAutoMarkets.js
const cron = require('node-cron');
const { execSync } = require('child_process');
const path = require('path');

const AUTO_CREATE = path.resolve(__dirname, 'autoCreateMarkets.js');
const UPDATE = path.resolve(__dirname, 'updateMarkets.js');

function runScript(scriptPath) {
    try {
        console.log(`▶️ Running ${path.basename(scriptPath)}...`);
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
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
