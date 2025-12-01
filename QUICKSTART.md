# 🚀 Quick Start Guide - Arc Prediction Market

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MetaMask browser extension
- ✅ Basic understanding of Web3/crypto

## Step 1: Get Testnet USDC

1. **Add Arc Testnet to MetaMask**:
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Currency Symbol: `USDC`
   - Block Explorer: `https://testnet.arcscan.app`

2. **Request Testnet USDC**:
   - Visit: https://faucet.circle.com/
   - Or: https://omnihub.xyz/faucet
   - Request 1-5 USDC (free, every 24 hours)

## Step 2: Run the Application

### Option A: Frontend Only (Mock Data)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Option B: Full Stack (With Contracts)

```bash
# 1. Deploy contracts
cd contracts
npm install
cp ../.env.example .env
# Edit .env and add your PRIVATE_KEY

npx hardhat compile
npx hardhat run scripts/deploy.js --network arcTestnet

# 2. Update frontend config
cd ../frontend
cp ../.env.example .env
# Add deployed contract addresses to .env

npm install
npm run dev
```

## Step 3: Start Trading!

1. **Connect Wallet**: Click "Connect Wallet" in the top right
2. **Browse Markets**: Navigate to "Markets" page
3. **Make a Prediction**: Click on a market
4. **Trade**: Select YES or NO, enter amount, click "Buy Shares"
5. **Track Portfolio**: View your positions in "Portfolio"

## 🎯 What You Can Do

- ✅ Browse prediction markets by category
- ✅ Trade YES/NO shares on real-world events
- ✅ Create your own markets
- ✅ View your portfolio and P&L
- ✅ Redeem winning shares

## 📱 Mobile Testing

The app is **mobile-first**! Test on:
- 📱 iPhone/Android (Chrome/Safari)
- 📱 Tablet (iPad, Android tablets)
- 💻 Desktop (any browser)

## 🔧 Troubleshooting

### "Wrong Network" Error
- Make sure you're connected to Arc Testnet in MetaMask
- Chain ID should be `5042002`

### "Insufficient USDC" Error
- Request more testnet USDC from the faucet
- Wait 24 hours between requests

### Contract Not Found
- Make sure you've deployed the contracts
- Update contract addresses in `frontend/.env`

### npm install Errors
- Try: `rm -rf node_modules package-lock.json`
- Then: `npm install` again

## 📚 Learn More

- [Full Documentation](./docs/DEVELOPER_GUIDE.md)
- [Arc Network](https://arc.network)
- [Arc Testnet Explorer](https://testnet.arcscan.app)

## 💡 Tips

- Start with small amounts (1-10 USDC)
- Prices update automatically (LMSR)
- All transactions are on testnet (no real money!)
- Markets resolve when events occur
- Winning shares = 1 USDC each

---

**Happy Trading! 🎉**
