'use client';

import { useState } from 'react';
import MarketCard from '@/components/MarketCard';
import { useMarkets } from '@/hooks/useMarkets';

const CATEGORIES = [
    { id: 'All', label: 'All Markets', icon: '📊' },
    { id: 'Crypto', label: 'Crypto', icon: '₿' },
    { id: 'Sports', label: 'Sports', icon: '⚽' },
    { id: 'Politics', label: 'Politics', icon: '🏛️' },
    { id: 'Economics', label: 'Economics', icon: '📈' },
    { id: 'Technology', label: 'Technology', icon: '💻' },
];

const SORT_OPTIONS = [
    { value: 'volume', label: 'Highest Volume' },
    { value: 'newest', label: 'Newest' },
    { value: 'closing', label: 'Closing Soon' },
];

export default function MarketsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('volume');

    const { markets, loading, error } = useMarkets({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
    });

    // Sort markets
    const sortedMarkets = [...markets].sort((a, b) => {
        if (sortBy === 'volume') {
            return Number(b.volume || 0) - Number(a.volume || 0);
        } else if (sortBy === 'newest') {
            return b.createdAt - a.createdAt;
        } else if (sortBy === 'closing') {
            return a.closeTime - b.closeTime;
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Prediction Markets
                    </h1>
                    <p className="text-lg text-gray-400">
                        Trade on real-world events with testnet USDC
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#141b2e] border border-[#1e293b] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${selectedCategory === category.id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-[#141b2e] text-gray-400 hover:bg-[#1e293b] hover:text-white border border-[#1e293b]'
                                }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.label}</span>
                        </button>
                    ))}
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-400">
                        Showing <span className="text-white font-semibold">{sortedMarkets.length}</span> markets
                    </p>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-[#141b2e] border border-[#1e293b] text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Markets Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="text-red-400 mb-2">Error loading markets</div>
                        <div className="text-gray-500 text-sm">{error}</div>
                    </div>
                ) : sortedMarkets.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📊</div>
                        <div className="text-xl text-gray-400 mb-2">No markets found</div>
                        <div className="text-gray-500">Try adjusting your filters or search</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMarkets.map((market) => (
                            <MarketCard
                                key={market.marketId}
                                marketId={market.marketId}
                                marketAddress={market.marketAddress}
                                question={market.question}
                                category={market.category}
                                closeTime={market.closeTime}
                                yesShares={market.yesShares || '0'}
                                noShares={market.noShares || '0'}
                                volume={market.volume || '0'}
                                status={market.status}
                                winningOutcome={market.winningOutcome}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
