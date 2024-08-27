import { Deposit } from "./domain/deposit";

export interface DepositsTrackerService {
  processBlockTransactions(block: number | string): Promise<void>;
  processBlockTransactionsFrom(blockNumber: number): Promise<void>;
  startPendingTransactionsListener(): void;
  startMintedBlocksListener(): void;
}

export interface GetDepositsProps {
  blockchain: string;
  network: string;
  token: string;
  blockTimestamp?: number;
}
export interface DepositsFetcherService {
  getDeposits(props: GetDepositsProps): Promise<Deposit[]>;
}
