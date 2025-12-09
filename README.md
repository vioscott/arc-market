# Arc Prediction Market

A decentralized prediction market application built on **Arc Testnet**, allowing users to trade YES/NO shares on real-world events using testnet USDC.

![Arc Prediction Market](https://img.shields.io/badge/Network-Arc%20Testnet-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **Real-World Events**: Trade on crypto prices, sports, politics, economics, and more
- **Testnet Only**: 100% free - uses Arc Testnet USDC from faucets
- **LMSR Automated Market Maker**: Logarithmic Market Scoring Rule for fair pricing
- **Mobile-First Design**: Fully responsive, touch-optimized interface
- **Multi-Sig Oracle**: Secure event resolution with time-locks and dispute mechanisms
- **ERC1155 Outcome Tokens**: Efficient YES/NO share representation

## 🏗️ Architecture

### Smart Contracts

- **OutcomeToken.sol**: ERC1155 contract for YES/NO outcome shares
- **Market.sol**: Individual prediction market with LMSR AMM pricing
- **MarketFactory.sol**: Factory for creating and managing markets
- **Oracle.sol**: Multi-signature oracle for secure event resolution

### Frontend

- **Next.js 14**: React framework with App Router
- **Wagmi v2**: React hooks for Ethereum
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Arc Testnet USDC (free from faucet)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd arc-testnet

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Copy environment variables**:
```bash
cp .env.example .env
```

2. **Add your private key** to `.env`:
```
PRIVATE_KEY=your_private_key_here
```

3. **Get testnet USDC**:
- Circle Faucet: https://faucet.circle.com/
- OmniHub Faucet: https://omnihub.xyz/faucet

### Deploy Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Arc Testnet
npx hardhat run scripts/deploy.js --network arcTestnet
```

### Run Frontend

```bash
cd frontend

# Development server
npm run dev

# Open http://localhost:3000
```

## 📱 Mobile-First Design

This application is built with **mobile responsiveness as the top priority**:

- ✅ Touch-optimized tap targets (minimum 44x44px)
- ✅ Horizontal scrolling for categories on mobile
- ✅ Stacked layouts for small screens
- ✅ Responsive grids (1 column → 2 → 3)
- ✅ Mobile-friendly dropdowns and modals
- ✅ Optimized font sizes and spacing
- ✅ Fast loading with code splitting

## 🔗 Arc Testnet Details

- **Chain ID**: 5042002 (0x4cef52)
- **RPC URL**: https://rpc.testnet.arc.network
- **Explorer**: https://testnet.arcscan.app
- **Native Currency**: USDC (6 decimals)
- **Faucets**:
  - Circle: https://faucet.circle.com/ (1 USDC/hour)
  - OmniHub: https://omnihub.xyz/faucet (5 USDC/24h)

### Add Arc Testnet to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter the following:
   - **Network Name**: Arc Testnet
   - **RPC URL**: https://rpc.testnet.arc.network
   - **Chain ID**: 5042002
   - **Currency Symbol**: USDC
   - **Block Explorer**: https://testnet.arcscan.app

## 📖 How It Works

### For Traders

1. **Connect Wallet**: Connect MetaMask to Arc Testnet
2. **Get USDC**: Request free testnet USDC from faucet
3. **Browse Markets**: Explore prediction markets by category
4. **Trade**: Buy YES or NO shares based on your prediction
5. **Wait**: Markets resolve when events occur
6. **Redeem**: Exchange winning shares for 1 USDC each

### For Market Creators

1. **Create Market**: Define question, source, and close time
2. **Add Liquidity**: Deposit initial USDC for LMSR liquidity
3. **Set Parameters**: Configure liquidity parameter (b)
4. **Launch**: Market goes live for trading
5. **Resolution**: Oracle resolves market when event concludes

## 🧮 LMSR Pricing

The Logarithmic Market Scoring Rule (LMSR) automatically calculates prices:

```
Cost(q) = b × ln(e^(q_yes/b) + e^(q_no/b))
Price_yes = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
```

Where:
- `b` = liquidity parameter (higher = more stable prices)
- `q_yes` = outstanding YES shares
- `q_no` = outstanding NO shares

## 🔐 Security Features

- **Multi-Sig Oracle**: Requires multiple confirmations for resolution
- **Time-Lock**: Delay period before resolution is final
- **Dispute Mechanism**: Community can challenge incorrect resolutions
- **Reentrancy Protection**: All state-changing functions protected
- **Access Control**: Role-based permissions for critical functions

## 📁 Project Structure

```
arc-testnet/
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity files
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   └── hardhat.config.js  # Hardhat configuration
├── frontend/              # Next.js application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
└── docs/                  # Documentation
```

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Frontend

```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.js --network arcTestnet
```

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Arc Network**: https://arc.network
- **Arc Testnet Explorer**: https://testnet.arcscan.app
- **Documentation**: [Coming Soon]
- **Discord**: [Coming Soon]

## ⚠️ Disclaimer

This is a **testnet application** for educational and experimental purposes only. No real money is involved. All transactions use testnet USDC which has no monetary value.

---

Built on Arc Testnet
