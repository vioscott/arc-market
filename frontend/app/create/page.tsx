'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function CreateMarketPage() {
    const { isConnected } = useAccount();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        question: '',
        description: '',
        category: 'crypto',
        sourceUrl: '',
        closeDate: '',
        closeTime: '',
        liquidityParameter: '1000',
        initialLiquidity: '100',
    });

    const categories = [
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
        {
            id: 'entertainment',
            name: 'Entertainment',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
            )
        },
        {
            id: 'weather',
            name: 'Weather',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
            )
        },
        {
            id: 'science',
            name: 'Science',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            )
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        setIsCreating(true);

        // TODO: Implement actual market creation
        setTimeout(() => {
            setIsCreating(false);
            alert('Market created successfully!');
            router.push('/markets');
        }, 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen py-8 sm:py-12">
            <div className="container-mobile max-w-4xl">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
                        Create Prediction Market
                    </h1>
                    <p className="text-lg text-dark-muted">
                        Launch a new market for others to trade on real-world events
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question */}
                    <div className="card">
                        <label className="block text-lg font-bold mb-2">
                            Market Question *
                        </label>
                        <p className="text-sm text-dark-muted mb-4">
                            Ask a clear yes/no question about a future event
                        </p>
                        <input
                            type="text"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            placeholder="Will Bitcoin reach $100,000 by end of 2025?"
                            className="input"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="card">
                        <label className="block text-lg font-bold mb-2">
                            Description *
                        </label>
                        <p className="text-sm text-dark-muted mb-4">
                            Provide details on how the market will be resolved
                        </p>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="This market resolves to YES if Bitcoin reaches or exceeds $100,000 USD on any major exchange before the closing date..."
                            className="input min-h-[120px] resize-y"
                            required
                        />
                    </div>

                    {/* Category & Source */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="card">
                            <label className="block text-lg font-bold mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="card">
                            <label className="block text-lg font-bold mb-2">
                                Source URL *
                            </label>
                            <p className="text-sm text-dark-muted mb-4">
                                Link to verify the outcome
                            </p>
                            <input
                                type="url"
                                name="sourceUrl"
                                value={formData.sourceUrl}
                                onChange={handleChange}
                                placeholder="https://coinmarketcap.com/..."
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    {/* Close Date & Time */}
                    <div className="card">
                        <label className="block text-lg font-bold mb-4">
                            Market Close Date & Time *
                        </label>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-dark-muted mb-2">Date</label>
                                <input
                                    type="date"
                                    name="closeDate"
                                    value={formData.closeDate}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-muted mb-2">Time (UTC)</label>
                                <input
                                    type="time"
                                    name="closeTime"
                                    value={formData.closeTime}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Advanced Settings</h3>
                            <span className="text-sm text-dark-muted">Optional</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">
                                    Liquidity Parameter (b)
                                </label>
                                <p className="text-xs text-dark-muted mb-2">
                                    Higher values = more stable prices, lower values = more responsive to trades
                                </p>
                                <input
                                    type="number"
                                    name="liquidityParameter"
                                    value={formData.liquidityParameter}
                                    onChange={handleChange}
                                    placeholder="1000"
                                    className="input"
                                    min="100"
                                    step="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-muted mb-2">
                                    Initial Liquidity (USDC)
                                </label>
                                <p className="text-xs text-dark-muted mb-2">
                                    Amount of USDC to deposit for initial market liquidity
                                </p>
                                <input
                                    type="number"
                                    name="initialLiquidity"
                                    value={formData.initialLiquidity}
                                    onChange={handleChange}
                                    placeholder="100"
                                    className="input"
                                    min="10"
                                    step="10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="card bg-primary-500/5 border-primary-500/20">
                        <h3 className="text-lg font-bold mb-4">Market Preview</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-dark-muted">Question:</span>
                                <span className="font-semibold text-right max-w-md">
                                    {formData.question || 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-muted">Category:</span>
                                <span className="font-semibold capitalize">{formData.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-muted">Closes:</span>
                                <span className="font-semibold">
                                    {formData.closeDate && formData.closeTime
                                        ? `${formData.closeDate} ${formData.closeTime} UTC`
                                        : 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-muted">Initial Liquidity:</span>
                                <span className="font-semibold">{formData.initialLiquidity} USDC</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            disabled={!isConnected || isCreating}
                            className="btn btn-primary text-lg py-4 flex-1"
                        >
                            {isCreating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Market...
                                </span>
                            ) : !isConnected ? (
                                'Connect Wallet to Create'
                            ) : (
                                'Create Market'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-secondary text-lg py-4 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="card bg-dark-bg border-dark-border">
                        <div className="flex gap-3">
                            <div className="text-2xl text-primary-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-sm text-dark-muted">
                                <p className="font-semibold text-dark-text mb-2">Tips for creating a good market:</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Ask clear, unambiguous yes/no questions</li>
                                    <li>Provide a reliable source for verification</li>
                                    <li>Set a reasonable closing date</li>
                                    <li>Include specific resolution criteria in the description</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
