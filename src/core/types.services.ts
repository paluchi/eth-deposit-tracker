export interface IDepositsTrackerService {
  processLastBlockTransactions(batchSize?: number): Promise<void>;
  startPendingTransactionsProcesor(): void;
}
