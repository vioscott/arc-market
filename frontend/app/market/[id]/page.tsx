'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TradingPanel from '@/components/TradingPanel';
import ClaimPanel from '@/components/ClaimPanel';
import { useMarket } from '@/hooks/useMarket';
import { formatTimeRemaining, getMarketStatus, formatPrice } from '@/utils/ammCalculations';
import type { Market } from '@/hooks/useMarkets';

export default function MarketDetailPage() {
    const params = useParams();
    const marketId = params ? parseInt(params.id as string) : 0;
    const [market, setMarket] = useState<Market | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMarket() {
            try {
                const response = await fetch(`/api/markets`);
                const data = await response.json();
                const found = data.markets.find((m: Market) => m.marketId === marketId);
                setMarket(found || null);
            } catch (error) {
                console.error('Error fetching market:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMarket();
    }, [marketId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!market) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❓</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Market Not Found</h1>
                    <Link href="/markets" className="text-blue-400 hover:text-blue-300">
                        ← Back to Markets
                    </Link>
                </div>
            </div>
        );
    }

    const yesPrice = market.yesPrice || 0.5;
    const noPrice = market.noPrice || 0.5;
    const timeRemaining = formatTimeRemaining(market.closeTime);
    const marketStatus = getMarketStatus(market.closeTime, market.status === 'resolved');

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            Crypto: 'from-orange-500 to-yellow-500',
            Sports: 'from-blue-500 to-cyan-500',
            Politics: 'from-purple-500 to-pink-500',
            Economics: 'from-green-500 to-emerald-500',
            Technology: 'from-indigo-500 to-blue-500',
        };
        return colors[cat] || 'from-gray-500 to-slate-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link
                    href="/markets"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Markets
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Market Header */}
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(market.category)} text-white font-medium text-sm`}>
                                    {market.category}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{timeRemaining}</span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4">{market.question}</h1>

                            {market.sourceUrl && (
                                <a
                                    href={market.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Source
                                </a>
                            )}
                        </div>

                        {/* Current Prices */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl p-6">
                                <div className="text-sm text-gray-400 mb-2">YES</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">{formatPrice(yesPrice)}</div>
                                <div className="text-sm text-gray-400">{(yesPrice * 100).toFixed(1)}% chance</div>
                            </div>
                            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl p-6">
                                <div className="text-sm text-gray-400 mb-2">NO</div>
                                <div className="text-4xl font-bold text-red-400 mb-2">{formatPrice(noPrice)}</div>
                                <div className="text-sm text-gray-400">{(noPrice * 100).toFixed(1)}% chance</div>
                            </div>
                        </div>

                        {/* Market Stats */}
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Market Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Volume</div>
                                    <div className="text-xl font-bold text-white">${(Number(market.volume || 0) / 1e6).toFixed(0)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Liquidity</div>
                                    <div className="text-xl font-bold text-white">${(Number(market.liquidityParameter || 0) / 1e18).toFixed(0)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Status</div>
                                    <div className={`text-xl font-bold ${marketStatus === 'active' ? 'text-blue-400' : marketStatus === 'closed' ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {marketStatus.charAt(0).toUpperCase() + marketStatus.slice(1)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Created</div>
                                    <div className="text-xl font-bold text-white">
                                        {new Date(market.createdAt * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {marketStatus === 'resolved' && market.winningOutcome !== null ? (
                            <ClaimPanel
                                marketAddress={market.marketAddress as `0x${string}`}
                                winningOutcome={market.winningOutcome}
                                userYesShares={BigInt(0)}
                                userNoShares={BigInt(0)}
                                onClaim={async () => { }}
                                isPending={false}
                            />
                        ) : (
                            <TradingPanel
                                marketId={market.marketId}
                                yesPrice={yesPrice}
                                noPrice={noPrice}
                                onTradeSuccess={(cost) => {
                                    // Optimistically update volume
                                    // Volume in DB is stored as raw USDC units (6 decimals)
                                    setMarket((prev) => {
                                        if (!prev) return null;
                                        const currentVol = BigInt(prev.volume || 0);
                                        const newVol = currentVol + cost;
                                        return {
                                            ...prev,
                                            volume: newVol.toString()
                                        };
                                    });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
