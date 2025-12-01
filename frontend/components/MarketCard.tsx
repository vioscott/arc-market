'use client';

import Link from 'next/link';

interface MarketCardProps {
    id: number;
    question: string;
    category: string;
    yesPrice: number;
    noPrice: number;
    volume: number;
    liquidity: number;
    closeTime: Date;
    resolved: boolean;
}

export default function MarketCard({
    id,
    question,
    category,
    yesPrice,
    noPrice,
    volume,
    liquidity,
    closeTime,
    resolved,
}: MarketCardProps) {
    const timeRemaining = closeTime.getTime() - Date.now();
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            crypto: 'from-orange-500 to-yellow-500',
            sports: 'from-green-500 to-emerald-500',
            politics: 'from-blue-500 to-indigo-500',
            economics: 'from-purple-500 to-pink-500',
            technology: 'from-cyan-500 to-blue-500',
            entertainment: 'from-red-500 to-rose-500',
        };
        return colors[cat.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    return (
        <Link href={`/market/${id}`}>
            <div className="card-hover h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} text-white text-xs font-semibold`}>
                        {category}
                    </span>
                    {resolved && (
                        <span className="px-3 py-1 rounded-lg bg-dark-bg text-dark-muted text-xs font-semibold">
                            Resolved
                        </span>
                    )}
                </div>

                {/* Question */}
                <h3 className="text-lg sm:text-xl font-bold mb-4 line-clamp-2 flex-1">
                    {question}
                </h3>

                {/* Prices - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-yes/10 border border-yes/20">
                        <p className="text-xs text-dark-muted mb-1">YES</p>
                        <p className="text-2xl font-bold price-yes">
                            {(yesPrice * 100).toFixed(0)}¢
                        </p>
                        <p className="text-xs text-dark-muted mt-1">
                            {(yesPrice * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-no/10 border border-no/20">
                        <p className="text-xs text-dark-muted mb-1">NO</p>
                        <p className="text-2xl font-bold price-no">
                            {(noPrice * 100).toFixed(0)}¢
                        </p>
                        <p className="text-xs text-dark-muted mt-1">
                            {(noPrice * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-dark-muted pt-4 border-t border-dark-border">
                    <div>
                        <p className="text-xs mb-1">Volume</p>
                        <p className="font-semibold text-dark-text">${volume.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs mb-1">Liquidity</p>
                        <p className="font-semibold text-dark-text">${liquidity.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs mb-1">Closes in</p>
                        <p className="font-semibold text-dark-text">
                            {daysRemaining > 0 ? `${daysRemaining}d` : `${hoursRemaining}h`}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
