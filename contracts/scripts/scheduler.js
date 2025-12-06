// Scheduler for automatic market generation and resolution
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('═══════════════════════════════════════════════');
console.log('⏰ MARKET AUTOMATION SCHEDULER');
console.log('═══════════════════════════════════════════════\n');

// Schedule: Auto-generate markets every hour
cron.schedule('0 * * * *', async () => {
    console.log(`\n[${new Date().toLocaleString()}] Running auto-generate markets...`);
    try {
        const { stdout, stderr } = await execAsync('node contracts/scripts/autoGenerateMarkets.js');
        console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error) {
        console.error('Error running autoGenerateMarkets:', error.message);
    }
});

// Schedule: Monitor and resolve markets every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log(`\n[${new Date().toLocaleString()}] Running monitor and resolve...`);
    try {
        const { stdout, stderr } = await execAsync('node contracts/scripts/monitorAndResolve.js');
        console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error) {
        console.error('Error running monitorAndResolve:', error.message);
    }
});

console.log('✅ Scheduler started');
console.log('   - Auto-generate markets: Every hour (0 * * * *)');
console.log('   - Monitor & resolve:     Every 5 minutes (*/5 * * * *)');
console.log('\n⏳ Waiting for scheduled tasks...\n');

// Run immediately on start
console.log('🚀 Running initial market generation...\n');
try {
    const { stdout, stderr } = await execAsync('node contracts/scripts/autoGenerateMarkets.js');
    console.log(stdout);
    if (stderr) console.error(stderr);
} catch (error) {
    console.error('Error running initial autoGenerateMarkets:', error.message);
}

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Scheduler stopped');
    process.exit(0);
});
