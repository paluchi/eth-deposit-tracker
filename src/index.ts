import { getEthBeaconDepositTrackerService } from "contexts/EthBeacon";

const main = async () => {
  const ethBeaconDepositTrackerService =
    await getEthBeaconDepositTrackerService();

  // Process the latest block
  await ethBeaconDepositTrackerService.processLastBlockTransactions();

  // Listen to pending transactions
  ethBeaconDepositTrackerService.startPendingTransactionsProcesor();
};

main();
