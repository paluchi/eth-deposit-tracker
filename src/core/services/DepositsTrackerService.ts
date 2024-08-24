import { Deposit, DepositSchema } from "core/domain/deposit";
import {
  IBlockchainGateway,
  INotifierGateway,
  TransactionData,
} from "core/types.gateways";
import { IDepositsRepository } from "core/types.repositories";
import { IDepositsTrackerService } from "core/types.services";

export class DepositsTrackerService implements IDepositsTrackerService {
  private blockchainGateway: IBlockchainGateway;
  private notificatorGateway: INotifierGateway | undefined;
  private depositsRepository: IDepositsRepository;
  private listenTo: string[];

  constructor(options: {
    blockchainGateway: IBlockchainGateway;
    notificatorGateway?: INotifierGateway;
    depositsRepository: IDepositsRepository;
    listenTo: string[];
  }) {
    this.blockchainGateway = options.blockchainGateway;
    this.notificatorGateway = options.notificatorGateway;
    this.depositsRepository = options.depositsRepository;
    this.listenTo = options.listenTo;

    this.notificatorGateway?.sendNotification(
      "Deposits tracker service started\n\nListening to: \n" +
        this.listenTo.join("\n")
    );
  }

  // Process the last block's transactions in batches
  public async processLastBlockTransactions(): Promise<void> {
    const deposits = await this.blockchainGateway.fetchBlockTransactionsByHash(
      "latest"
    );

    const sotreBatchSize = 5;
    if (deposits && deposits.length > 0) {
      const batches = Math.ceil(deposits.length / sotreBatchSize);
      for (let i = 0; i < batches; i++) {
        const batch = deposits.slice(
          i * sotreBatchSize,
          (i + 1) * sotreBatchSize
        );
        for (const deposit of batch) {
          await this.onDepositProcessed(deposit);
        }
      }
    }
  }

  // Listen to pending transactions in real-time
  public startPendingTransactionsProcesor(): void {
    this.blockchainGateway.watchPendingTransactions(
      (deposit: TransactionData) => {
        this.onDepositProcessed(deposit);
      }
    );
  }

  private async onDepositProcessed(txData: TransactionData): Promise<void> {
    try {
      // Check if deposit corresponds to the public key
      if (!this.listenTo.includes(txData.to)) return;

      // // Calculate the transaction fee as the product of gas limit and gas price
      const fee = txData.gasLimit * txData.gasPrice;

      const deposit: Deposit = {
        blockNumber: txData.blockNumber,
        blockTimestamp: txData.blockTimestamp,
        pubkey: txData.from,
        fee: fee,
        hash: txData.hash,
      };

      DepositSchema.parse(deposit);

      // Save the deposit to the storage repository
      await this.depositsRepository.storeDeposit(deposit);

      // Send a notification
      await this.notificatorGateway?.sendNotification(
        `Deposit processed: ${txData.hash}\n\nAmount: ${txData.value}\nFee: ${fee}\nFrom: ${txData.from}\nTo: ${txData.to}\nBlock: ${txData.blockNumber}`
      );
    } catch (error) {
      console.log("error", error);
      await this.notificatorGateway?.sendNotification(
        `Error processing deposit: ${txData.hash}`
      );
    }
  }
}
