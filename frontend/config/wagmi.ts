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
    USDC: '0x3600000000000000000000000000000000000000',
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0xe1737Ad3fac808BdC874BaBE05bAD9586D9D23D9',
    Oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '0x45c23e335580b8A43478Fa89Daa31B5a133B5B84',
    OutcomeToken: process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || '0x69741e2dB9472A5FcD2B4Ec3Ac48003b8e6CcAD6',
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
