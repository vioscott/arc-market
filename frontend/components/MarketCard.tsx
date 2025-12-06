import Link from 'next/link';
import { calculatePrice, formatPrice, formatTimeRemaining, getMarketStatus } from '@/utils/ammCalculations';

interface MarketCardProps {
    marketId: number;
    marketAddress: string;
    question: string;
    category: string;
    closeTime: number;
    yesShares: string;
    noShares: string;
    volume: string;
    status: 'active' | 'closed' | 'resolved';
    winningOutcome: number | null;
}

export default function MarketCard({
    marketId,
    marketAddress,
    question,
    category,
    closeTime,
    yesShares,
    noShares,
    volume,
    status,
    winningOutcome,
}: MarketCardProps) {
    const yesSharesBigInt = BigInt(yesShares || '0');
    const noSharesBigInt = BigInt(noShares || '0');

    const yesPrice = calculatePrice(yesSharesBigInt, noSharesBigInt, 'yes');
    const noPrice = calculatePrice(yesSharesBigInt, noSharesBigInt, 'no');

    const timeRemaining = formatTimeRemaining(closeTime);
    const marketStatus = getMarketStatus(closeTime, status === 'resolved');

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            Crypto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            Sports: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            Politics: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            Economics: 'bg-green-500/10 text-green-400 border-green-500/20',
            Technology: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        };
        return colors[cat] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const getCategoryBadge = () => {
        const badges: Record<string, string> = {
            Crypto: '₿',
            Sports: '⚽',
            Politics: '🏛️',
            Economics: '📈',
            Technology: '💻',
        };
        return badges[category] || '📊';
    };

    return (
        <Link href={`/market/${marketId}`}>
            <div className="group relative overflow-hidden rounded-xl border border-[#1e293b] bg-[#141b2e] hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${getCategoryColor(category)}`}>
                            <span>{getCategoryBadge()}</span>
                            <span>{category}</span>
                        </div>
                        {marketStatus === 'resolved' && (
                            <div className="px-2 py-1 text-xs font-medium rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                Resolved
                            </div>
                        )}
                    </div>

                    {/* Question */}
                    <h3 className="text-base font-semibold text-white mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors min-h-[3rem]">
                        {question}
                    </h3>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                            <div className="text-xs text-gray-400 mb-1">YES</div>
                            <div className="text-lg font-bold text-green-400">{(yesPrice * 100).toFixed(0)}¢</div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="text-xs text-gray-400 mb-1">NO</div>
                            <div className="text-lg font-bold text-red-400">{(noPrice * 100).toFixed(0)}¢</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{timeRemaining}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>${(Number(volume) / 1e6).toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
