'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { formatUnits } from 'viem';

const MARKET_FACTORY_ABI = [
    {
        inputs: [],
        name: 'getMarketCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export function useMarketStats() {
    // Get total market count
    const { data: marketCount } = useReadContract({
        address: CONTRACT_ADDRESSES.MarketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarketCount',
    });

    const activeMarkets = marketCount ? Number(marketCount) : 0;

    return {
        totalVolume: '$0.00', // TODO: Aggregate from market events
        activeMarkets: activeMarkets.toString(),
        totalTraders: '0', // TODO: Track unique addresses from events
        avgAccuracy: '0%', // TODO: Calculate from resolved markets
    };
}
