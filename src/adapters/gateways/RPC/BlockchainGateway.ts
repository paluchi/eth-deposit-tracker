import {
  IBlockchainProvider,
  IBlockchainGateway,
  TransactionData,
} from "core/types.gateways";
import sleep from "utils/sleep";

interface BlockchainGatewayConfig {
  provider: IBlockchainProvider;
  batchSize?: number; // Number of items to fetch in a batch
  retries?: number; // Number of retries for rate-limited requests
  blockchain: string;
  network: string;
  token: string;
}

interface QueueItem {
  fetchCallback: () => Promise<any>;
  resolvePromise: (data: any) => void;
}

export class BlockchainGateway implements IBlockchainGateway {
  private provider: IBlockchainProvider;
  private batchSize: number;
  private fetchQueue: QueueItem[] = [];
  private isFetching = false;
  private retries: number;

  public blockchain: string;
  public network: string;
  public token: string;

  constructor(config: BlockchainGatewayConfig) {
    this.provider = config.provider;
    this.batchSize = config.batchSize || 15;
    this.retries = config.retries || 15;
    this.blockchain = config.blockchain;
    this.network = config.network;
    this.token = config.token;
  }

  // Generic method to add a fetch operation to the queue
  private async queueFetchOperation<T>(
    fetchCallback: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      this.fetchQueue.push({ fetchCallback, resolvePromise: resolve });
      this.processFetchQueue();
    });
  }

  // Process the fetch queue in batches
  private async processFetchQueue(): Promise<void> {
    if (this.isFetching || this.fetchQueue.length === 0) return;

    this.isFetching = true;
    const batch = this.fetchQueue.splice(0, this.batchSize);

    const promises = batch.map(async ({ fetchCallback, resolvePromise }) => {
      const data = await this.executeFetchWithRetry(fetchCallback);
      resolvePromise(data);
    });

    await Promise.all(promises);
    console.info(`Processed ${batch.length} fetch operations`);

    this.isFetching = false;
    this.processFetchQueue();
  }

  // Execute a fetch operation with retries
  private async executeFetchWithRetry<T>(
    fetchCallback: () => Promise<T>,
    retries = this.retries,
    backoff = 1000
  ): Promise<T | null> {
    try {
      return await fetchCallback();
    } catch (error: any) {
      if (retries > 0 && error?.error?.code === 429) {
        console.warn(`Rate limit exceeded. Retrying in ${backoff}ms...`);
        await sleep(backoff);
        return this.executeFetchWithRetry(
          fetchCallback,
          retries - 1,
          backoff * 2
        );
      }
      // Check if it's a TIMEOUT error
      else if (error?.error?.code === -32603) {
        console.warn(`Timeout error. Retrying in ${backoff}ms...`);
        await sleep(backoff);
        return this.executeFetchWithRetry(
          fetchCallback,
          retries - 1,
          backoff * 2
        );
      } else {
        console.error("System could not recover from rate limit error");
        throw error;
      }
    }
  }

  // Fetch transaction data
  public async getTransactionData(
    txHash: string
  ): Promise<TransactionData | null> {
    return this.queueFetchOperation(async () => {
      const tx = await this.provider.getTransaction(txHash);
      if (tx) {
        const block = await this.provider.getBlock(tx.blockNumber);
        return {
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
      return null;
    });
  }

  // Fetch and process transactions from a block
  public async fetchBlockTransactions(
    blockNumberOrHash: number | string
  ): Promise<TransactionData[] | null> {
    console.info("Fetching block transactions from block:", blockNumberOrHash);
    const block = await this.queueFetchOperation(() =>
      this.provider.getBlock(blockNumberOrHash)
    );

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

  // Watch for new minted blocks in real-time
  public async watchMintedBlocks(
    callback: (blockNumber: number) => void
  ): Promise<void> {
    console.info("Watching for new minted blocks...");
    this.provider.on("block", async (blockNumber: number) => {
      callback(blockNumber);
    });
  }

  // Get the latest block number
  public async getBlockNumber() {
    return this.queueFetchOperation(() => this.provider.getBlockNumber());
  }
}
