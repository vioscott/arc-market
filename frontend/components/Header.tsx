'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useAccount } from 'wagmi';
import WalletButton from './WalletButton';
import { FAUCET_URLS } from '@/config/wagmi';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isConnected } = useAccount();

    const navigation = [
        { name: 'Markets', href: '/markets' },
        { name: 'Create', href: '/create' },
        { name: 'Portfolio', href: '/portfolio' },
        { name: 'Docs', href: '/docs' },
    ];

    return (
        <header className="sticky top-0 z-50 glass border-b border-dark-border/50">
            <nav className="container-mobile py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105">
                            <NextImage
                                src="/arc-logo.svg"
                                alt="Arc Markets"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="hidden sm:block font-display text-xl font-bold text-gradient">
                            Arc Markets
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-dark-muted hover:text-dark-text transition-colors font-medium"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Faucet Button - Mobile optimized */}
                        <a
                            href={FAUCET_URLS.circle}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="hidden lg:inline">Get Testnet USDC</span>
                            <span className="lg:hidden">Faucet</span>
                        </a>

                        {/* Wallet Button */}
                        <WalletButton />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden tap-target p-2 rounded-lg hover:bg-dark-card transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6 text-dark-text"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-dark-border pt-4 animate-slide-down">
                        <div className="flex flex-col gap-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="tap-target px-4 py-3 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-card transition-all font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Mobile Faucet Link */}
                            <a
                                href={FAUCET_URLS.circle}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tap-target px-4 py-3 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all font-medium text-center"
                            >
                                Get Testnet USDC
                            </a>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
