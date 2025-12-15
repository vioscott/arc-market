import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatUnits } from 'viem';
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

// ArcScan API Response Type
interface ArcScanTx {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    contractAddress: string;
    to: string;
    tokenID: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    transactionIndex: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    input: string;
    confirmations: string;
    tokenValue: string; // Amount
}

export function useTransactionHistory(userAddress?: string) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userAddress) return;

        async function fetchHistory() {
            setLoading(true);
            try {
                // Fetch ERC1155 Transfers (Outcome Tokens)
                const response = await axios.get('https://testnet.arcscan.app/api', {
                    params: {
                        module: 'account',
                        action: 'token1155tx', // ERC1155 transfers
                        address: userAddress,
                        startblock: 0,
                        endblock: 99999999,
                        sort: 'desc',
                        apikey: '' // Public API often doesn't need key for low volume, or use env if available
                    }
                });

                if (response.data.status === '1' && Array.isArray(response.data.result)) {
                    const txs: ArcScanTx[] = response.data.result;
                    const historyItems: HistoryItem[] = [];

                    for (const tx of txs) {
                        // Filter for our OutcomeToken contract
                        if (tx.contractAddress.toLowerCase() !== CONTRACT_ADDRESSES.OutcomeToken.toLowerCase()) {
                            continue;
                        }

                        const tokenId = BigInt(tx.tokenID);
                        const amountShares = Number(tx.tokenValue); // Usually raw amount for 1155? or "value"? API usually returns "tokenValue" as amount for 1155.

                        const marketId = Number(tokenId / BigInt(2));
                        const outcome = tokenId % BigInt(2) === BigInt(0) ? 'YES' : 'NO';

                        // Determine Type
                        // Mint (from=0x0) -> BUY
                        // Burn (to=0x0) -> SELL or REDEEM
                        const isMint = tx.from === '0x0000000000000000000000000000000000000000';
                        const isBurn = tx.to === '0x0000000000000000000000000000000000000000';

                        // Approximate:
                        // Mint = Buy
                        // Burn = Sell/Redeem. Hard to distinguish without log topics, but simpler for display.
                        let type: 'BUY' | 'SELL' | 'REDEEM' = 'BUY';
                        if (isBurn) {
                            type = 'SELL'; // Default to SELL for now. REDEEM is hard to distinguish just from 1155 transfer.
                        } else if (!isMint) {
                            // Transfer between users? Not supported in UI yet, but possible.
                            continue;
                        }

                        historyItems.push({
                            type,
                            marketId,
                            outcome,
                            shares: amountShares / 1e18, // outcome tokens are 18 decimals
                            amount: 0, // Hard to get USDC amount without joining with ERC20 transfer
                            timestamp: Number(tx.timeStamp),
                            txHash: tx.hash
                        });
                    }
                    setHistory(historyItems);
                } else {
                    console.log('ArcScan returned no results or error:', response.data.message);
                    setHistory([]);
                }

            } catch (error) {
                console.error("Error fetching history from ArcScan:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [userAddress]);

    return { history, loading };
}
