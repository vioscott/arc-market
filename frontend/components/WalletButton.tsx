
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';
import { parseUnits } from 'viem';

// ERC20 Mint ABI
const MOCK_USDC_ABI = [
    {
        name: 'mint',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: []
    }
] as const;

export default function WalletButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get USDC balance (ERC20)
    const { data: usdcBalance, refetch: refetchBalance } = useBalance({
        address: address,
        chainId: arcTestnetChain.id,
        token: CONTRACT_ADDRESSES.USDC as `0x${string}`,
    });

    // Faucet Logic
    const { writeContract: mintTokens, data: mintTxHash, isPending: isMinting } = useWriteContract();

    const { isLoading: isWaitingMint, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
        hash: mintTxHash,
    });

    useEffect(() => {
        if (isMintSuccess) {
            refetchBalance();
        }
    }, [isMintSuccess, refetchBalance]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const handleMint = () => {
        if (!address) return;
        mintTokens({
            address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
            abi: MOCK_USDC_ABI,
            functionName: 'mint',
            args: [address, parseUnits('1000', 6)], // Mint 1000 USDC
        });
    };

    if (!mounted) {
        return (
            <div className="px-4 py-2 rounded-lg bg-[#141b2e] border border-[#1e293b] text-gray-400 animate-pulse">
                Loading...
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
                >
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#1e293b] bg-[#141b2e] shadow-xl z-50 overflow-hidden">
                        <div className="p-2">
                            <div className="text-xs text-gray-400 px-3 py-2 mb-1">Select Wallet</div>
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => {
                                        connect({ connector });
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 rounded-lg hover:bg-[#1e293b] transition-all text-left font-medium text-white flex items-center justify-between"
                                >
                                    <span>{connector.name}</span>
                                    {connector.name === 'MetaMask' && <span className="text-orange-400">🦊</span>}
                                    {connector.name === 'WalletConnect' && <span className="text-blue-400">🔗</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Check if on wrong network
    const isWrongNetwork = chain?.id !== arcTestnetChain.id;

    // Show Faucet if balance is low (< 100 USDC)
    const showFaucet = usdcBalance && parseFloat(usdcBalance.formatted) < 100;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isWrongNetwork
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-[#141b2e] border border-[#1e293b] text-white hover:bg-[#1e293b]'
                    }`}
            >
                {isWrongNetwork ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="hidden sm:inline">Wrong Network</span>
                        <span className="sm:hidden">Wrong Net</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-400 hidden sm:block">
                                {usdcBalance ? `${parseFloat(usdcBalance.formatted).toFixed(2)} USDC` : '0.00 USDC'}
                            </span>
                            <span className="font-mono text-sm">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </div>
                    </>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#1e293b] bg-[#141b2e] shadow-xl z-50 overflow-hidden">
                    <div className="p-4">
                        {/* Account Info */}
                        <div className="pb-4 border-b border-[#1e293b]">
                            <p className="text-xs text-gray-400 mb-2">Connected Account</p>
                            <p className="font-mono text-sm break-all text-white mb-3">{address}</p>
                            {usdcBalance && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Balance</span>
                                    <span className="text-lg font-bold text-blue-400">
                                        {parseFloat(usdcBalance.formatted).toFixed(2)} USDC
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Faucet for Testnet */}
                        {showFaucet && !isWrongNetwork && (
                            <div className="my-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-xs text-blue-300 mb-2">Need test funds?</p>
                                <button
                                    onClick={handleMint}
                                    disabled={isMinting || isWaitingMint}
                                    className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                                >
                                    {isMinting || isWaitingMint ? 'Minting...' : 'Get 1000 USDC (Testnet)'}
                                </button>
                            </div>
                        )}

                        {/* Network Warning */}
                        {isWrongNetwork && (
                            <div className="my-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 font-medium mb-2">Wrong Network</p>
                                <p className="text-xs text-gray-400 mb-3">
                                    Please switch to Arc Testnet
                                </p>
                                <button
                                    onClick={() => {
                                        switchChain({ chainId: arcTestnetChain.id });
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
                                >
                                    Switch to Arc Testnet
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 space-y-1">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(address || '');
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2.5 rounded-lg hover:bg-[#1e293b] transition-all text-left text-sm text-white flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Address
                            </button>

                            <a
                                href={`https://testnet.arcscan.app/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowDropdown(false)}
                                className="w-full px-4 py-2.5 rounded-lg hover:bg-[#1e293b] transition-all text-left text-sm text-white flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on Explorer
                            </a>

                            <button
                                onClick={() => {
                                    disconnect();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-2.5 rounded-lg hover:bg-red-500/10 transition-all text-left text-sm text-red-400 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
