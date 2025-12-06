import { useState, useEffect } from 'react';

export interface Market {
    marketId: number;
    marketAddress: string;
    question: string;
    category: string;
    sourceUrl: string;
    closeTime: number;
    createdAt: number;
    liquidityParameter: string;
    eventId: string;
    eventType: string;
    status: 'active' | 'closed' | 'resolved';
    winningOutcome: number | null;
    resolvedAt: number | null;
    yesShares: string;
    noShares: string;
    yesPrice: number;
    noPrice: number;
    volume: string;
    creator: string;
    tags: string[];
}

export function useMarkets(filters?: {
    category?: string;
    status?: string;
    search?: string;
}) {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMarkets() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (filters?.category) params.append('category', filters.category);
                if (filters?.status) params.append('status', filters.status);
                if (filters?.search) params.append('search', filters.search);

                const response = await fetch(`/api/markets?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch markets');

                const data = await response.json();
                setMarkets(data.markets || []);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch markets');
                setMarkets([]);
            } finally {
                setLoading(false);
            }
        }

        fetchMarkets();
    }, [filters?.category, filters?.status, filters?.search]);

    return { markets, loading, error };
}
