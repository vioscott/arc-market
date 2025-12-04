// contracts/scripts/autoCreateMarkets.js
import hre from "hardhat";
const { ethers } = hre;
import axios from "axios";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==== CONFIG ====
const CONFIG = {
    // 24‑hour market duration (seconds)
    marketDurationHours: 24,
    // Path to JSON store that tracks already‑created markets
    storePath: path.resolve(__dirname, "createdMarkets.json"),
};

// Load or init the store
let store = {};
if (fs.existsSync(CONFIG.storePath)) {
    store = JSON.parse(fs.readFileSync(CONFIG.storePath, "utf8"));
}
function saveStore() {
    fs.writeFileSync(CONFIG.storePath, JSON.stringify(store, null, 2));
}

// ---------- 1️⃣ FETCH DATA ---------- //
// NBA – free API balldontlie (no key required)
// NBA – Mock data (API is down/requires key)
async function fetchNBAGames() {
    console.log("   🏀 Generating mock NBA games...");
    const teams = [
        "Lakers", "Warriors", "Celtics", "Heat", "Bucks", "Suns", "Nuggets", "76ers"
    ];

    const games = [];
    const today = new Date();

    // Generate 3 random games
    for (let i = 0; i < 3; i++) {
        const home = teams[Math.floor(Math.random() * teams.length)];
        let visitor = teams[Math.floor(Math.random() * teams.length)];
        while (visitor === home) {
            visitor = teams[Math.floor(Math.random() * teams.length)];
        }

        const gameTime = new Date(today.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // 1-3 days from now
        const dateStr = gameTime.toLocaleDateString();

        games.push({
            eventId: `nba-mock-${Date.now()}-${i}`,
            eventType: "nba",
            question: `Will ${home} beat ${visitor} on ${dateStr}?`,
            startTime: Math.floor(gameTime.getTime() / 1000),
        });
    }

    return games;
}

// Weather – free API open‑meteo (no key). We'll use a few major cities.
async function fetchWeatherEvents() {
    try {
        const cities = [
            { name: "New York", lat: 40.7128, lon: -74.006 },
            { name: "London", lat: 51.5074, lon: -0.1278 },
            { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
        ];
        const now = Math.floor(Date.now() / 1000);
        const events = [];
        for (const c of cities) {
            const resp = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&hourly=temperature_2m`
            );
            const temps = resp.data.hourly.temperature_2m;
            const times = resp.data.hourly.time;
            const futureIdx = times.findIndex((t) => new Date(t) > new Date());
            if (futureIdx !== -1) {
                const futureTemp = temps[futureIdx];
                const eventTime = Math.floor(new Date(times[futureIdx]).getTime() / 1000);
                events.push({
                    eventId: `${c.name}-${eventTime}`,
                    eventType: "weather",
                    question: `Will the temperature in ${c.name} exceed 30°C within the next 24 hours?`,
                    startTime: now,
                    resolveTime: eventTime,
                });
            }
        }
        return events;
    } catch (error) {
        console.warn('⚠️  Weather API failed:', error.message);
        return [];
    }
}

// Crypto – free API coingecko price check. Simple event: will BTC price be > $30k in next 24h?
async function fetchCryptoEvents() {
    try {
        const resp = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const price = resp.data.bitcoin.usd;
        const now = Math.floor(Date.now() / 1000);
        return [
            {
                eventId: `btc-${now}`,
                eventType: "crypto",
                question: `Will Bitcoin price be above $100,000 USD in the next 24 hours?`,
                startTime: now,
            },
        ];
    } catch (error) {
        console.warn('⚠️  Crypto API failed:', error.message);
        return [];
    }
}

// ---------- 2️⃣ CREATE MARKETS ---------- //
async function createMarket(factory, question, startTime, duration, extra) {
    if (store[question]) return;

    const closeTime = startTime + duration;
    const liquidityParameter = ethers.parseEther("100"); // 100 USDC liquidity
    const sourceUrl = "https://example.com"; // Placeholder source URL

    const tx = await factory.createMarket(
        question,
        sourceUrl,
        closeTime,
        liquidityParameter
    );
    const receipt = await tx.wait();

    // Parse the MarketCreated event
    let marketAddress;
    for (const log of receipt.logs) {
        try {
            const parsed = factory.interface.parseLog(log);
            if (parsed && parsed.name === 'MarketCreated') {
                marketAddress = parsed.args.marketAddress;
                break;
            }
        } catch (e) {
            // Not a factory event, continue
        }
    }

    if (!marketAddress) {
        throw new Error('MarketCreated event not found in transaction receipt');
    }

    console.log(`✅ Market created: ${question}\n   → ${marketAddress}`);
    store[question] = {
        marketAddress,
        eventId: extra.eventId,
        eventType: extra.eventType,
        startTime,
        resolveTime: extra.resolveTime || startTime + duration,
    };
    saveStore();
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using deployer ${deployer.address}`);

    const factory = await ethers.getContractAt(
        "MarketFactory",
        process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || "0x7B661633B83Cb0FfCE227b3F498Be904429917a3"
    );

    const duration = CONFIG.marketDurationHours * 60 * 60;

    console.log('📡 Fetching data from APIs...');
    const proposals = [
        ...(await fetchNBAGames()),
        ...(await fetchWeatherEvents()),
        ...(await fetchCryptoEvents()),
    ];

    if (proposals.length === 0) {
        console.log('⚠️  No events found from any API. All sources may be down or rate-limited.');
        return;
    }

    console.log(`📊 Found ${proposals.length} potential markets`);

    for (const p of proposals) {
        try {
            await createMarket(factory, p.question, p.startTime, duration, p);
        } catch (error) {
            console.error(`❌ Failed to create market: ${p.question}`);
            console.error(`   Error: ${error.message}`);
        }
    }

    console.log('✅ Market creation complete!');
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
