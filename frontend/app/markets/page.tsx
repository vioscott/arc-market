'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MarketCard from '@/components/MarketCard';

function MarketsContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('volume');

    // Update category if URL changes
    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setSelectedCategory(category);
        }
    }, [searchParams]);

    const categories = [
        {
            id: 'all',
            name: 'All Markets',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'crypto',
            name: 'Crypto',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'sports',
            name: 'Sports',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'politics',
            name: 'Politics',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            id: 'economics',
            name: 'Economics',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            )
        },
        {
            id: 'technology',
            name: 'Technology',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
    ];

    // Mock data - will be replaced with real data from contracts
    const mockMarkets = [
        {
            id: 1,
            question: 'Will Bitcoin reach $100,000 by end of 2025?',
            category: 'Crypto',
            yesPrice: 0.65,
            noPrice: 0.35,
            volume: 12500,
            liquidity: 5000,
            closeTime: new Date('2025-12-31'),
            resolved: false,
        },
        {
            id: 2,
            question: 'Will Ethereum merge to Proof of Stake succeed?',
            category: 'Crypto',
            yesPrice: 0.82,
            noPrice: 0.18,
            volume: 8900,
            liquidity: 3500,
            closeTime: new Date('2025-06-30'),
            resolved: false,
        },
        {
            id: 3,
            question: 'Will the Lakers win the NBA Championship?',
            category: 'Sports',
            yesPrice: 0.42,
            noPrice: 0.58,
            volume: 15200,
            liquidity: 6000,
            closeTime: new Date('2025-07-15'),
            resolved: false,
        },
    ];

    const filteredMarkets = mockMarkets.filter((market) => {
        const matchesCategory = selectedCategory === 'all' || market.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen py-8 sm:py-12">
            <div className="container-mobile">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
                        Prediction Markets
                    </h1>
                    <p className="text-lg text-dark-muted">
                        Trade on real-world events with testnet USDC
                    </p>
                </div>

                {/* Search Bar - Mobile Optimized */}
                <div className="mb-6 sm:mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-12"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Category Filter - Horizontal Scroll on Mobile */}
                <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`tap-target flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === category.id
                                    ? 'bg-primary-500 text-white shadow-glow'
                                    : 'bg-dark-card text-dark-muted hover:bg-dark-border'
                                    }`}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options - Mobile Dropdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <p className="text-dark-muted">
                        Showing <span className="font-semibold text-dark-text">{filteredMarkets.length}</span> markets
                    </p>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input w-full sm:w-auto"
                    >
                        <option value="volume">Highest Volume</option>
                        <option value="liquidity">Highest Liquidity</option>
                        <option value="closing">Closing Soon</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>

                {/* Markets Grid - Responsive */}
                {filteredMarkets.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredMarkets.map((market) => (
                            <MarketCard key={market.id} {...market} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12 sm:py-20">
                        <div className="text-6xl mb-4 flex justify-center text-dark-muted">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No markets found</h3>
                        <p className="text-dark-muted mb-6">
                            Try adjusting your filters or create a new market
                        </p>
                        <a href="/create" className="btn btn-primary inline-block">
                            Create Market
                        </a>
                    </div>
                )}

                {/* Load More - Mobile Friendly */}
                {filteredMarkets.length > 0 && (
                    <div className="mt-8 sm:mt-12 text-center">
                        <button className="btn btn-secondary px-8 py-3">
                            Load More Markets
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MarketsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <MarketsContent />
        </Suspense>
    );
}
