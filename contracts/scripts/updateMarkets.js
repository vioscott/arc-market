// contracts/scripts/updateMarkets.js
import { ethers } from "hardhat";
import axios from "axios";
import * as fs from "fs";
import path from "path";

const STORE_PATH = path.resolve(__dirname, "createdMarkets.json");
let store = {};
if (fs.existsSync(STORE_PATH)) {
    store = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

// Helper to save store after updates
function saveStore() {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// ---------- FETCH LIVE STATUS ---------- //
async function fetchNBAStatus(eventId) {
    const resp = await axios.get(`https://www.balldontlie.io/api/v1/games/${eventId}`);
    const game = resp.data;
    // status can be "Final", "In Progress", "Scheduled"
    return game.status;
}

async function fetchWeatherTemp(event) {
    // event contains resolveTime and city info encoded in eventId e.g. "New York-<timestamp>"
    const [city] = event.eventId.split("-");
    const cityMap: any = {
        "New York": { lat: 40.7128, lon: -74.006 },
        "London": { lat: 51.5074, lon: -0.1278 },
        "Tokyo": { lat: 35.6895, lon: 139.6917 },
    };
    const c = cityMap[city];
    if (!c) return null;
    const resp = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&hourly=temperature_2m`
    );
    const times = resp.data.hourly.time;
    const temps = resp.data.hourly.temperature_2m;
    const idx = times.findIndex((t: string) => new Date(t).getTime() / 1000 >= event.resolveTime);
    return idx !== -1 ? temps[idx] : null;
}

async function fetchCryptoPrice() {
    const resp = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    return resp.data.bitcoin.usd;
}

// ---------- MAIN LOGIC ----------
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`🔑 Using ${deployer.address}`);

    const factory = await ethers.getContractAt(
        "MarketFactory",
        process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS!
    );
    const oracle = await ethers.getContractAt(
        "Oracle",
        process.env.NEXT_PUBLIC_ORACLE_ADDRESS!
    );

    const now = Math.floor(Date.now() / 1000);

    for (const [question, meta] of Object.entries(store)) {
        const market = await ethers.getContractAt("Market", meta.marketAddress);
        const status = await market.status(); // 0=open,1=closed,2=resolved (adjust if different)

        // 1️⃣ Close market when event starts (if not already closed)
        if (status === 0 && now >= meta.startTime) {
            // For NBA we also check that the game has actually started (status not "Scheduled")
            let shouldClose = true;
            if (meta.eventType === "nba") {
                const nbaStatus = await fetchNBAStatus(meta.eventId);
                shouldClose = nbaStatus !== "Scheduled"; // close when not scheduled
            }
            if (shouldClose) {
                console.log(`⏰ Closing market: ${question}`);
                await market.close();
            }
        }

        // 2️⃣ Resolve market when event is finished and market still open/closed
        if (status !== 2 && now >= meta.resolveTime) {
            let outcome: number | null = null; // 0 = YES, 1 = NO
            if (meta.eventType === "nba") {
                const nbaStatus = await fetchNBAStatus(meta.eventId);
                if (nbaStatus === "Final") {
                    // fetch final score to decide outcome
                    const resp = await axios.get(`https://www.balldontlie.io/api/v1/games/${meta.eventId}`);
                    const game = resp.data;
                    outcome = game.home_team_score > game.visitor_team_score ? 0 : 1;
                }
            } else if (meta.eventType === "weather") {
                const temp = await fetchWeatherTemp(meta);
                if (temp !== null) {
                    outcome = temp > 30 ? 0 : 1; // YES if >30°C
                }
            } else if (meta.eventType === "crypto") {
                const price = await fetchCryptoPrice();
                outcome = price > 30000 ? 0 : 1; // YES if >30k USD
            }

            if (outcome !== null) {
                console.log(`✅ Resolving market: ${question} → ${outcome === 0 ? "YES" : "NO"}`);
                // Set result in Oracle then resolve market (adjust if your contract differs)
                await oracle.setResult(meta.marketAddress, outcome);
                await market.resolve();
                // Mark as resolved locally
                meta.resolved = true;
                saveStore();
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
