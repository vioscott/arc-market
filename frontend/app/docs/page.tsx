export default function DocsPage() {
    return (
        <div className="min-h-screen py-8 sm:py-12">
            <div className="container-mobile max-w-4xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-8">
                    Documentation
                </h1>

                <div className="space-y-8">
                    {/* Getting Started */}
                    <section className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-primary-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">Getting Started</h2>
                        </div>
                        <div className="space-y-4 text-dark-muted">
                            <div>
                                <h3 className="font-semibold text-dark-text mb-2">1. Connect Your Wallet</h3>
                                <p>Click "Connect Wallet" and select MetaMask or WalletConnect. Make sure you're on Arc Testnet.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-dark-text mb-2">2. Get Testnet USDC</h3>
                                <p>Visit the Circle Faucet or OmniHub to get free testnet USDC. You can request 1-5 USDC every 24 hours.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-dark-text mb-2">3. Start Trading</h3>
                                <p>Browse markets, select YES or NO, enter your amount, and execute the trade!</p>
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-primary-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">How It Works</h2>
                        </div>
                        <div className="space-y-4 text-dark-muted">
                            <p>
                                Arc Prediction Market uses a Logarithmic Market Scoring Rule (LMSR) automated market maker to price YES/NO outcome shares.
                            </p>
                            <p>
                                When you buy shares, the price increases. When you sell, the price decreases. Prices always reflect the market's collective probability estimate.
                            </p>
                            <p>
                                When a market resolves, winning shares can be redeemed for 1 USDC each. Losing shares become worthless.
                            </p>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-primary-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">FAQ</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Is this real money?</h3>
                                <p className="text-dark-muted">No! This is 100% testnet. All USDC is testnet currency with no real value.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">How are markets resolved?</h3>
                                <p className="text-dark-muted">Markets are resolved by a multi-signature oracle system with time-locks and dispute mechanisms.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Can I create my own market?</h3>
                                <p className="text-dark-muted">Yes! Click "Create" and fill out the form. You'll need to provide initial liquidity.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
