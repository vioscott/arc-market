// pages/api/runScheduler.ts
import { execSync } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    try {
        // In dev, cwd is frontend/. In prod (Vercel), it might be different, 
        // but we assume the structure is preserved or we need to adjust.
        // For local dev:
        const root = process.cwd();
        // contracts is a sibling of frontend, so go up one level
        const contractsDir = path.resolve(root, '..', 'contracts');

        const autoCreate = path.resolve(contractsDir, 'scripts', 'autoCreateMarkets.js');
        const update = path.resolve(contractsDir, 'scripts', 'updateMarkets.js');

        console.log('▶️ Running autoCreateMarkets...');
        execSync(`node "${autoCreate}"`, { stdio: 'inherit' });

        console.log('▶️ Running updateMarkets...');
        execSync(`node "${update}"`, { stdio: 'inherit' });

        res.status(200).json({ message: 'Scheduler executed successfully' });
    } catch (error) {
        console.error('❌ Scheduler error:', error);
        res.status(500).json({ error: 'Scheduler failed', details: error?.message });
    }
}
