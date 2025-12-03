'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'active' | 'redeemable' | 'history'>('active');
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock data - will be replaced with real contract data
    const mockPositions = [
        {
            marketId: 1,
            question: 'Will Bitcoin reach $100,000 by end of 2025?',
            outcome: 'YES',
            shares: 100,
            avgPrice: 0.65,
            currentPrice: 0.68,
            value: 68,
            pnl: 3,
            pnlPercent: 4.6,
        },
        {
            marketId: 2,
            question: 'Will Ethereum merge succeed?',
            outcome: 'NO',
            shares: 50,
            avgPrice: 0.18,
            currentPrice: 0.15,
            value: 7.5,
            pnl: -1.5,
            pnlPercent: -16.7,
        },
    ];

    const mockRedeemable = [
        {
            marketId: 3,
            question: 'Did the Lakers win?',
            outcome: 'YES',
            shares: 75,
            winningOutcome: 'YES',
            payout: 75,
        },
    ];

    const mockHistory = [
        {
            id: 1,
            type: 'BUY',
            market: 'Will Bitcoin reach $100,000?',
            outcome: 'YES',
            shares: 100,
            price: 0.65,
            total: 65,
            timestamp: new Date('2025-01-15'),
        },
        {
            id: 2,
            type: 'SELL',
            market: 'Will Ethereum merge succeed?',
            outcome: 'NO',
            shares: 25,
            price: 0.16,
            total: 4,
            timestamp: new Date('2025-01-14'),
        },
    ];

    const totalValue = mockPositions.reduce((sum, pos) => sum + pos.value, 0);
    const totalPnL = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);

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
                        <p className={`text-2xl sm:text-3xl font-bold ${totalPnL >= 0 ? 'text-yes' : 'text-no'}`}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Active Positions</p>
                        <p className="text-2xl sm:text-3xl font-bold">
                            {mockPositions.length}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-dark-muted mb-1">Redeemable</p>
                        <p className="text-2xl sm:text-3xl font-bold text-yes">
                            {mockRedeemable.length}
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
                            Redeemable ({mockRedeemable.length})
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

                {/* Active Positions */}
                {activeTab === 'active' && (
                    <div className="space-y-4">
                        {mockPositions.map((position) => (
                            <div key={position.marketId} className="card-hover">
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
                                                    {position.shares} shares @ {(position.avgPrice * 100).toFixed(1)}¢
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                            <div className="flex-1 sm:flex-none">
                                                <p className="text-sm text-dark-muted mb-1">Value</p>
                                                <p className="text-xl font-bold">${position.value.toFixed(2)}</p>
                                            </div>
                                            <div className="flex-1 sm:flex-none">
                                                <p className="text-sm text-dark-muted mb-1">P&L</p>
                                                <p className={`text-xl font-bold ${position.pnl >= 0 ? 'text-yes' : 'text-no'}`}>
                                                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                                    <span className="text-sm ml-1">
                                                        ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {mockPositions.length === 0 && (
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
                {activeTab === 'redeemable' && (
                    <div className="space-y-4">
                        {mockRedeemable.map((position) => (
                            <div key={position.marketId} className="card">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-2">{position.question}</h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="px-3 py-1 rounded-lg bg-yes/20 text-yes font-semibold">
                                                Won: {position.winningOutcome}
                                            </span>
                                            <span className="text-dark-muted">
                                                {position.shares} shares
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-sm text-dark-muted mb-1">Payout</p>
                                            <p className="text-2xl font-bold text-yes">
                                                ${position.payout.toFixed(2)}
                                            </p>
                                        </div>
                                        <button className="btn btn-yes px-6 py-3">
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {mockRedeemable.length === 0 && (
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
                {activeTab === 'history' && (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dark-border">
                                    <th className="text-left py-3 px-2 text-dark-muted font-medium">Type</th>
                                    <th className="text-left py-3 px-2 text-dark-muted font-medium">Market</th>
                                    <th className="text-left py-3 px-2 text-dark-muted font-medium">Outcome</th>
                                    <th className="text-right py-3 px-2 text-dark-muted font-medium">Shares</th>
                                    <th className="text-right py-3 px-2 text-dark-muted font-medium">Price</th>
                                    <th className="text-right py-3 px-2 text-dark-muted font-medium">Total</th>
                                    <th className="text-right py-3 px-2 text-dark-muted font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockHistory.map((trade) => (
                                    <tr key={trade.id} className="border-b border-dark-border/50 hover:bg-dark-bg/50">
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.type === 'BUY'
                                                ? 'bg-yes/20 text-yes'
                                                : 'bg-no/20 text-no'
                                                }`}>
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 max-w-xs truncate">{trade.market}</td>
                                        <td className="py-3 px-2">{trade.outcome}</td>
                                        <td className="py-3 px-2 text-right font-semibold">{trade.shares}</td>
                                        <td className="py-3 px-2 text-right">{(trade.price * 100).toFixed(1)}¢</td>
                                        <td className="py-3 px-2 text-right font-semibold">${trade.total.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-right text-dark-muted">
                                            {trade.timestamp.toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {mockHistory.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">No trading history</h3>
                                <p className="text-dark-muted">
                                    Your trades will appear here
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
