import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const MARKET_ABI = [
    {
        inputs: [],
        name: 'question',
        outputs: [{ type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'yesShares',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'noShares',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'outcome', type: 'uint8' }],
        name: 'getPrice',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'outcome', type: 'uint8' }, { name: 'amount', type: 'uint256' }],
        name: 'buy',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'outcome', type: 'uint8' }, { name: 'amount', type: 'uint256' }],
        name: 'sell',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'redeem',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export function useMarket(marketAddress: `0x${string}`) {
    // Read market data
    const { data: question } = useReadContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'question',
    });

    const { data: yesShares } = useReadContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'yesShares',
    });

    const { data: noShares } = useReadContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'noShares',
    });

    const { data: yesPrice } = useReadContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'getPrice',
        args: [0],
    });

    const { data: noPrice } = useReadContract({
        address: marketAddress,
        abi: MARKET_ABI,
        functionName: 'getPrice',
        args: [1],
    });

    // Write functions
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const buyShares = async (outcome: 'yes' | 'no', amount: string) => {
        const outcomeIndex = outcome === 'yes' ? 0 : 1;
        writeContract({
            address: marketAddress,
            abi: MARKET_ABI,
            functionName: 'buy',
            args: [outcomeIndex, parseEther(amount)],
        });
    };

    const sellShares = async (outcome: 'yes' | 'no', amount: string) => {
        const outcomeIndex = outcome === 'yes' ? 0 : 1;
        writeContract({
            address: marketAddress,
            abi: MARKET_ABI,
            functionName: 'sell',
            args: [outcomeIndex, parseEther(amount)],
        });
    };

    const redeemWinnings = async () => {
        writeContract({
            address: marketAddress,
            abi: MARKET_ABI,
            functionName: 'redeem',
        });
    };

    return {
        question,
        yesShares,
        noShares,
        yesPrice,
        noPrice,
        buyShares,
        sellShares,
        redeemWinnings,
        isPending: isPending || isConfirming,
        isSuccess,
    };
}
