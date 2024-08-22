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
}

// Interface for the generic blockchain gateway
export interface IBlockchainGateway {
  getTransactionData(txHash: string): Promise<TransactionData | null>;
  fetchBlockTransactionsByHash(
    blockNumberOrHash: string
  ): Promise<TransactionData[] | null>;
  watchPendingTransactions(
    callback: (data: TransactionData) => void
  ): Promise<void>;
}


// Interface for the notifications gateway
export interface INotifierGateway {
  sendNotification(message: string): Promise<void>;
}