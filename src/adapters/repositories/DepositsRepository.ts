import { Deposit } from "core/domain/deposit";
import { IDepositsRepository } from "core/types.repositories";
import { Model } from "mongoose";

export class DepositsRepository implements IDepositsRepository {
  private depositsModel: Model<Deposit>;

  constructor(depositsModel: Model<Deposit>) {
    this.depositsModel = depositsModel;
  }

  public async storeDeposit(deposit: Deposit): Promise<void> {
    try {
      const newDeposit = new this.depositsModel(deposit);
      await newDeposit.save();
    } catch (error) {
      console.error("Error storing deposit:", error);
      throw error;
    }
  }
}
