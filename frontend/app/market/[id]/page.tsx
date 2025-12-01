'use client';

import Link from 'next/link';
import TradingPanel from '@/components/TradingPanel';

export default function MarketDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Mock data - will be replaced with real contract data
    const market = {
        id: parseInt(id),
        question: 'Will Bitcoin reach $100,000 by end of 2025?',
        description: 'This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange (Coinbase, Binance, Kraken) before December 31, 2025 23:59:59 UTC.',
        category: 'Crypto',
        sourceUrl: 'https://coinmarketcap.com/currencies/bitcoin/',
        creator: '0x1234...5678',
        createdAt: new Date('2025-01-01'),
        closeTime: new Date('2025-12-31'),
        yesPrice: 0.65,
        noPrice: 0.35,
        volume: 12500,
        liquidity: 5000,
        yesShares: 3250,
        noShares: 1750,
        resolved: false,
    };

    const timeRemaining = market.closeTime.getTime() - Date.now();
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen py-6 sm:py-12">
            <div className="container-mobile">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-dark-muted">
                    <Link href="/markets" className="hover:text-primary-400 transition-colors">
                        Markets
                    </Link>
                    <span>/</span>
                    <span className="text-dark-text">{market.category}</span>
                </div>

                {/* Mobile Layout: Stack on small screens */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="card">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold">
                                    {market.category}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-dark-bg text-dark-muted text-sm">
                                    {daysRemaining} days remaining
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4">
                                {market.question}
                            </h1>

                            <p className="text-dark-muted mb-6 leading-relaxed">
                                {market.description}
                            </p>

                            {/* Source Link */}
                            <a
                                href={market.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Source
                            </a>
                        </div>

                        {/* Price Chart Placeholder */}
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Price History</h3>
                            <div className="aspect-video bg-dark-bg rounded-xl flex items-center justify-center text-dark-muted">
                                <div className="text-center">
                                    <div className="text-4xl mb-2 flex justify-center">
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <p>Price chart coming soon</p>
                                </div>
                            </div>
                        </div>

                        {/* Market Stats */}
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Market Statistics</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-dark-muted mb-1">Total Volume</p>
                                    <p className="text-xl font-bold">${market.volume.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-muted mb-1">Liquidity</p>
                                    <p className="text-xl font-bold">${market.liquidity.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-muted mb-1">YES Shares</p>
                                    <p className="text-xl font-bold text-yes">{market.yesShares.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-muted mb-1">NO Shares</p>
                                    <p className="text-xl font-bold text-no">{market.noShares.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Market Info */}
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Market Information</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-dark-border">
                                    <span className="text-dark-muted">Creator</span>
                                    <a
                                        href={`https://testnet.arcscan.app/address/${market.creator}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-primary-400 hover:text-primary-300"
                                    >
                                        {market.creator}
                                    </a>
                                </div>
                                <div className="flex justify-between py-2 border-b border-dark-border">
                                    <span className="text-dark-muted">Created</span>
                                    <span className="font-semibold">{market.createdAt.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-dark-border">
                                    <span className="text-dark-muted">Closes</span>
                                    <span className="font-semibold">{market.closeTime.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-dark-muted">Status</span>
                                    <span className="font-semibold text-yes">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Trades - Mobile Optimized Table */}
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-dark-border">
                                            <th className="text-left py-3 px-4 text-dark-muted font-medium">Outcome</th>
                                            <th className="text-left py-3 px-4 text-dark-muted font-medium">Shares</th>
                                            <th className="text-left py-3 px-4 text-dark-muted font-medium">Price</th>
                                            <th className="text-left py-3 px-4 text-dark-muted font-medium">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-dark-border/50">
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded bg-yes/20 text-yes font-semibold">YES</span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">100</td>
                                            <td className="py-3 px-4">65¢</td>
                                            <td className="py-3 px-4 text-dark-muted">2 min ago</td>
                                        </tr>
                                        <tr className="border-b border-dark-border/50">
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded bg-no/20 text-no font-semibold">NO</span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold">50</td>
                                            <td className="py-3 px-4">35¢</td>
                                            <td className="py-3 px-4 text-dark-muted">5 min ago</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Trading Panel - Sticky on desktop, inline on mobile */}
                    <div className="lg:col-span-1">
                        <TradingPanel
                            marketId={market.id}
                            yesPrice={market.yesPrice}
                            noPrice={market.noPrice}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
