
import { useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { formatUnits } from 'viem';

// ABIs
const MARKET_FACTORY_ABI = [
    {
        inputs: [],
        name: 'getMarketCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'offset', type: 'uint256' }, { internalType: 'uint256', name: 'limit', type: 'uint256' }],
        name: 'getMarkets',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

const MARKET_ABI = [
    {
        inputs: [],
        name: 'marketId',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'question',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'state',
        outputs: [{ internalType: 'enum Market.MarketState', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'winningOutcome',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint8', name: 'outcome', type: 'uint8' }],
        name: 'getPrice',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

const OUTCOME_TOKEN_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }, { internalType: 'uint256', name: 'id', type: 'uint256' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export interface Position {
    marketId: number;
    marketAddress: string;
    question: string;
    outcome: 'YES' | 'NO';
    shares: number;
    currentPrice: number;
    value: number;
    winningOutcome?: 'YES' | 'NO' | 'INVALID';
    isRedeemable: boolean;
    payout?: number;
}

export function usePortfolio() {
    const { address } = useAccount();

    // 1. Get total market count
    const { data: marketCount } = useReadContract({
        address: CONTRACT_ADDRESSES.MarketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarketCount',
    });

    // 2. Get all market addresses
    const count = marketCount ? Number(marketCount) : 0;
    const { data: marketAddresses } = useReadContract({
        address: CONTRACT_ADDRESSES.MarketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarkets',
        args: [BigInt(0), BigInt(count)],
        query: {
            enabled: count > 0,
        }
    });

    // 3. Prepare contract reads for all markets
    // We need: MarketId, Question, State, WinningOutcome, Prices, YES Balance, NO Balance
    const contracts: any[] = [];
    // Dedup addresses to prevent duplicate keys
    const uniqueMarketAddresses = marketAddresses ? Array.from(new Set(marketAddresses)) : [];

    if (uniqueMarketAddresses && address) {
        uniqueMarketAddresses.forEach((marketAddr) => {
            // Market details
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'marketId' });
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'question' });
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'state' });
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'winningOutcome' });
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'getPrice', args: [0] }); // YES Price
            contracts.push({ address: marketAddr, abi: MARKET_ABI, functionName: 'getPrice', args: [1] }); // NO Price
        });
    }

    const { data: marketData, isLoading: isLoadingMarkets, refetch: refetchMarkets } = useReadContracts({
        contracts: contracts,
        query: {
            enabled: !!marketAddresses && !!address && marketAddresses.length > 0,
        }
    });

    // 4. Fetch Balances separately (OutcomeToken contract)
    // We need market IDs first to know which token IDs to check, but we can infer them from index if we assume order.
    // Better to use the marketIds returned from step 3, but hooks rules prevent conditional hooks.
    // So we'll do a two-pass or just fetch balances for all potential IDs if we knew them.
    // Actually, we can just construct the balance reads based on the market addresses loop if we assume marketId corresponds to index (which it does in Factory).
    // But let's be safe and use the marketId from the market contract.
    // Since we can't chain hooks dynamically easily without a loading state, we might have to do this in a useEffect or use a second useReadContracts that depends on the first.

    // Alternative: We know token IDs are marketId * 2 and marketId * 2 + 1.
    // If we assume marketId matches the index in the markets array (0, 1, 2...), we can predict token IDs.
    // MarketFactory assigns marketId = markets.length. So yes, index i has marketId i.

    const balanceContracts: any[] = [];
    if (uniqueMarketAddresses && address) {
        uniqueMarketAddresses.forEach((_, index) => {
            const marketId = index; // Assumption based on MarketFactory logic
            balanceContracts.push({
                address: CONTRACT_ADDRESSES.OutcomeToken as `0x${string}`,
                abi: OUTCOME_TOKEN_ABI,
                functionName: 'balanceOf',
                args: [address, BigInt(marketId * 2)]
            });
            balanceContracts.push({
                address: CONTRACT_ADDRESSES.OutcomeToken as `0x${string}`,
                abi: OUTCOME_TOKEN_ABI,
                functionName: 'balanceOf',
                args: [address, BigInt(marketId * 2 + 1)]
            });
        });
    }

    const { data: balanceData, isLoading: isLoadingBalances, refetch: refetchBalances } = useReadContracts({
        contracts: balanceContracts,
        query: {
            enabled: !!marketAddresses && !!address && marketAddresses.length > 0,
        }
    });

    // 5. Process and Combine Data
    const positions: Position[] = [];
    const redeemable: Position[] = [];

    if (uniqueMarketAddresses && marketData && balanceData && address) {
        uniqueMarketAddresses.forEach((marketAddr, index) => {
            const baseIndex = index * 6; // 6 calls per market in marketData
            const balanceBaseIndex = index * 2; // 2 calls per market in balanceData

            const marketId = Number(marketData[baseIndex]?.result || 0);
            const question = marketData[baseIndex + 1]?.result as string;
            const state = Number(marketData[baseIndex + 2]?.result || 0); // 0=Active, 1=Closed, 2=Resolved
            const winningOutcomeId = Number(marketData[baseIndex + 3]?.result || 0);
            const yesPrice = Number(formatUnits(marketData[baseIndex + 4]?.result as bigint || BigInt(0), 18));
            const noPrice = Number(formatUnits(marketData[baseIndex + 5]?.result as bigint || BigInt(0), 18));

            const yesBalance = Number(formatUnits(balanceData[balanceBaseIndex]?.result as bigint || BigInt(0), 18));
            const noBalance = Number(formatUnits(balanceData[balanceBaseIndex + 1]?.result as bigint || BigInt(0), 18));

            // YES Position
            if (yesBalance > 0.000001) {
                const isWinner = state === 2 && winningOutcomeId === 0;
                const isRedeemable = isWinner;

                const position: Position = {
                    marketId,
                    marketAddress: marketAddr,
                    question,
                    outcome: 'YES',
                    shares: yesBalance,
                    currentPrice: yesPrice,
                    value: isRedeemable ? yesBalance : yesBalance * yesPrice, // If redeemable, worth 1 USDC each
                    isRedeemable,
                    winningOutcome: state === 2 ? (winningOutcomeId === 0 ? 'YES' : winningOutcomeId === 1 ? 'NO' : 'INVALID') : undefined,
                    payout: isRedeemable ? yesBalance : 0,
                };

                if (state === 2) {
                    if (isRedeemable) redeemable.push(position);
                    // Also show in active/history? Maybe just redeemable.
                } else {
                    positions.push(position);
                }
            }

            // NO Position
            if (noBalance > 0.000001) {
                const isWinner = state === 2 && winningOutcomeId === 1;
                const isRedeemable = isWinner;

                const position: Position = {
                    marketId,
                    marketAddress: marketAddr,
                    question,
                    outcome: 'NO',
                    shares: noBalance,
                    currentPrice: noPrice,
                    value: isRedeemable ? noBalance : noBalance * noPrice,
                    isRedeemable,
                    winningOutcome: state === 2 ? (winningOutcomeId === 0 ? 'YES' : winningOutcomeId === 1 ? 'NO' : 'INVALID') : undefined,
                    payout: isRedeemable ? noBalance : 0,
                };

                if (state === 2) {
                    if (isRedeemable) redeemable.push(position);
                } else {
                    positions.push(position);
                }
            }
        });
    }

    // Debug logging
    useEffect(() => {
        if (address) {
            console.log('Portfolio Debug:', {
                isLoadingMarkets,
                isLoadingBalances,
                marketCount: marketCount?.toString(),
                marketAddressesLength: marketAddresses?.length,
                marketDataLength: marketData?.length,
                balanceDataLength: balanceData?.length,
                positionsLength: positions.length,
            });

            if (balanceData && balanceData.length > 0) {
                balanceData.forEach((b: any, i: number) => {
                    // Check if 'result' or 'error' exists
                    if (b.status === 'success' && Number(b.result) > 0) {
                        console.log(`Balance Found: Index ${i}, Val ${b.result}, Formatted: ${formatUnits(b.result, 18)}`);
                    } else if (b.status === 'failure') {
                        console.error(`Balance Fetch Failed: Index ${i}`, b.error);
                    }
                });
            }
        }
    }, [address, isLoadingMarkets, isLoadingBalances, marketCount, marketAddresses, marketData, balanceData, positions.length]);

    const refetch = () => {
        refetchMarkets();
        refetchBalances();
    };

    return {
        positions,
        redeemable,
        isLoading: isLoadingMarkets || isLoadingBalances,
        refetch,
    };
}
