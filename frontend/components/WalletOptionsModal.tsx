import React from 'react';
import { Connector } from 'wagmi';

interface WalletOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectors: readonly Connector[];
    connect: (args: { connector: Connector }) => void;
}

export default function WalletOptionsModal({ isOpen, onClose, connectors, connect }: WalletOptionsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#141b2e] border border-[#1e293b] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                <div className="p-4 border-b border-[#1e293b] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {connectors.map((connector) => (
                        <button
                            key={connector.id}
                            onClick={() => {
                                connect({ connector });
                                onClose();
                            }}
                            className="w-full p-4 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] hover:border-blue-500/50 transition-all flex items-center justify-between group"
                        >
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {connector.name}
                            </span>
                            {connector.name.toLowerCase().includes('metamask') && <span className="text-xl">🦊</span>}
                            {connector.name.toLowerCase().includes('rabby') && <span className="text-xl">🐰</span>}
                            {connector.name.toLowerCase().includes('coinbase') && <span className="text-xl">🔵</span>}
                            {connector.name.toLowerCase().includes('walletconnect') && <span className="text-xl">🔗</span>}
                        </button>
                    ))}

                    {connectors.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <p>No wallets found.</p>
                            <p className="text-sm mt-2">Please install MetaMask or another Web3 wallet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
