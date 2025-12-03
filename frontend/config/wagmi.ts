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
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x7B661633B83Cb0FfCE227b3F498Be904429917a3',
    Oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '0x6174dd78631FE0c01f06Cb0036f4245d212Be3dB',
    OutcomeToken: process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || '0xE652e73b0c98d3A6d14F3e29aB5879130fc471De',
};

// Wagmi configuration
export const config = createConfig({
    chains: [arcTestnetChain],
    connectors: [injected()],
    transports: {
        [arcTestnetChain.id]: http(),
    },
});

// Faucet URLs
export const FAUCET_URLS = {
    circle: 'https://faucet.circle.com/',
    omnihub: 'https://omnihub.xyz/faucet',
};
