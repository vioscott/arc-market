'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';

interface TradingPanelProps {
    marketId: number;
    yesPrice: number;
    noPrice: number;
}

export default function TradingPanel({ marketId, yesPrice, noPrice }: TradingPanelProps) {
    const { address, isConnected } = useAccount();
    const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
    const [amount, setAmount] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    const [isTrading, setIsTrading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    // Get USDC balance (native currency on Arc Testnet)
    const { data: usdcBalance } = useBalance({
        address: address,
        chainId: arcTestnetChain.id,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentPrice = selectedOutcome === 'yes' ? yesPrice : noPrice;
    const estimatedShares = amount ? parseFloat(amount) / currentPrice : 0;
    const estimatedCost = amount ? parseFloat(amount) : 0;
    const potentialReturn = estimatedShares * 1; // 1 USDC per share if correct
    const potentialProfit = potentialReturn - estimatedCost;

    const balance = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;
    const hasInsufficientBalance = estimatedCost > balance;

    const handleMaxClick = () => {
        if (balance > 0) {
            setAmount(balance.toFixed(2));
        }
    };

    const handleTrade = async () => {
        setError('');

        if (!isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (hasInsufficientBalance) {
            setError(`Insufficient balance. You have ${balance.toFixed(2)} USDC`);
            return;
        }

        setIsTrading(true);

        try {
            // TODO: Implement actual contract interaction
            // 1. Approve USDC spending if needed
            // 2. Call market contract to buy shares
            // 3. Wait for transaction confirmation

            // Simulated transaction for now
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success
            alert(`Trade executed! Bought ${estimatedShares.toFixed(2)} ${selectedOutcome.toUpperCase()} shares`);
            setAmount('');
        } catch (err: any) {
            setError(err.message || 'Transaction failed. Please try again.');
        } finally {
            setIsTrading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="card sticky top-24">
                <h3 className="text-xl font-bold mb-6">Trade</h3>
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-dark-bg rounded-xl"></div>
                    <div className="h-12 bg-dark-bg rounded-lg"></div>
                    <div className="h-32 bg-dark-bg rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card sticky top-24">
            <h3 className="text-xl font-bold mb-6">Trade</h3>

            {/* Outcome Selector - Mobile Tabs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => setSelectedOutcome('yes')}
                    className={`tap-target py-4 rounded-xl font-bold transition-all ${selectedOutcome === 'yes'
                        ? 'bg-yes text-white shadow-glow-yes'
                        : 'bg-yes/10 text-yes border border-yes/20'
                        }`}
                >
                    <div className="text-sm mb-1">YES</div>
                    <div className="text-2xl">{(yesPrice * 100).toFixed(0)}¢</div>
                </button>
                <button
                    onClick={() => setSelectedOutcome('no')}
                    className={`tap-target py-4 rounded-xl font-bold transition-all ${selectedOutcome === 'no'
                        ? 'bg-no text-white shadow-glow-no'
                        : 'bg-no/10 text-no border border-no/20'
                        }`}
                >
                    <div className="text-sm mb-1">NO</div>
                    <div className="text-2xl">{(noPrice * 100).toFixed(0)}¢</div>
                </button>
            </div>

            {/* Balance Display */}
            {isConnected && usdcBalance && (
                <div className="mb-4 p-3 rounded-lg bg-dark-bg border border-dark-border">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-dark-muted">Your Balance</span>
                        <span className="font-semibold text-primary-400">
                            {parseFloat(usdcBalance.formatted).toFixed(2)} USDC
                        </span>
                    </div>
                </div>
            )}

            {/* Amount Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-dark-muted mb-2">
                    Amount (USDC)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError('');
                        }}
                        className={`input pr-20 text-lg ${hasInsufficientBalance && amount ? 'border-no' : ''}`}
                        min="0"
                        step="0.01"
                    />
                    <button
                        onClick={handleMaxClick}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors"
                    >
                        MAX
                    </button>
                </div>
                {hasInsufficientBalance && amount && (
                    <p className="mt-2 text-sm text-no">
                        Insufficient balance. You have {balance.toFixed(2)} USDC
                    </p>
                )}
            </div>

            {/* Estimation */}
            {amount && parseFloat(amount) > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-dark-bg border border-dark-border space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">You'll receive</span>
                        <span className="font-semibold">
                            {estimatedShares.toFixed(2)} {selectedOutcome.toUpperCase()} shares
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Avg. price</span>
                        <span className="font-semibold">{(currentPrice * 100).toFixed(1)}¢</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-dark-border">
                        <span className="text-dark-muted">Potential return</span>
                        <span className="font-semibold text-yes">
                            ${potentialReturn.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Potential profit</span>
                        <span className={`font-semibold ${potentialProfit > 0 ? 'text-yes' : 'text-no'}`}>
                            {potentialProfit > 0 ? '+' : ''}${potentialProfit.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-no/10 border border-no/20">
                    <p className="text-sm text-no">{error}</p>
                </div>
            )}

            {/* Trade Button */}
            {!isConnected ? (
                <button className="btn btn-primary w-full text-lg py-4">
                    Connect Wallet to Trade
                </button>
            ) : (
                <div className="space-y-3">
                    <button
                        onClick={handleTrade}
                        disabled={!amount || parseFloat(amount) <= 0 || isTrading || hasInsufficientBalance}
                        className={`btn w-full text-lg py-4 ${selectedOutcome === 'yes' ? 'btn-yes' : 'btn-no'
                            }`}
                    >
                        {isTrading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Buy ${selectedOutcome.toUpperCase()} Shares`
                        )}
                    </button>

                    <button className="btn btn-secondary w-full">
                        Sell Shares
                    </button>
                </div>
            )}

            {/* Info Notice */}
            <div className="mt-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <p className="text-xs text-primary-400 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Prices update automatically based on market activity (LMSR)</span>
                </p>
            </div>
        </div>
    );
}
