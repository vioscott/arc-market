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
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xaDA9DA1024cA6b103Bdc773FA0D1978FF4d082Eb',
    MarketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x48EDa99aD2d590d53457a8a426CAEe6c3324bBE0',
    Oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '0xc591fEAc5AB3959131532dcFf5C8b9F80Ce26Ea0',
    OutcomeToken: process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS || '0xd6061d14c1E4fB002243513bA14B892B52347613',
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
