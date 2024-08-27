import { getEthBeaconDepositTrackerService } from "./context";
import envs from "utils/env";

const main = async () => {
  const ethBeaconDepositTrackerService =
    await getEthBeaconDepositTrackerService();

  // Process the latest block
  ethBeaconDepositTrackerService.processBlockTransactionsFrom(
    envs.ETH_BLOCK_FROM
  );

  // Listen to pending transactions
  ethBeaconDepositTrackerService.startMintedBlocksListener();
};

main();
