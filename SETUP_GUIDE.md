# Arc Prediction Market dApp - Complete Setup Guide

This guide covers the full setup of the Arc Prediction Market dApp, including smart contracts, frontend, and automated market generation.

---

## 1️⃣ Prerequisites

- **Node.js** (v18 or later)
- **Git**
- **MetaMask** (or any Web3 wallet) configured for **Arc Testnet**:
  - **RPC URL**: `https://rpc.testnet.arc.network`
  - **Chain ID**: `5042002` (0x4cef52)
  - **Currency**: `USDC` (Native Token)
- **USDC Faucet**: Obtain testnet USDC from the Arc faucet.

---

## 2️⃣ Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd arc-prediction-market
    ```

2.  **Install Dependencies:**
    ```bash
    # Install root/contract dependencies
    npm install

    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    ```

---

## 3️⃣ Smart Contracts

1.  **Configuration:**
    Create `contracts/.env` based on `.env.example`:
    ```env
    PRIVATE_KEY=your_wallet_private_key
    NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
    ```

2.  **Compile:**
    ```bash
    npx hardhat compile
    ```

3.  **Test:**
    ```bash
    npx hardhat test
    ```

4.  **Deploy to Arc Testnet:**
    ```bash
    npx hardhat run contracts/scripts/deploy.js --network arc_testnet
    ```
    *Note the deployed addresses for the next step.*

---

## 4️⃣ Frontend Setup

1.  **Configuration:**
    Create `frontend/.env.local` based on `.env.example`:
    ```env
    NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x... (from deployment)
    NEXT_PUBLIC_ORACLE_ADDRESS=0x... (from deployment)
    NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=0x... (from deployment)
    NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
    ```
    *Also update `contracts/.env` with these addresses for the automation scripts.*

2.  **Run Locally:**
    ```bash
    cd frontend
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

---

## 5️⃣ Automated Market Generation

We use a scheduler to automatically create markets (NBA, Weather, Crypto) and resolve them.

1.  **Local Run:**
    ```bash
    # From project root
    node contracts/scripts/scheduleAutoMarkets.js
    ```
    This runs a cron job:
    - **Hourly**: Creates new markets.
    - **Every 5 mins**: Updates/resolves existing markets.

2.  **More Details:**
    See [MARKET_AUTOGEN_GUIDE.md](./MARKET_AUTOGEN_GUIDE.md) for deep dive into the automation logic and APIs.

---

## 6️⃣ Deployment

### Frontend (Vercel)
1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Set **Root Directory** to `frontend`.
4.  Add Environment Variables (from `frontend/.env.local`).
5.  Deploy.

### Automated Scheduler (Vercel Cron)
The project is configured to run the scheduler as a Vercel Serverless Function.

1.  Ensure `frontend/vercel.json` exists with the cron configuration.
2.  Ensure `frontend/pages/api/runScheduler.ts` exists.
3.  Vercel will automatically detect the cron job and trigger the API route hourly.

---

## 7️⃣ Troubleshooting

-   **Build Errors**: Try cleaning the build folder: `rm -rf .next` (or `rmdir /s /q .next` on Windows) and restart.
-   **404 Errors**: Ensure you are running the server from the `frontend` directory.
-   **Contract Errors**: Verify you have enough USDC for gas fees on Arc Testnet.

---

**Enjoy building on Arc!** 🚀
