'use client';

import { useAccount } from 'wagmi';

interface ClaimPanelProps {
    marketAddress: `0x${string}`;
    winningOutcome: number | null;
    userYesShares: bigint;
    userNoShares: bigint;
    onClaim: () => Promise<void>;
    isPending: boolean;
}

export default function ClaimPanel({
    marketAddress,
    winningOutcome,
    userYesShares,
    userNoShares,
    onClaim,
    isPending,
}: ClaimPanelProps) {
    const { address, isConnected } = useAccount();

    if (!isConnected) {
        return null;
    }

    if (winningOutcome === null) {
        return (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6">
                <div className="text-center">
                    <div className="text-4xl mb-3">⏳</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Awaiting Resolution</h3>
                    <p className="text-gray-400 text-sm">
                        This market has closed and is awaiting resolution by the oracle.
                    </p>
                </div>
            </div>
        );
    }

    const winningShares = winningOutcome === 0 ? userYesShares : userNoShares;
    const hasWinningShares = winningShares > BigInt(0);
    const payout = Number(winningShares) / 1e18; // Convert from wei

    if (!hasWinningShares) {
        return (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6">
                <div className="text-center">
                    <div className="text-4xl mb-3">😔</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Winnings</h3>
                    <p className="text-gray-400 text-sm">
                        You don't have any winning shares in this market.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl p-6">
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">You Won!</h3>
                <p className="text-gray-400">
                    The market resolved to <span className="font-semibold text-green-400">{winningOutcome === 0 ? 'YES' : 'NO'}</span>
                </p>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Your Winning Shares</span>
                    <span className="text-xl font-bold text-white">{(Number(winningShares) / 1e18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payout</span>
                    <span className="text-2xl font-bold text-green-400">${payout.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={onClaim}
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Claiming...
                    </span>
                ) : (
                    'Claim Winnings'
                )}
            </button>

            <p className="mt-4 text-xs text-center text-gray-500">
                Claiming will transfer your winnings to your wallet
            </p>
        </div>
    );
}
