import { http, createConfig } from 'wagmi';
import { arcTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Arc Testnet chain configuration
export const arcTestnetChain = {
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: {
        decimals: 6,
        name: 'USDC',
        symbol: 'USDC',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.arc.network'],
        },
        public: {
            http: ['https://rpc.testnet.arc.network'],
        },
    },
    blockExplorers: {
        default: {
            name: 'ArcScan',
            url: 'https://testnet.arcscan.app',
        },
    },
    testnet: true,
} as const;

// Contract addresses (will be populated after deployment)
export const CONTRACT_ADDRESSES = {
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '',
    Oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '',
    OutcomeToken: process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || '',
};

// Wagmi configuration
const connectors = [injected()];

// Only add WalletConnect if project ID is provided
if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID !== 'demo') {
    connectors.push(
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        })
    );
}

export const config = createConfig({
    chains: [arcTestnetChain],
    connectors,
    transports: {
        [arcTestnetChain.id]: http(),
    },
});

// Faucet URLs
export const FAUCET_URLS = {
    circle: 'https://faucet.circle.com/',
    omnihub: 'https://omnihub.xyz/faucet',
};
