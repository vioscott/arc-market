'use client';

import Link from 'next/link';
import { FAUCET_URLS } from '@/config/wagmi';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section - Mobile Optimized */}
            <section className="relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-bg to-dark-bg" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <div className="relative container-mobile py-12 sm:py-20 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 sm:mb-8 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                            <span className="text-sm font-medium text-primary-400">Live on Arc Testnet</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-4 sm:mb-6 animate-slide-up">
                            Trade on{' '}
                            <span className="text-gradient">Real-World Events</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-dark-muted mb-8 sm:mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Decentralized prediction markets powered by Arc Testnet.
                            Buy and sell YES/NO shares on crypto, sports, politics, and more.
                        </p>

                        {/* CTA Buttons - Mobile Stacked */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Link href="/create" className="btn btn-primary text-lg px-8 py-4 text-center">
                                Create Market
                            </Link>
                            <a
                                href={FAUCET_URLS.circle}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary text-lg px-8 py-4 text-center"
                            >
                                Get Free USDC
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-20 bg-dark-card/30">
                <div className="container-mobile">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-center mb-12 sm:mb-16">
                        How It Works
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                ),
                                title: 'Connect Wallet',
                                description: 'Connect your MetaMask or WalletConnect wallet to Arc Testnet',
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: 'Get Testnet USDC',
                                description: 'Request free testnet USDC from the faucet - no real money needed',
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                ),
                                title: 'Browse Markets',
                                description: 'Explore prediction markets on crypto, sports, politics, and more',
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                ),
                                title: 'Trade YES/NO',
                                description: 'Buy shares based on your prediction. Prices reflect market probability',
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: 'Wait for Resolution',
                                description: 'Markets resolve when the event occurs or deadline passes',
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: 'Redeem Winnings',
                                description: 'If you predicted correctly, redeem your shares for 1 USDC each',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="card-hover group">
                                <div className="text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-dark-muted">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Market Categories */}
            <section className="py-12 sm:py-20">
                <div className="container-mobile">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-center mb-12 sm:mb-16">
                        Market Categories
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { name: 'Crypto', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'from-orange-500 to-yellow-500' },
                            { name: 'Sports', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'from-green-500 to-emerald-500' },
                            { name: 'Politics', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: 'from-blue-500 to-indigo-500' },
                            { name: 'Economics', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>, color: 'from-purple-500 to-pink-500' },
                            { name: 'Technology', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: 'from-cyan-500 to-blue-500' },
                            { name: 'Entertainment', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>, color: 'from-red-500 to-rose-500' },
                            { name: 'Weather', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>, color: 'from-sky-500 to-blue-500' },
                            { name: 'Science', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, color: 'from-teal-500 to-green-500' },
                        ].map((category, i) => (
                            <Link
                                key={i}
                                href="/create"
                                className="card-hover group text-center"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                                    {category.icon}
                                </div>
                                <p className="font-semibold">{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-20 bg-gradient-to-br from-primary-900/20 to-dark-bg">
                <div className="container-mobile">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
                            Ready to Start Trading?
                        </h2>
                        <p className="text-lg sm:text-xl text-dark-muted mb-8">
                            Get free testnet USDC and start predicting real-world events today.
                            No risk, no real money required.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/create" className="btn btn-primary text-lg px-8 py-4 text-center">
                                Create Market
                            </Link>
                            <Link href="/portfolio" className="btn btn-secondary text-lg px-8 py-4 text-center">
                                View Portfolio
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
