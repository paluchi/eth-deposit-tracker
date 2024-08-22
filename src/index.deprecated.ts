import { ethers } from "ethers";
import envs from "utils/env";
import sleep from "utils/sleep";

// 1. Establish an RPC connection to an Ethereum node
const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${envs.ALCHEMY_API_KEY}`
);

// 2. Fetch and process transaction data
const getTransactionData = async (
  txHash: string,
  retries = 3,
  backoff = 1000
): Promise<ethers.TransactionResponse | null> => {
  try {
    return await provider.getTransaction(txHash);
  } catch (error: any) {
    if (retries > 0 && error.error.code === 429) {
      console.warn(`Rate limit exceeded. Retrying in ${backoff}ms...`);
      await sleep(backoff);
      return getTransactionData(txHash, retries - 1, backoff * 2); // Retry with exponential backoff
    } else {
      console.error("Error fetching transaction data:", error);
      return null;
    }
  }
};

// 3. Parse and filter transactions to identify Beacon ETH deposits
const parseTransaction = (tx: ethers.TransactionResponse | null) => {
  if (!tx) return;

  const beaconDepositContract = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

  if (tx.to && tx.to.toLowerCase() === beaconDepositContract.toLowerCase()) {
    console.log("Beacon deposit detected:", {
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      hash: tx.hash,
    });
  } else {
    // console.log(
    //   "Transaction is not an ETH deposit to the Beacon Deposit Contract."
    // );
  }
};

// 4. Real-time data fetching and processing
const watchPendingTransactions = async () => {
  console.log("Watching for pending transactions...");

  provider.on("pending", async (txHash) => {
    const tx = await getTransactionData(txHash);
    parseTransaction(tx);
  });
};

// 5. Function to get the latest block and process its transactions
const processLatestBlock = async (batchSize = 5) => {
  console.log("Fetching and processing the latest block transactions...");
  const block = await provider.getBlock("latest");

  if (block && block.transactions) {
    // Split transactions into batches
    for (let i = 0; i < block.transactions.length; i += batchSize) {
      const batch = block.transactions.slice(i, i + batchSize);

      // Fetch and process transactions in parallel within each batch
      const promises = batch.map(async (txHash) => {
        const tx = await getTransactionData(txHash);
        if (tx) {
          parseTransaction(tx);
        }
      });

      // Wait for the current batch to complete before moving to the next
      await Promise.all(promises);
    }
  }

  console.log("Finished processing the latest block transactions.");
};

const main = async () => {
  try {
    // Process the latest block
    await processLatestBlock();

    // Watch for real-time transaction data
    await watchPendingTransactions();
  } catch (error) {
    console.log("Error in main function:", error);
  }
};

main();
