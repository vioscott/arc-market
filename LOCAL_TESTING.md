# Local Hardhat Testing Guide

## ✅ Contracts Deployed Successfully!

Your contracts are deployed to a **local Hardhat network**:

```
USDC:            0x5FbDB2315678afecb367f032d93F642f64180aa3
OutcomeToken:    0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Oracle:          0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
MarketFactory:   0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

## 🚀 How to Test

### Option 1: Quick Test (Recommended)

Run everything in one command - this will:
1. Start local Hardhat node
2. Deploy contracts
3. Generate markets
4. Show results

```bash
cd contracts
npx hardhat run scripts/testLocalMarkets.js --network localhost
```

### Option 2: Manual Testing

**Terminal 1 - Start Hardhat Node:**
```bash
cd contracts
npx hardhat node
```
Keep this running!

**Terminal 2 - Deploy & Test:**
```bash
cd contracts
npx hardhat run scripts/deployLocal.js --network localhost
# Copy the addresses from output
# Update .env file
node scripts/autoGenerateMarkets.js
```

## 📊 Expected Results

You should see:
```
Events Fetched:    21
Events Valid:      21
Markets Created:   21  ✅
Markets Failed:    0
```

## 🎯 What This Proves

- ✅ Event fetching works
- ✅ Validation works
- ✅ Market deployment works
- ✅ Database storage works
- ✅ **Complete system is functional!**

## 🌐 For Arc Testnet

Once Arc Testnet RPC is stable, just run:
```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

And update `.env` with those addresses instead.
