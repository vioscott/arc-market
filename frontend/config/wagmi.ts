import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

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
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0xa52e6618a12E5932256cC0C9EAc5Efd2C34C70Af',
    Oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '0xf9f08F485363B603Ce021CEEF7B4C2f0bc180ac9',
    OutcomeToken: process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || '0x83C754b59cEa49F441602DfF046806f273675b20',
};

// Wagmi configuration
export const config = createConfig({
    chains: [arcTestnetChain],
    connectors: [
        injected(),
    ],
    transports: {
        [arcTestnetChain.id]: http(),
    },
});

// Faucet URLs
export const FAUCET_URLS = {
    circle: 'https://faucet.circle.com/',
    omnihub: 'https://omnihub.xyz/faucet',
};
