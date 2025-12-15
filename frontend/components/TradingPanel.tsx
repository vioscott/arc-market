'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';
import WalletOptionsModal from './WalletOptionsModal';

// Minimal ABIs
const MARKET_FACTORY_ABI = [
    {
        inputs: [{ name: "marketId", type: "uint256" }],
        name: "getMarket",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

const MARKET_ABI = [
    {
        inputs: [
            { name: "outcome", type: "uint8" },
            { name: "amount", type: "uint256" },
        ],
        name: "calculateCost",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "outcome", type: "uint8" },
            { name: "amount", type: "uint256" },
            { name: "maxCost", type: "uint256" },
        ],
        name: "buyShares",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

const ERC20_ABI = [
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

interface TradingPanelProps {
    marketId: number;
    yesPrice: number;
    noPrice: number;
    onTradeSuccess?: (cost: bigint) => void;
}

export default function TradingPanel({ marketId, yesPrice, noPrice, onTradeSuccess }: TradingPanelProps) {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();

    // State
    const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showWalletOptions, setShowWalletOptions] = useState(false);
    const [shouldAutoBuy, setShouldAutoBuy] = useState(false);

    // Success State
    const [approvalSuccess, setApprovalSuccess] = useState(false);
    const [buySuccess, setBuySuccess] = useState(false);
    const [lastPurchasedShares, setLastPurchasedShares] = useState(0);

    // 1. Get Market Address
    const { data: marketAddressFromContract } = useReadContract({
        address: CONTRACT_ADDRESSES.MarketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
        query: { retry: false }
    });

    const marketAddress = marketAddressFromContract && marketAddressFromContract !== '0x0000000000000000000000000000000000000000'
        ? marketAddressFromContract
        : null;

    // Get USDC balance (ERC20)
    const { data: usdcBalance, refetch: refetchUSDC } = useBalance({
        address: address,
        chainId: arcTestnetChain.id,
        token: CONTRACT_ADDRESSES.USDC as `0x${string}`, // Fetch ERC20 USDC balance, not Native ETH
    });

    // 3. Calculate Shares & Cost
    const currentPrice = selectedOutcome === 'yes' ? yesPrice : noPrice;
    const estimatedSharesNum = amount && parseFloat(amount) > 0 && currentPrice > 0
        ? parseFloat(amount) / currentPrice
        : 0;

    const sharesAmount = parseUnits(estimatedSharesNum.toFixed(18), 18);

    // 4. Get Exact Cost from Contract
    const { data: exactCost, isLoading: isLoadingCost } = useReadContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'calculateCost',
        args: [selectedOutcome === 'yes' ? 0 : 1, sharesAmount],
        query: {
            enabled: !!marketAddress && sharesAmount > BigInt(0),
        }
    });

    // 5. Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, marketAddress as `0x${string}`],
        query: {
            enabled: !!address && !!marketAddress,
            refetchInterval: 2000,
        }
    });

    // 6. Write Contracts
    const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract();
    const { writeContract: writeBuy, data: buyTxHash, isPending: isBuying } = useWriteContract();

    // 7. Wait for Transactions
    const { isLoading: isWaitingApprove, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveTxHash,
    });

    const { isLoading: isWaitingBuy, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
        hash: buyTxHash,
    });

    // Derived State
    const cost = exactCost || BigInt(0);
    const hasAllowance = allowance ? allowance >= cost : false;
    const balance = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;
    const hasInsufficientBalance = amount ? parseFloat(amount) > balance : false;
    const isProcessing = isApproving || isWaitingApprove || isBuying || isWaitingBuy;

    // Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-buy after approval
    useEffect(() => {
        if (isApproveSuccess) {
            refetchUSDC(); // Update balance (though unlikely to change on approval, good practice)
            refetchAllowance().then(() => {
                if (shouldAutoBuy && marketAddress) {
                    const maxCost = cost > BigInt(0) ? cost * BigInt(101) / BigInt(100) : BigInt(0);
                    if (maxCost > BigInt(0)) {
                        writeBuy({
                            address: marketAddress,
                            abi: MARKET_ABI,
                            functionName: 'buyShares',
                            args: [selectedOutcome === 'yes' ? 0 : 1, sharesAmount, maxCost],
                        });
                    }
                    setShouldAutoBuy(false);
                }
            });
        }
    }, [isApproveSuccess, refetchAllowance, shouldAutoBuy, cost, marketAddress, selectedOutcome, sharesAmount, writeBuy, refetchUSDC]);

    // Handle Buy Success
    useEffect(() => {
        if (isBuySuccess) {
            refetchUSDC(); // Update balance immediately

            if (onTradeSuccess && cost > BigInt(0)) {
                onTradeSuccess(cost);
            }

            // Save shares for popup before clearing amount
            if (estimatedSharesNum > 0) {
                setLastPurchasedShares(estimatedSharesNum);
            }

            setAmount('');
            setShouldAutoBuy(false);
        }
    }, [isBuySuccess, refetchUSDC]); // Keep dependencies minimal

    // Reset success states when amount changes
    useEffect(() => {
        if (amount) {
            setApprovalSuccess(false);
            setBuySuccess(false);
        }
    }, [amount, selectedOutcome]);

    // Show approval success message
    useEffect(() => {
        if (isApproveSuccess && !isWaitingApprove) {
            setApprovalSuccess(true);
            const timer = setTimeout(() => setApprovalSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isApproveSuccess, isWaitingApprove]);

    // Show buy success message (Toast/Banner)
    useEffect(() => {
        if (isBuySuccess && !isWaitingBuy) {
            setBuySuccess(true);
            // Auto hide after 5 seconds if not closed manually
            const timer = setTimeout(() => {
                setBuySuccess(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isBuySuccess, isWaitingBuy]);

    const handleMaxClick = () => {
        if (balance > 0) {
            setAmount(balance.toFixed(2));
        }
    };

    const handleAction = () => {
        setError('');
        if (!isConnected) return;
        if (!marketAddress) {
            setError('Market address not found');
            return;
        }

        if (!hasAllowance) {
            if (cost <= BigInt(0)) {
                setError('Calculating cost... please wait');
                return;
            }

            setShouldAutoBuy(true);
            const maxCost = cost * BigInt(101) / BigInt(100);

            writeApprove({
                address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [marketAddress, maxCost],
            });
        } else {
            const maxCost = cost * BigInt(101) / BigInt(100);
            writeBuy({
                address: marketAddress,
                abi: MARKET_ABI,
                functionName: 'buyShares',
                args: [selectedOutcome === 'yes' ? 0 : 1, sharesAmount, maxCost],
            });
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
            {/* Success Popup Overlay - Modal Style */}
            {isBuySuccess && buySuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200 p-4">
                    <div className="text-center p-6 bg-gray-900 border border-green-500/30 rounded-xl shadow-2xl shadow-green-500/20 transform scale-100 animate-in zoom-in-95 duration-200 w-full">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Trade Successful!</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            You purchased {lastPurchasedShares.toFixed(2)} {selectedOutcome.toUpperCase()} shares.
                        </p>
                        <button
                            onClick={() => setBuySuccess(false)}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold mb-6">Trade</h3>

            {/* Outcome Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => setSelectedOutcome('yes')}
                    disabled={isProcessing}
                    className={`tap-target py-4 rounded-xl font-bold transition-all ${selectedOutcome === 'yes'
                        ? 'bg-yes text-white shadow-glow-yes'
                        : 'bg-yes/10 text-yes border border-yes/20'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="text-sm mb-1">YES</div>
                    <div className="text-2xl">{(yesPrice * 100).toFixed(0)}¢</div>
                </button>
                <button
                    onClick={() => setSelectedOutcome('no')}
                    disabled={isProcessing}
                    className={`tap-target py-4 rounded-xl font-bold transition-all ${selectedOutcome === 'no'
                        ? 'bg-no text-white shadow-glow-no'
                        : 'bg-no/10 text-no border border-no/20'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        disabled={isProcessing}
                        className={`input pr-20 text-lg ${hasInsufficientBalance && amount ? 'border-no' : ''} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        min="0"
                        step="0.01"
                    />
                    <button
                        onClick={handleMaxClick}
                        disabled={isProcessing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="text-dark-muted">Est. Shares</span>
                        <span className="font-semibold">
                            {estimatedSharesNum.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Est. Cost</span>
                        <span className="font-semibold">
                            {exactCost ? formatUnits(exactCost, 6) : '...'} USDC
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

            {!marketAddress && isConnected && (
                <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-sm text-orange-400">
                        Market contract not found. This market might not be deployed yet.
                    </p>
                </div>
            )}

            {/* Action Button */}
            {!isConnected ? (
                <button
                    className="btn btn-primary w-full text-lg py-4"
                    onClick={() => setShowWalletOptions(true)}
                >
                    Connect Wallet to Trade
                </button>
            ) : (
                <button
                    onClick={handleAction}
                    disabled={!amount || parseFloat(amount) <= 0 || isProcessing || hasInsufficientBalance || !marketAddress}
                    className={`btn w-full text-lg py-4 ${selectedOutcome === 'yes' ? 'btn-yes' : 'btn-no'}`}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isWaitingApprove ? 'Waiting for approval...' : isApproving ? 'Approving...' : isWaitingBuy ? 'Waiting for confirmation...' : 'Processing...'}
                        </span>
                    ) : (
                        `Buy ${selectedOutcome.toUpperCase()} Shares`
                    )}
                </button>
            )}

            {/* Info Notice */}
            <div className="mt-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <p className="text-xs text-primary-400 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        {isWaitingApprove
                            ? "Please approve the USDC transaction in your wallet."
                            : isWaitingBuy
                                ? "Please confirm the buy transaction in your wallet."
                                : !hasAllowance
                                    ? "This will require two transactions: 1. Approve USDC 2. Buy Shares."
                                    : "Click 'Buy Shares' and confirm in your wallet to complete the trade."}
                    </span>
                </p>
            </div>


            <WalletOptionsModal
                isOpen={showWalletOptions}
                onClose={() => setShowWalletOptions(false)}
                connectors={connectors}
                connect={connect}
            />
        </div>
    );
}
