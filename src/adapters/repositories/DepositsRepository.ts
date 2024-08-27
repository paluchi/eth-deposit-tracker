import { Deposit } from "core/domain/deposit";
import { IDepositsRepository } from "core/types.repositories";
import { GetDepositsProps } from "core/types.services";
import { Model } from "mongoose";

export class DepositsRepository implements IDepositsRepository {
  private depositsModel: Model<Deposit>;

  constructor(depositsModel: Model<Deposit>) {
    this.depositsModel = depositsModel;
  }

  public async storeDeposit(deposit: Deposit): Promise<void> {
    try {
      const newDeposit = new this.depositsModel({
        id: deposit.hash,
        ...deposit,
      });
      await newDeposit.save();
    } catch (error: any) {
      // Check if the error is a duplicate key error
      if (error.code === 11000) {
        // 11000 is the error code for duplicate key in MongoDB
        console.warn("Deposit with this hash already exists:", deposit.hash);
        return;
      }

      console.error("Error storing deposit:", error);
      throw error; // Rethrow the error if it's not a duplicate key error
    }
  }

  public async getLatestStoredBlock(): Promise<number | null> {
    const tx = await this.depositsModel
      .findOne()
      .sort({ blockNumber: -1 })
      .limit(1)
      .exec();

    return tx ? tx.blockNumber : null;
  }

  public async getDeposits(props: GetDepositsProps): Promise<Deposit[]> {
    const deposits = await this.depositsModel
      .find({
        blockchain: props.blockchain,
        network: props.network,
        token: props.token,
        blockTimestamp: props.blockTimestamp
          ? { $gte: props.blockTimestamp }
          : undefined,
      })
      .exec();

    return deposits;
  }
}
