'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Link from 'next/link';
import { usePortfolio } from '@/hooks/usePortfolio';
import { parseUnits } from 'viem';

const MARKET_ABI = [
    {
        inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        name: 'redeemShares',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'active' | 'redeemable' | 'history'>('active');
    const [mounted, setMounted] = useState(false);

    const { positions, redeemable, isLoading } = usePortfolio();

    // Redemption State
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRedeem = (marketAddress: string, shares: number) => {
        try {
            // Convert shares to 18 decimals (wei)
            // Note: shares from hook are already formatted numbers, so we need to parse back
            // But better to keep BigInt in hook? For now, let's assume precision is fine for UI actions
            // or just redeem all.
            // Actually, redeemShares takes uint256 amount.
            // Let's use a safe conversion or fetch raw balance if needed.
            // For MVP, parsing the number back to string is okay if we handle decimals carefully.
            // Or better: just pass the raw BigInt from the hook if we exposed it.
            // Since we didn't expose raw BigInt, let's re-parse.
            const amount = parseUnits(shares.toString(), 18);

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

    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    // P&L calculation is tricky without historical cost basis. 
    // For MVP, we might show current value only or assume cost basis if we tracked it (we don't yet).
    // So let's just show Value for now and hide P&L or set to 0.
    const totalPnL = 0;

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
                        <button className="btn btn-primary text-lg px-8 py-4">
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

                {/* Stats Cards - Mobile Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Total Value</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary-400">
                            ${totalValue.toFixed(2)}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Total P&L</p>
                        <p className="text-2xl sm:text-3xl font-bold text-dark-muted">
                            --
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Active Positions</p>
                        <p className="text-2xl sm:text-3xl font-bold">
                            {positions.length}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Redeemable</p>
                        <p className="text-2xl sm:text-3xl font-bold text-yes">
                            {redeemable.length}
                        </p>
                    </div>
                </div>

                {/* Tabs - Mobile Horizontal Scroll */}
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
                            <div key={`${position.marketId}-${position.outcome}`} className="card-hover">
                                <Link href={`/market/${position.marketId}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold mb-2 line-clamp-1">{position.question}</h3>
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
                                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                            <div className="flex-1 sm:flex-none">
                                                <p className="text-sm text-dark-muted mb-1">Value</p>
                                                <p className="text-xl font-bold">${position.value.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
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

                {/* Redeemable */}
                {!isLoading && activeTab === 'redeemable' && (
                    <div className="space-y-4">
                        {isSuccess && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg mb-4">
                                Redemption successful! Check your wallet balance.
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
                                            {isPending || isConfirming ? 'Redeeming...' : 'Redeem'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {redeemable.length === 0 && (
                            <div className="card text-center py-12">
                                <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">No redeemable positions</h3>
                                <p className="text-dark-muted">
                                    Winning positions will appear here when markets resolve
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* History */}
                {!isLoading && activeTab === 'history' && (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Transaction History</h3>
                        <p className="text-dark-muted">
                            Coming soon: View your full trading history
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
