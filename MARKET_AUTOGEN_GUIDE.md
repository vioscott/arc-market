# Auto‑Market Generation & Update Guide

This guide walks you through the **complete process** of setting up the automated market creation and resolution pipeline for the Arc Prediction Market dApp.

---

## 1️⃣ Prerequisites

| Requirement | Action |
|------------|--------|
| **Node.js (≥ 18)** | Install from <https://nodejs.org> and verify with `node -v`. |
| **Hardhat project** | You already have `contracts/` with `hardhat.config.js`. |
| **Deployed contracts** | MarketFactory, Oracle, OutcomeToken are deployed on Arc Testnet (addresses in `.env`). |
| **Environment variables** | Ensure `contracts/.env` contains:
```
PRIVATE_KEY=your_private_key
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x…
NEXT_PUBLIC_ORACLE_ADDRESS=0x…
NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
```
| **Free APIs** | No API keys needed – scripts use balldontlie (NBA), open‑meteo (weather) and coingecko (crypto). |

---

## 2️⃣ Install Required Packages
```bash
# From the project root (c:\Users\SCOTT\Downloads\arc testnet)
npm i axios node-cron
```
- `axios` – HTTP client for the free APIs.
- `node‑cron` – Simple scheduler used by the wrapper script.

---

## 3️⃣ Verify the Scripts
| Script | Location | What it does |
|--------|----------|--------------|
| `autoCreateMarkets.js` | `contracts/scripts/autoCreateMarkets.js` | Pulls upcoming NBA games, temperature forecasts for a few major cities, and Bitcoin price. Creates a 24 h market for each event via `MarketFactory`. |
| `updateMarkets.js` | `contracts/scripts/updateMarkets.js` | Runs frequently, checks each open market: closes entry when the event starts and resolves it after the event ends (NBA final score, temperature > 30 °C, BTC > 30 k). Updates the Oracle and calls `market.resolve()`. |
| `scheduleAutoMarkets.js` | `contracts/scripts/scheduleAutoMarkets.js` | Starts a cron job: **hourly** → `autoCreateMarkets.js`; **every 5 min** → `updateMarkets.js`. |

You can open them in any editor to inspect the logic.

---

## 4️⃣ Run the Scheduler (Local Development)
```bash
node contracts/scripts/scheduleAutoMarkets.js
```
You should see console output similar to:
```
▶️ Running autoCreateMarkets...
✅ Market created: Will Los Angeles Lakers beat Boston Celtics on 12/5/2025? → 0xAbc...
▶️ Running updateMarkets...
⏰ Closing market: …
✅ Resolving market: … → YES
```
The process will keep running, creating new markets each hour and updating existing ones every 5 minutes.

---

## 5️⃣ Deploy the Scheduler (Production Options)
### Vercel (Serverless)
1. Add a cron job in `vercel.json`:
```json
{ "crons": [{ "path": "/api/runScheduler", "schedule": "0 * * * *" }] }
```
2. Create `pages/api/runScheduler.ts` that executes the two scripts via `child_process.execSync`.
3. Deploy – Vercel will invoke the endpoint hourly, which spawns the internal cron timers.

### GitHub Actions
Create `.github/workflows/auto‑markets.yml`:
```yaml
name: Auto Markets
on:
  schedule:
    - cron: '0 * * * *'   # hourly
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install deps
        run: npm ci
      - name: Run scripts
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          NEXT_PUBLIC_MARKET_FACTORY_ADDRESS: ${{ secrets.MARKET_FACTORY }}
          NEXT_PUBLIC_ORACLE_ADDRESS: ${{ secrets.ORACLE }}
          NEXT_PUBLIC_USDC_ADDRESS: ${{ secrets.USDC }}
        run: |
          node contracts/scripts/autoCreateMarkets.js
          node contracts/scripts/updateMarkets.js
```
### Dedicated Server / VPS
Create a systemd service that runs `node contracts/scripts/scheduleAutoMarkets.js` in the background.

---

## 6️⃣ Verify Front‑End Integration
- The market detail page (`app/market/[id]/page.tsx`) reads market data directly from the contracts, so newly created markets appear automatically.
- Optional: add a countdown timer using `market.closeTime` to show “Market ends in …”.

---

## 7️⃣ Troubleshooting Checklist
| Issue | What to check |
|-------|---------------|
| **No new markets** | Confirm `autoCreateMarkets.js` runs (look for console logs). Verify `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS` is correct and the deployer has enough USDC for fees. |
| **Markets never close** | Ensure `updateMarkets.js` runs (log shows “Closing market”). Verify the event’s `startTime` is a proper UNIX timestamp. |
| **Resolution fails** | Look for “Resolving market” logs. Make sure the Oracle’s `setResult(address,uint8)` signature matches the call. |
| **Transaction reverts** | Check the deployer’s USDC balance; the contract may need a small fee to create markets. |
| **API rate‑limit** | Free APIs have limits (e.g., balldontlie 60 req/min). If you hit limits, increase the interval in `scheduleAutoMarkets.js`. |

---

## 8️⃣ Quick Recap (One‑liner)
```bash
npm i axios node-cron && node contracts/scripts/scheduleAutoMarkets.js   # local run
```
Or deploy the same logic via Vercel/GitHub Actions as described above.

You’re now ready to have **live, self‑updating prediction markets** for sports, weather, crypto, and more! 🎉
