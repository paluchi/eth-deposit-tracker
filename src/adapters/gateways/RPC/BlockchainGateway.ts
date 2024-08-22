import {
  IBlockchainProvider,
  IBlockchainGateway,
  TransactionData,
} from "core/types.gateways";
import sleep from "utils/sleep";

interface BlockchainGatewayConfig {
  provider: IBlockchainProvider;
  batchSize?: number; // Number of transactions to fetch in a batch
  retries?: number; // Number of retries for rate-limited requests
}

export class BlockchainGateway implements IBlockchainGateway {
  private provider: IBlockchainProvider;
  private batchSize: number;
  private transactionQueue: {
    txHash: string;
    resolvePromise: (deposit: TransactionData | null) => void;
  }[] = [];
  private isFetchingTransactions = false;
  private retries: number;

  constructor(config: BlockchainGatewayConfig) {
    this.provider = config.provider;
    this.batchSize = config.batchSize || 15;
    this.retries = config.retries || 15;
  }

  // Add a transaction to the queue and process it
  public async getTransactionData(
    txHash: string
  ): Promise<TransactionData | null> {
    let resolve: (data: TransactionData | null) => void = () => {};
    const promise = new Promise<TransactionData | null>((res) => {
      resolve = res;
    });
    this.transactionQueue.push({ txHash, resolvePromise: resolve });
    this.processTransactionQueue();
    const data = await promise;

    return data;
  }

  // Fetch and process transactions from the latest block in batches
  public async fetchBlockTransactionsByHash(
    blockNumberOrHash: number | string
  ): Promise<TransactionData[] | null> {
    console.info("Fetching the latest block transactions...");
    const block = await this.provider.getBlock(blockNumberOrHash);

    if (block && block.transactions) {
      const deposits: TransactionData[] = [];
      const promises = block.transactions.map(async (txHash: string) => {
        const deposit = await this.getTransactionData(txHash);
        if (deposit) {
          deposits.push(deposit);
        }
      });
      await Promise.all(promises);
      return deposits.length > 0 ? deposits : null;
    }
    return null;
  }

  // Watch for pending transactions in real-time
  public async watchPendingTransactions(
    callback: (data: TransactionData) => void
  ): Promise<void> {
    console.info("Watching for pending transactions...");

    this.provider.on("pending", async (txHash: string) => {
      const data = await this.getTransactionData(txHash);
      data && callback(data);
    });
  }

  private async processTransactionQueue(): Promise<void> {
    if (this.isFetchingTransactions || this.transactionQueue.length === 0)
      return;

    this.isFetchingTransactions = true;
    const deposits: TransactionData[] = [];

    const batch = this.transactionQueue.splice(0, this.batchSize);

    const promises = batch.map(async ({ txHash, resolvePromise }) => {
      const data = await this.fetchTransactionData(txHash);
      resolvePromise(data);
      if (data) deposits.push(data);
    });

    await Promise.all(promises);
    console.info(`Processed ${batch.length} transactions`);

    this.isFetchingTransactions = false;

    this.processTransactionQueue();
  }

  // Fetch transaction data from the blockchain network
  private async fetchTransactionData(
    txHash: string,
    retries = this.retries,
    backoff = 1000
  ): Promise<TransactionData | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);

      let transactionData: TransactionData | null = null;
      if (tx) {
        const block = await this.provider.getBlock(tx.blockNumber);
        // const trace = await this.provider.getTransactionTrace(txHash);
        // console.log("trace", trace);

        transactionData = {
          value: tx.value,
          blockTimestamp: block.timestamp,
          blockNumber: tx.blockNumber,
          blockHash: tx.blockHash,
          index: tx.index,
          hash: tx.hash,
          type: tx.type,
          to: tx.to,
          from: tx.from,
          nonce: tx.nonce,
          gasLimit: tx.gasLimit,
          gasPrice: tx.gasPrice,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
          maxFeePerGas: tx.maxFeePerGas,
          maxFeePerBlobGas: tx.maxFeePerBlobGas,
        };
      }
      return transactionData;
    } catch (error: any) {
      if (retries > 0 && error?.error?.code === 429) {
        console.warn(`Rate limit exceeded. Retrying in ${backoff}ms...`);
        await sleep(backoff);
        return this.fetchTransactionData(txHash, retries - 1, backoff * 2); // Retry with exponential backoff
      } else {
        console.error("Error fetching transaction data:", error);
        return null;
      }
    }
  }
}
