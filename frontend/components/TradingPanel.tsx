'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';

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
}

export default function TradingPanel({ marketId, yesPrice, noPrice }: TradingPanelProps) {
    const { address, isConnected } = useAccount();
    const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    // 1. Get Market Address (or use mock for testing)
    // Note: In production, this should fetch from MarketFactory
    // For now, we'll use a placeholder since markets may not exist yet
    const { data: marketAddressFromContract } = useReadContract({
        address: CONTRACT_ADDRESSES.MarketFactory as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
        query: {
            // Don't throw errors if market doesn't exist
            retry: false,
        }
    });

    // Use contract address if available, otherwise use a mock for UI testing
    // TODO: Remove this mock once real markets are created
    const marketAddress = marketAddressFromContract || '0x0000000000000000000000000000000000000000' as `0x${string}`;
    const isRealMarket = !!marketAddressFromContract;

    // 2. Get USDC Balance (native currency on Arc Testnet)
    const { data: usdcBalance } = useBalance({
        address: address,
        chainId: arcTestnetChain.id,
        // No token parameter - USDC is native on Arc Testnet
    });

    // 3. Calculate Shares & Cost
    // We assume user inputs USDC amount, we estimate shares
    // Shares = Amount / Price
    // Note: This is an estimation. For exact LMSR, we'd need to iterate or ask user for shares.
    // For this UI, we'll calculate shares based on current price and input amount.
    const currentPrice = selectedOutcome === 'yes' ? yesPrice : noPrice;
    const estimatedSharesNum = amount && parseFloat(amount) > 0 && currentPrice > 0
        ? parseFloat(amount) / currentPrice
        : 0;

    // Convert to BigInt for contract (18 decimals for shares)
    const sharesAmount = parseUnits(estimatedSharesNum.toFixed(18), 18);

    // 4. Get Exact Cost from Contract
    const { data: exactCost } = useReadContract({
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
            refetchInterval: 2000, // Poll every 2 seconds to catch approval changes
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

    // Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isApproveSuccess) {
            // Force immediate refetch after approval
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
        if (isBuySuccess) {
            alert(`Successfully bought ${selectedOutcome.toUpperCase()} shares!`);
            setAmount('');
        }
    }, [isBuySuccess, selectedOutcome]);

    // Derived State
    const cost = exactCost || BigInt(0);
    const hasAllowance = allowance ? allowance >= cost : false;
    const balance = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;
    const hasInsufficientBalance = amount ? parseFloat(amount) > balance : false;
    const isProcessing = isApproving || isWaitingApprove || isBuying || isWaitingBuy;

    // Debug logging
    useEffect(() => {
        if (allowance !== undefined && cost > BigInt(0)) {
            console.log('Allowance check:', {
                allowance: allowance.toString(),
                cost: cost.toString(),
                hasAllowance,
                isApproveSuccess
            });
        }
    }, [allowance, cost, hasAllowance, isApproveSuccess]);

    // Track approval success
    const [approvalSuccess, setApprovalSuccess] = React.useState(false);
    const [buySuccess, setBuySuccess] = React.useState(false);

    // Reset success states when amount changes
    React.useEffect(() => {
        setApprovalSuccess(false);
        setBuySuccess(false);
    }, [amount, selectedOutcome]);

    // Show approval success message
    React.useEffect(() => {
        if (isApproveSuccess && !isWaitingApprove) {
            setApprovalSuccess(true);
            setTimeout(() => setApprovalSuccess(false), 3000);
        }
    }, [isApproveSuccess, isWaitingApprove]);

    // Show buy success message
    React.useEffect(() => {
        if (isBuySuccess && !isWaitingBuy) {
            setBuySuccess(true);
            setTimeout(() => {
                setBuySuccess(false);
                setAmount('');
            }, 5000);
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
            // Approve max amount to avoid needing multiple approvals
            const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
            writeApprove({
                address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [marketAddress, maxUint256],
            });
        } else {
            // Buy
            // Add 1% slippage to cost
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
            <h3 className="text-xl font-bold mb-6">Trade</h3>

            {/* Mock Market Warning */}
            {!isRealMarket && (
                <div className="mb-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                    <p className="text-xs text-primary-400 flex items-start gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            This market doesn't exist on-chain yet. Run <code className="px-1 py-0.5 bg-dark-bg rounded text-xs">node contracts/scripts/autoCreateMarkets.js</code> to create real markets.
                        </span>
                    </p>
                </div>
            )}

            {/* Outcome Selector */}
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

            {/* Success Messages */}
            {approvalSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-yes/10 border border-yes/20">
                    <p className="text-sm text-yes flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        USDC approved! Now click "Buy Shares" to complete your trade.
                    </p>
                </div>
            )}

            {buySuccess && (
                <div className="mb-4 p-3 rounded-lg bg-yes/10 border border-yes/20">
                    <p className="text-sm text-yes flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Success! You've purchased {estimatedSharesNum.toFixed(2)} {selectedOutcome.toUpperCase()} shares.
                    </p>
                </div>
            )}

            {/* Action Button */}
            {!isConnected ? (
                <button className="btn btn-primary w-full text-lg py-4">
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
                        !hasAllowance ? `Approve USDC` : `Buy ${selectedOutcome.toUpperCase()} Shares`
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
                        {isWaitingApprove || isWaitingBuy
                            ? "Please confirm the transaction in your wallet."
                            : !hasAllowance
                                ? "Step 1: Approve USDC spending. Step 2: Buy shares."
                                : "Click 'Buy Shares' and confirm in your wallet to complete the trade."}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default TradingPanel;
