export interface TransactionData {
  blockTimestamp: number;
  blockNumber: number;
  blockHash: string;
  index: number;
  hash: string;
  type: number;
  to: string;
  from: string;
  nonce: number;
  gasLimit: bigint;
  gasPrice: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  maxFeePerBlobGas: bigint | null;
  value: bigint;
}

// Interface for the generic blockchain provider
export interface IBlockchainProvider {
  getTransaction(txHash: string): Promise<any>;
  getBlock(blockNumberOrHash: string | number): Promise<any>;
  on(event: string, listener: (data: any) => void): void;
  getTransactionTrace(txHash: string): Promise<any>;
  getBlockNumber(): Promise<number>;
}

// Interface for the generic blockchain gateway
export class IBlockchainGateway {
  public blockchain: string = "";
  public network: string = "";
  public token: string = "";

  public async getTransactionData(
    txHash: string
  ): Promise<TransactionData | null> {
    throw new Error("Not implemented");
  }
  public async fetchBlockTransactions(
    blockNumberOrHash: string | number
  ): Promise<TransactionData[] | null> {
    throw new Error("Not implemented");
  }
  public async watchPendingTransactions(
    callback: (data: TransactionData) => void
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async watchMintedBlocks(
    callback: (blockNumber: number) => void
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async getBlockNumber(): Promise<number> {
    throw new Error("Not implemented");
  }
}

// Interface for the notifications gateway
export interface INotifierGateway {
  sendNotification(message: string): Promise<void>;
}
