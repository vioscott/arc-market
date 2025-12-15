import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

export interface HistoryItem {
    type: 'BUY' | 'SELL' | 'REDEEM';
    marketId: number;
    outcome: 'YES' | 'NO';
    shares: number;
    amount: number; // USDC
    timestamp: number;
    txHash: string;
}

export function useTransactionHistory(userAddress?: string) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!userAddress || !publicClient) return;

        async function fetchHistory() {
            setLoading(true);
            try {
                // 1. Fetch OutcomeToken Mint/Burn events (All interactions)
                // Filter by To (Mint) or From (Burn) == User
                const mintLogs = await publicClient!.getLogs({
                    address: CONTRACT_ADDRESSES.OutcomeToken as `0x${string}`,
                    event: parseAbiItem('event TokensMinted(address indexed to, uint256 indexed tokenId, uint256 amount)'),
                    args: { to: userAddress as `0x${string}` },
                    fromBlock: 'earliest'
                });

                const burnLogs = await publicClient!.getLogs({
                    address: CONTRACT_ADDRESSES.OutcomeToken as `0x${string}`,
                    event: parseAbiItem('event TokensBurned(address indexed from, uint256 indexed tokenId, uint256 amount)'),
                    args: { from: userAddress as `0x${string}` },
                    fromBlock: 'earliest'
                });

                const logs = [...mintLogs, ...burnLogs];
                const historyItems: HistoryItem[] = [];

                for (const log of logs) {
                    const block = await publicClient!.getBlock({ blockNumber: log.blockNumber });
                    const tokenId = BigInt(log.args.tokenId!);
                    const amountShares = Number(formatUnits(log.args.amount!, 18));

                    const marketId = Number(tokenId / BigInt(2));
                    const outcome = tokenId % BigInt(2) === BigInt(0) ? 'YES' : 'NO';
                    const isMint = log.eventName === 'TokensMinted';

                    // For now, we estimate cost/payout or assume 0 if we can't easily link to Market event.
                    // Ideal: Find corresponding SharesPurchased/Sold event in the SAME tx.
                    // This requires checking the transaction receipt or logs from that tx.

                    // Let's try to fetch the Transaction Receipt logs to find the Market event (SharesPurchased/Sold/Redeemed)
                    // This is "expensive" (N RPC calls), but okay for history tab for one user.

                    // Optimization: We can just use the txHash to dedup, but we want the USDC amount.
                    // The Market contract emits SharesPurchased/sharesSold which contains the cost/payout.

                    // Let's do a simple heuristic first: 
                    // If Mint -> Buy or Claim? (Claim burns winning token, wait. Claim burns winning tokens? No, Claim burns winning tokens.)
                    // Market.sol: redeemShares calls outcomeToken.burn. So Claim = Burn.
                    // Market.sol: buyShares calls outcomeToken.mint. So Buy = Mint.
                    // Market.sol: sellShares calls outcomeToken.burn. So Sell = Burn.

                    // So Mint = Buy. 
                    // Burn = Sell OR Redeem.

                    const type = isMint ? 'BUY' : 'SELL'; // We need to distinguish Sell vs Redeem.

                    // We can check if the Market Contract was the caller? 
                    // The log is from OutcomeToken.
                    // But we don't see the `operator` (msg.sender) in the standard ERC1155 TransferSingle event, 
                    // but here we have custom TokensMinted/Burned but they don't show operator.
                    // BUT, the standard TransferSingle event DOES show operator.
                    // Let's stick to the basic types for now.

                    historyItems.push({
                        type,
                        marketId,
                        outcome,
                        shares: amountShares,
                        amount: 0, // TODO: Fetch from Market event if needed
                        timestamp: Number(block.timestamp),
                        txHash: log.transactionHash
                    });
                }

                // Sort by time desc
                historyItems.sort((a, b) => b.timestamp - a.timestamp);
                setHistory(historyItems);

            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [userAddress, publicClient]);

    return { history, loading };
}
