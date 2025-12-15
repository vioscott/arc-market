# Arc Prediction Market - User Guide

## 1. Getting Started on Testnet

To trade on the Arc Prediction Market (Testnet), you need two things:
1.  **Arc ETH (`ARC`)**: This is the "Gas" token used to pay for transaction fees on the network.
2.  **USDC (`MockUSDC`)**: This is the "Betting" token used to buy and sell shares.

### Step 1: Connect your Wallet
1.  Click **"Connect Wallet"** in the top right corner.
2.  Select MetaMask or WalletConnect.
3.  Ensure you are on the **Arc Testnet**. The app will prompt you to switch if needed.

### Step 2: Get Gas (Arc ETH)
You cannot do anything without Gas.
1.  Go to the official **Arc Testnet Faucet** (https://faucet.arc.network - *example URL, replace with actual if known*).
2.  Enter your wallet address.
3.  Request **ARC ETH**.
4.  Wait for the transaction to complete.

### Step 3: Get Betting Funds (USDC)
We use a mock USDC token for testing. **You cannot use real USDC.**
1.  Click on your **Wallet Address** button in the top right corner of the app.
2.  If your balance is **below 100 USDC**, you will see a blue button: **"Get 1000 USDC (Testnet)"**.
3.  Click it and confirm the transaction in your wallet.
4.  Wait a few seconds. Your balance in the button should update to ~1000 USDC.

---

## 2. How to Trade

### Buying Shares
1.  Select a Market (e.g., "Will Nuggets beat Celtics?").
2.  Choose your outcome: **YES** or **NO**.
3.  Enter the amount of **USDC** you want to invest (e.g., 100).
    *   The UI will estimate how many shares you will get.
4.  Click **"Buy YES Shares"**.
5.  **Approve USDC**: First time only. You permit the contract to spend your USDC.
6.  **Confirm Trade**: Confirm the actual buy transaction.
7.  Success! You now own positions.

### Selling / Redeeming
1.  Go to **"Portfolio"**.
2.  You will see your **Active Positions**.
3.  (Selling feature is coming soon).
4.  **Redeeming**: If a market resolves and you won, the position moves to **"Redeemable"**.
5.  Click **"Redeem"** to swap your winning shares back for USDC (1 Share = 1 USDC).

---

## 3. Viewing History
You can check your past transactions in the **Portfolio** tab, under **"History"**.
This pulls data directly from the **ArcScan Explorer**, ensuring you see exactly what happened on-chain.
