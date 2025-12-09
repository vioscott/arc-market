
import fs from 'fs';
import path from 'path';

const marketsPath = 'contracts/scripts/database/markets.json';
const data = JSON.parse(fs.readFileSync(marketsPath, 'utf8'));
const marketsMap = data.markets || {};

console.log(`Total markets before prune: ${Object.keys(marketsMap).length}`);

const validMarkets = {};
Object.values(marketsMap).forEach(market => {
    if (market.marketId <= 20) {
        validMarkets[market.marketId] = market;
    }
});

console.log(`Total markets after prune: ${Object.keys(validMarkets).length}`);

// Preserve structure
data.markets = validMarkets;
fs.writeFileSync(marketsPath, JSON.stringify(data, null, 2));
