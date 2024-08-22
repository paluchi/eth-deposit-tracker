import { Deposit } from "./domain/deposit";

export interface IDepositsRepository {
  storeDeposit(deposit: Deposit): Promise<void>;
}
