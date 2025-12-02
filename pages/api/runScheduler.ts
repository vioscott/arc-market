// pages/api/runScheduler.ts
import { execSync } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    try {
        const root = process.cwd();
        const autoCreate = path.resolve(root, 'contracts', 'scripts', 'autoCreateMarkets.js');
        const update = path.resolve(root, 'contracts', 'scripts', 'updateMarkets.js');

        console.log('▶️ Running autoCreateMarkets...');
        execSync(`node ${autoCreate}`, { stdio: 'inherit' });

        console.log('▶️ Running updateMarkets...');
        execSync(`node ${update}`, { stdio: 'inherit' });

        res.status(200).json({ message: 'Scheduler executed successfully' });
    } catch (error) {
        console.error('❌ Scheduler error:', error);
        res.status(500).json({ error: 'Scheduler failed', details: error?.message });
    }
}
