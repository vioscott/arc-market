'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect, usePublicClient, useBalance } from 'wagmi';
import Link from 'next/link';
import { usePortfolio, Position } from '@/hooks/usePortfolio';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { parseUnits, formatUnits } from 'viem';
import WalletOptionsModal from '@/components/WalletOptionsModal';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';

const MARKET_ABI = [
    {
        inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        name: 'redeemShares',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint8', name: 'outcome', type: 'uint8' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'minPayout', type: 'uint256' }
        ],
        name: 'sellShares',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint8', name: 'outcome', type: 'uint8' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        name: 'calculatePayout',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const publicClient = usePublicClient();

    // Get USDC Balance
    const { data: usdcBalance } = useBalance({
        address: address,
        chainId: arcTestnetChain.id,
        token: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    });

    const [activeTab, setActiveTab] = useState<'active' | 'redeemable' | 'history'>('active');
    // ... (lines 53-129 implied unchanged by jumping to end of block) ...
    // Note: I cannot use "..." in replacement. I must replace a contiguous block.
    // Since the hook is at the top and calculation is at the bottom, I should invoke this tool TWICE or use multi_replace.
    // I will execute this tool for the TOP part (Hook) now.

    const [mounted, setMounted] = useState(false);
    const [showWalletOptions, setShowWalletOptions] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null); // marketId-outcome

    const { positions, redeemable, isLoading, refetch } = usePortfolio();

    // Transaction State
    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Refresh on success
    useEffect(() => {
        if (isSuccess) {
            setProcessingId(null);
            refetch?.();
        }
    }, [isSuccess, refetch]);

    // Clear processing on error
    useEffect(() => {
        if (writeError) {
            setProcessingId(null);
            console.error("Transaction failed:", writeError);
        }
    }, [writeError]);

    const handleRedeem = (marketAddress: string, shares: number) => {
        try {
            const amount = parseUnits(shares.toFixed(18), 18); // Use toFixed to avoid scientific notation
            writeContract({
                address: marketAddress as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'redeemShares',
                args: [amount],
            });
        } catch (error) {
            console.error("Redemption failed:", error);
        }
    };

    const handleSell = async (position: Position) => {
        if (!publicClient) return;

        const id = `${position.marketId}-${position.outcome}`;
        setProcessingId(id);

        try {
            // 1. Calculate Payout
            const amount = parseUnits(position.shares.toFixed(18), 18);
            const outcomeId = position.outcome === 'YES' ? 0 : 1;

            // @ts-ignore
            const payout = await publicClient.readContract({
                address: position.marketAddress as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'calculatePayout',
                args: [outcomeId, amount]
            }) as bigint;

            // 2. Set minPayout with 1% slippage
            const minPayout = payout * BigInt(99) / BigInt(100);

            // 3. Sell
            writeContract({
                address: position.marketAddress as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'sellShares',
                args: [outcomeId, amount, minPayout],
            });

        } catch (error) {
            console.error("Sell failed:", error);
            setProcessingId(null);
        }
    };

    const positionValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const cashBalance = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;
    const totalValue = positionValue + cashBalance;

    if (!mounted || !isConnected) {
        return (
            <div className="min-h-screen py-12 sm:py-20">
                <div className="container-mobile">
                    <div className="max-w-2xl mx-auto card text-center py-12 sm:py-20">
                        <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Connect Your Wallet</h2>
                        <p className="text-dark-muted mb-8">
                            Connect your wallet to view your portfolio and trading history
                        </p>
                        <button
                            className="btn btn-primary text-lg px-8 py-4"
                            onClick={() => connect({ connector: connectors[0] })}
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 sm:py-12">
            <div className="container-mobile">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
                        Portfolio
                    </h1>
                    <p className="text-lg text-dark-muted font-mono">
                        {address?.slice(0, 10)}...{address?.slice(-8)}
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Total Value</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary-400">
                            ${totalValue.toFixed(2)}
                            <span className="text-xs font-normal text-dark-muted block mt-1">
                                ${cashBalance.toFixed(2)} Cash • ${positionValue.toFixed(2)} Active
                            </span>
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Active Positions</p>
                        <p className="text-2xl sm:text-3xl font-bold">
                            {positions.length}
                        </p>
                    </div>
                    {/* ... other stats */}
                </div>

                {/* Tabs */}
                <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`tap-target flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'active'
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'bg-dark-card text-dark-muted hover:bg-dark-border'
                                }`}
                        >
                            Active Positions
                        </button>
                        <button
                            onClick={() => setActiveTab('redeemable')}
                            className={`tap-target flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'redeemable'
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'bg-dark-card text-dark-muted hover:bg-dark-border'
                                }`}
                        >
                            Redeemable ({redeemable.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`tap-target flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'history'
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'bg-dark-card text-dark-muted hover:bg-dark-border'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-dark-muted">Loading portfolio...</p>
                    </div>
                )}

                {/* Active Positions */}
                {!isLoading && activeTab === 'active' && (
                    <div className="space-y-4">
                        {positions.map((position) => (
                            <div key={`${position.marketId}-${position.outcome}`} className="card border dark:border-dark-border">
                                <Link href={`/market/${position.marketId}`} className="block mb-4">
                                    <h3 className="text-lg font-bold mb-2 hover:text-primary-400 transition-colors">{position.question}</h3>
                                </Link>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <span className={`px-3 py-1 rounded-lg font-semibold ${position.outcome === 'YES'
                                                ? 'bg-yes/20 text-yes'
                                                : 'bg-no/20 text-no'
                                                }`}>
                                                {position.outcome}
                                            </span>
                                            <span className="text-dark-muted">
                                                {position.shares.toFixed(2)} shares @ {(position.currentPrice * 100).toFixed(1)}¢
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-dark-muted mb-1">Value</p>
                                            <p className="text-xl font-bold">${position.value.toFixed(2)}</p>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleSell(position);
                                            }}
                                            disabled={!!processingId || isPending || isConfirming}
                                            className="btn bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {processingId === `${position.marketId}-${position.outcome}`
                                                ? 'Selling...'
                                                : 'Cancel Buy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {positions.length === 0 && (
                            <div className="card text-center py-12">
                                <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">No active positions</h3>
                                <p className="text-dark-muted mb-6">
                                    Start trading to see your positions here
                                </p>
                                <Link href="/markets" className="btn btn-primary inline-block">
                                    Browse Markets
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Redeemable - Same as before */}
                {!isLoading && activeTab === 'redeemable' && (
                    <div className="space-y-4">
                        {isSuccess && !processingId && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg mb-4">
                                Transaction successful!
                            </div>
                        )}

                        {redeemable.map((position) => (
                            <div key={`${position.marketId}-${position.outcome}`} className="card">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-2">{position.question}</h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="px-3 py-1 rounded-lg bg-yes/20 text-yes font-semibold">
                                                Won: {position.winningOutcome}
                                            </span>
                                            <span className="text-dark-muted">
                                                {position.shares.toFixed(2)} shares
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-sm text-dark-muted mb-1">Payout</p>
                                            <p className="text-2xl font-bold text-yes">
                                                ${position.payout?.toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRedeem(position.marketAddress, position.shares)}
                                            disabled={isPending || isConfirming}
                                            className="btn btn-yes px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPending || isConfirming ? 'Processing...' : 'Redeem'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {redeemable.length === 0 && (
                            <div className="card text-center py-12">
                                <h3 className="text-xl font-bold mb-2">No redeemable positions</h3>
                            </div>
                        )}
                    </div>
                )}

                {/* History */}
                {!isLoading && activeTab === 'history' && (
                    <div className="space-y-4">
                        <HistoryList userAddress={address} />
                    </div>
                )}

            </div>

            <WalletOptionsModal
                isOpen={showWalletOptions}
                onClose={() => setShowWalletOptions(false)}
                connectors={connectors}
                connect={connect}
            />
        </div>
    );
}

function HistoryList({ userAddress }: { userAddress?: string }) {
    const { history, loading } = useTransactionHistory(userAddress);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-dark-muted">Loading history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-dark-muted">No transaction history found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((item, i) => (
                <div key={i} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${item.type === 'BUY' ? 'bg-green-500/20 text-green-500' :
                            item.type === 'SELL' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                            }`}>
                            {item.type === 'BUY' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <div className="font-bold">
                                {item.type} {item.outcome} Shares
                            </div>
                            <div className="text-sm text-dark-muted">
                                Market #{item.marketId} • {new Date(item.timestamp * 1000).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">
                            {item.shares.toFixed(2)} Shares
                        </div>
                        <a
                            href={`https://testnet.arcscan.app/tx/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-400 hover:text-primary-300"
                        >
                            View Transaction ↗
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
