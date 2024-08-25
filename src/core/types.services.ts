export interface IDepositsTrackerService {
  processBlockTransactions(block: number | string): Promise<void>;
  processBlockTransactionsFrom(blockNumber: number): Promise<void>;
  startPendingTransactionsListener(): void;
  startMintedBlocksListener(): void;
}
