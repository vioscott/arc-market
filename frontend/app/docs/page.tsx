'use client';

import React from 'react';

export default function DocsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 gradient-text">Arc Prediction Market - User Guide</h1>

            <div className="space-y-12">
                {/* Section 1: Getting Started */}
                <section className="card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm">1</span>
                        Getting Started on Testnet
                    </h2>
                    <p className="text-gray-400">
                        To trade on the Arc Prediction Market (Testnet), you need two things:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li><strong className="text-orange-400">Arc ETH (`ARC`)</strong>: This is the &quot;Gas&quot; token used to pay for transaction fees on the network.</li>
                        <li><strong className="text-blue-400">USDC (`MockUSDC`)</strong>: This is the &quot;Betting&quot; token used to buy and sell shares.</li>
                    </ul>

                    <div className="grid md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
                            <h3 className="font-bold text-white mb-2">Step 1: Connect</h3>
                            <p className="text-sm text-gray-400">Click <strong>&quot;Connect Wallet&quot;</strong>. Ensure you are on the <strong>Arc Testnet</strong>.</p>
                        </div>
                        <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
                            <h3 className="font-bold text-white mb-2">Step 2: Get Gas</h3>
                            <p className="text-sm text-gray-400">Visit the <a href="https://faucet.circle.com/" target="_blank" className="text-blue-400 hover:underline">Arc Testnet Faucet</a> to get ARC USDC for fees.</p>
                        </div>
                        <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
                            <h3 className="font-bold text-white mb-2">Step 3: Get USDC</h3>
                            <p className="text-sm text-gray-400">Click your <strong>Wallet Address</strong> top-right. If your balance is low, click <strong>&quot;Get 1000 USDC&quot;</strong>.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: How to Trade */}
                <section className="card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm">2</span>
                        How to Trade
                    </h2>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Buying Shares</h3>
                        <ol className="list-decimal list-inside space-y-3 text-gray-300 ml-4">
                            <li>Select a Market (e.g., &quot;Will Nuggets beat Celtics?&quot;).</li>
                            <li>Choose your outcome: <strong className="text-yes">YES</strong> or <strong className="text-no">NO</strong>.</li>
                            <li>Enter the amount of <strong>USDC</strong> you want to invest.</li>
                            <li>Click <strong>&quot;Buy Shares&quot;</strong>.</li>
                            <li><strong>Approve USDC</strong> (First time only) & Confirm the transaction.</li>
                        </ol>
                    </div>

                    <div className="border-t border-dark-border pt-6 mt-6 space-y-4">
                        <h3 className="text-xl font-semibold text-white">Selling / Redeeming</h3>
                        <ol className="list-decimal list-inside space-y-3 text-gray-300 ml-4">
                            <li>Go to <strong>&quot;Portfolio&quot;</strong> to view your positions.</li>
                            <li>If a market resolves and you won, the position moves to <strong>&quot;Redeemable&quot;</strong>.</li>
                            <li>Click <strong>&quot;Redeem&quot;</strong> to swap your winning shares back for USDC (1 Share = 1 USDC).</li>
                        </ol>
                    </div>
                </section>

                {/* Section 3: History */}
                <section className="card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 text-sm">3</span>
                        Viewing History
                    </h2>
                    <p className="text-gray-400">
                        You can check your past transactions in the <strong>Portfolio</strong> tab, under <strong>&quot;History&quot;</strong>.
                        <br />
                        This pulls data directly from the <strong className="text-blue-400">ArcScan Explorer</strong>, ensuring you see exactly what happened on-chain.
                    </p>
                </section>
            </div>
        </div>
    );
}
