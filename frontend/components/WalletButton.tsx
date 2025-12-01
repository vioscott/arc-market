'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES, arcTestnetChain } from '@/config/wagmi';

export default function WalletButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Get USDC balance (native currency on Arc Testnet)
    const { data: usdcBalance } = useBalance({
        address: address,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="btn btn-secondary animate-pulse">
                Loading...
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="btn btn-primary tap-target"
                >
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 card animate-slide-down">
                        <div className="flex flex-col gap-2">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => {
                                        connect({ connector });
                                        setShowDropdown(false);
                                    }}
                                    className="tap-target px-4 py-3 rounded-lg hover:bg-dark-bg transition-all text-left font-medium"
                                >
                                    {connector.name}
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

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`btn tap-target ${isWrongNetwork ? 'btn-no' : 'btn-secondary'} flex items-center gap-2`}
            >
                {isWrongNetwork ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-no animate-pulse" />
                        <span className="hidden sm:inline">Wrong Network</span>
                        <span className="sm:hidden">Wrong Net</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-yes" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-dark-muted hidden sm:block">
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
                <div className="absolute right-0 mt-2 w-64 card animate-slide-down">
                    <div className="flex flex-col gap-3">
                        {/* Account Info */}
                        <div className="pb-3 border-b border-dark-border">
                            <p className="text-xs text-dark-muted mb-1">Connected Account</p>
                            <p className="font-mono text-sm break-all">{address}</p>
                            {usdcBalance && (
                                <p className="text-lg font-bold mt-2 text-primary-400">
                                    {parseFloat(usdcBalance.formatted).toFixed(2)} USDC
                                </p>
                            )}
                        </div>

                        {/* Network Info */}
                        {isWrongNetwork && (
                            <div className="p-3 rounded-lg bg-no/10 border border-no/20">
                                <p className="text-sm text-no font-medium mb-2">Wrong Network</p>
                                <p className="text-xs text-dark-muted mb-3">
                                    Please switch to Arc Testnet
                                </p>
                                <button
                                    onClick={() => {
                                        switchChain({ chainId: arcTestnetChain.id });
                                        setShowDropdown(false);
                                    }}
                                    className="w-full btn btn-primary text-sm py-2"
                                >
                                    Switch to Arc Testnet
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(address || '');
                                setShowDropdown(false);
                            }}
                            className="tap-target px-4 py-2 rounded-lg hover:bg-dark-bg transition-all text-left text-sm flex items-center gap-2"
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
                            className="tap-target px-4 py-2 rounded-lg hover:bg-dark-bg transition-all text-left text-sm flex items-center gap-2"
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
                            className="tap-target px-4 py-2 rounded-lg hover:bg-dark-bg transition-all text-left text-sm text-no flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Disconnect
                        </button>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}
