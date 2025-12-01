# Deployment Guide: Arc Prediction Market on Vercel

This guide walks you through deploying the Arc Prediction Market dApp to Vercel, including obtaining all necessary environment variables.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Arc Testnet wallet with USDC for contract deployment

---

## Part 1: Deploy Smart Contracts to Arc Testnet

### Step 1: Set Up Environment Variables for Contracts

1. Navigate to the `contracts` directory
2. Create a `.env` file:
   ```bash
   cd contracts
   cp ../.env.example .env
   ```

3. Edit `.env` and add your private key:
   ```env
   PRIVATE_KEY=your_private_key_here
   ARC_TESTNET_RPC=https://rpc.testnet.arc.network
   ```

> [!CAUTION]
> **Never commit your private key to git!** The `.env` file is already in `.gitignore`.

**How to get your private key:**
- **MetaMask**: Settings → Security & Privacy → Show Private Key
- **Other wallets**: Check your wallet's export/backup options

### Step 2: Install Dependencies and Deploy

```bash
npm install
npx hardhat run scripts/deploy.js --network arcTestnet
```

### Step 3: Save Contract Addresses

After deployment, you'll see output like:
```
✅ Deployed OutcomeToken: 0x1234...
✅ Deployed Oracle: 0x5678...
✅ Deployed MarketFactory: 0x9abc...
```

**Save these addresses** - you'll need them for the frontend!

---

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `vioscott/arc-market`
4. Click **"Import"**

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS` | Contract address from deployment | From Part 1, Step 3 |
| `NEXT_PUBLIC_ORACLE_ADDRESS` | Contract address from deployment | From Part 1, Step 3 |
| `NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS` | Contract address from deployment | From Part 1, Step 3 |

**Example:**
```env
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x9abc...
NEXT_PUBLIC_ORACLE_ADDRESS=0x5678...
NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=0x1234...
```

> [!IMPORTANT]
> All frontend environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

## Part 4: Post-Deployment Configuration



### Test Your Deployment

1. Visit your Vercel URL
2. Click **"Connect Wallet"**
3. Connect with MetaMask or WalletConnect
4. Verify your USDC balance shows correctly
5. Try browsing markets and the trading interface

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS` | MarketFactory contract address | `0x9abc...` |
| `NEXT_PUBLIC_ORACLE_ADDRESS` | Oracle contract address | `0x5678...` |
| `NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS` | OutcomeToken contract address | `0x1234...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_DOCS_URL` | Custom docs URL | `/docs` |

---

## Updating Your Deployment

### When You Make Code Changes

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. Vercel will automatically rebuild and deploy

### When Contract Addresses Change

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the contract address variables
3. Click **"Redeploy"** to rebuild with new variables

---

## Troubleshooting

### "Wallet shows 0.00 USDC"

- Make sure you're connected to **Arc Testnet** (Chain ID: 5042002)
- USDC is the native currency on Arc Testnet
- Get testnet USDC from [Circle Faucet](https://faucet.circle.com/)



### "Contract interaction fails"

- Verify all three contract addresses are set correctly
- Make sure contracts are deployed to Arc Testnet
- Check that your wallet is on the correct network

### "Build fails on Vercel"

- Check that **Root Directory** is set to `frontend`
- Verify all environment variables are set
- Check build logs for specific errors

---

## Next Steps

- **Create Markets**: Use the "Create" page to set up prediction markets
- **Add Liquidity**: Markets need initial USDC liquidity to function
- **Test Trading**: Try buying YES/NO shares with testnet USDC
- **Monitor**: Use [ArcScan](https://testnet.arcscan.app) to view transactions

---

## Support

- **Arc Testnet Docs**: [docs.arc.network](https://docs.arc.network)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
