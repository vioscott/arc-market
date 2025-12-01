'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface PricePoint {
    timestamp: number;
    yesPrice: number;
    noPrice: number;
}

interface PriceChartProps {
    data?: PricePoint[];
    currentYesPrice: number;
    currentNoPrice: number;
}

// Generate mock data if none provided
const generateMockData = (currentYes: number): PricePoint[] => {
    const data: PricePoint[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate 7 days of data
    let price = currentYes;
    for (let i = 7; i >= 0; i--) {
        // Add some random volatility
        const volatility = (Math.random() - 0.5) * 0.1;
        price = Math.max(0.01, Math.min(0.99, price + volatility));

        data.push({
            timestamp: now - (i * oneDay),
            yesPrice: price,
            noPrice: 1 - price
        });
    }
    // Ensure last point matches current price
    data[data.length - 1] = {
        timestamp: now,
        yesPrice: currentYes,
        noPrice: 1 - currentYes
    };

    return data;
};

export default function PriceChart({ data, currentYesPrice, currentNoPrice }: PriceChartProps) {
    const [chartData, setChartData] = useState<PricePoint[]>([]);
    const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

    useEffect(() => {
        if (data && data.length > 0) {
            setChartData(data);
        } else {
            setChartData(generateMockData(currentYesPrice));
        }
    }, [data, currentYesPrice]);

    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const formatYAxis = (tickItem: number) => {
        return `${(tickItem * 100).toFixed(0)}%`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
                    <p className="text-dark-muted text-xs mb-2">
                        {new Date(label).toLocaleString()}
                    </p>
                    <div className="space-y-1">
                        <p className="text-yes font-bold text-sm">
                            YES: {(payload[0].value * 100).toFixed(1)}%
                        </p>
                        <p className="text-no font-bold text-sm">
                            NO: {(payload[1].value * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header / Controls */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                            {(currentYesPrice * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm font-medium text-yes">
                            YES
                        </span>
                    </div>
                    <div className="h-4 w-px bg-dark-border"></div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-dark-muted">
                            {(currentNoPrice * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs font-medium text-no">
                            NO
                        </span>
                    </div>
                </div>

                <div className="flex bg-dark-bg rounded-lg p-1 border border-dark-border">
                    {(['1D', '1W', '1M', 'ALL'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-dark-muted hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatXAxis}
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 1]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="yesPrice"
                            stroke="#10B981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorYes)"
                        />
                        {/* We could add NO price line too, but usually one is enough for binary markets */}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
