# Quick Start Guide - Market Generation System

## ✅ Backend Complete
All 16 backend files are created and working:
- Event fetching: ✅ (21 events)
- Validation: ✅ (100% pass rate)
- Scripts: ✅ (all functional)

## ⚠️ Contracts Need Deployment

### Step 1: Deploy Contracts

From the **root directory** (`arc testnet`):

```bash
cd contracts
npx hardhat run scripts/deploy.js --network arcTestnet
```

**Expected Output:**
```
✅ OutcomeToken deployed to: 0x...
✅ Oracle deployed to: 0x...
✅ MarketFactory deployed to: 0x...
```

### Step 2: Update .env File

Copy the addresses from deployment output to `contracts/.env`:

```env
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x... (from deployment)
NEXT_PUBLIC_ORACLE_ADDRESS=0x... (from deployment)
NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=0x... (from deployment)
NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
```

**Remove duplicate entries** - keep only one set of addresses.

### Step 3: Test Market Generation

```bash
# Still in contracts directory
node scripts/autoGenerateMarkets.js
```

**Expected Output:**
```
Events Fetched:    21
Events Valid:      21
Markets Created:   21  ← Should be 21, not 0
Markets Failed:    0
```

### Step 4: Start Automated System (Optional)

```bash
# Runs hourly market generation + 5min monitoring
node scripts/scheduler.js
```

---

## 🐛 Current Issue

**Problem:** MarketFactory address has no deployed code
**Symptom:** `could not decode result data` error
**Solution:** Deploy contracts using Step 1 above

---

## 📝 How to Run Scripts

**Always run from root directory:**
```bash
# ✅ Correct
cd contracts && node scripts/autoGenerateMarkets.js

# ❌ Wrong (causes Hardhat error)
node contracts/scripts/autoGenerateMarkets.js
```

---

## 🔍 Verify Deployment

After deploying, test with:
```bash
cd contracts
node scripts/checkAddresses.js
```

Should show:
```
MarketFactory: Has Code: ✅ YES
Oracle: Has Code: ✅ YES
```

---

## 📞 Need Help?

If deployment fails:
1. Check RPC connection: `https://rpc.testnet.arc.network`
2. Check account balance (needs gas for deployment)
3. Try again later if RPC is down
