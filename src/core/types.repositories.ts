import { Deposit } from "./domain/deposit";
import { GetDepositsProps } from "./types.services";

export interface IDepositsRepository {
  storeDeposit(deposit: Deposit): Promise<void>;
  getLatestStoredBlock(): Promise<number | null>;
  getDeposits(props: GetDepositsProps): Promise<Deposit[]>;
}
