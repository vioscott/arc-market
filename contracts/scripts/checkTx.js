import hre from 'hardhat';

async function main() {
    const txHash = '0x0e5704cb37642acd1b44a35e7e1ae4d55d2bec2070f72986005b9e212cd545dd';
    console.log(`Checking Transaction: ${txHash}`);

    try {
        const tx = await hre.ethers.provider.getTransaction(txHash);
        if (!tx) {
            console.log("Transaction not found in mempool or chain (might be wrong network?)");
            return;
        }

        console.log(`\n--- Transaction Details ---`);
        console.log(`To: ${tx.to}`);
        console.log(`From: ${tx.from}`);
        console.log(`Value: ${hre.ethers.formatEther(tx.value)} ETH`);
        console.log(`Data (first 64 chars): ${tx.data.slice(0, 66)}...`);

        const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
        if (!receipt) {
            console.log("Transaction pending...");
            return;
        }

        console.log(`\n--- Receipt ---`);
        console.log(`Status: ${receipt.status === 1 ? '✅ SUCCESS' : '❌ REVERTED'}`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}`);

        if (receipt.status === 0) {
            console.log("\n❌ REVERTED");
            // Try to replay to get revert reason using a clean call
            try {
                // Decode Input to see what was sent
                const iface = new hre.ethers.Interface([
                    "function buyShares(uint8, uint256, uint256)"
                ]);
                const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
                console.log(`\nFunction: ${decoded.name}`);
                console.log(`Args:`, decoded.args);

                // Replay
                await hre.ethers.provider.call({
                    to: tx.to,
                    from: tx.from,
                    data: tx.data,
                    value: tx.value,
                    gasLimit: tx.gasLimit
                }, receipt.blockNumber - 1);

            } catch (error) {
                // Ethers v6 errors
                console.log("\n--- Simulation Error ---");
                if (error.data) {
                    // Try to decode custom error
                    console.log("Error Data:", error.data);

                    // Try decoding common errors
                    const ERC20ABI = [
                        "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
                        "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)"
                    ];

                    try {
                        const marketIface = new hre.ethers.Interface([
                            ...ERC20ABI,
                            "error EnforcedPause()",
                            "error ExpectedPause()",
                            "function buyShares(uint8, uint256, uint256)"
                        ]);
                        const parsedError = marketIface.parseError(error.data);
                        if (parsedError) {
                            console.log(`\n🚨 REVERT REASON: ${parsedError.name}`);
                            console.log(parsedError.args);
                            return;
                        }
                    } catch (e) { }

                    // Try decoding string revert
                    try {
                        const reason = hre.ethers.toUtf8String('0x' + error.data.slice(138));
                        console.log(`Revert Reason (string): ${reason}`);
                    } catch (e) { }
                } else if (error.reason) {
                    console.log(`Revert Reason: ${error.reason}`);
                } else if (error.message) {
                    console.log(`Revert Message: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error("Error fetching transaction:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
