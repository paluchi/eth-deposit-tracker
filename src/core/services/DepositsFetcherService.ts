import { Deposit } from "core/domain/deposit";
import { IDepositsRepository } from "core/types.repositories";
import {
  GetDepositsProps,
  DepositsFetcherService as IDepositsFetcherService,
} from "core/types.services";

// TODO - would be nice to store which was the last block processed

// NOTE - error handling for fetches to data gateways is missing and it's relative to business logics needs

export class DepositsFetcherService implements IDepositsFetcherService {
  private depositsRepository: IDepositsRepository;

  constructor(options: { depositsRepository: IDepositsRepository }) {
    this.depositsRepository = options.depositsRepository;
  }

  public async getDeposits(props: GetDepositsProps): Promise<Deposit[]> {
    return await this.depositsRepository.getDeposits(props);
  }
}
