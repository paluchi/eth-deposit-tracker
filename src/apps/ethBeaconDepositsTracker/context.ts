import { Mongoose } from "mongoose";

import { EthereumGateway } from "adapters/gateways/RPC/EthereumGateway";
import { DepositsTrackerService } from "core/services/DepositsTrackerService";
import { DepositsTrackerService as IDepositsTrackerService } from "core/types.services";
import createMongooseConnection from "database/createMongooseConnection";
import envs from "utils/env";
import { IDepositsRepository } from "core/types.repositories";
import { DepositModel } from "database/schemas/Deposit";
import { DepositsRepository } from "adapters/repositories/DepositsRepository";
import { TelegramNotifierGateway } from "adapters/gateways/notifications/TelegramNotifierGateway";

// Mongoose connection
let mongooseConnection: Mongoose;

// Gateways
let ethGateway: EthereumGateway;
let telegramNotifierGateway: TelegramNotifierGateway;

// Repositories
let depositsRepository: IDepositsRepository;

// Services
let ethBeaconService: IDepositsTrackerService;

const getMongooseConnection = async () => {
  if (!mongooseConnection) {
    mongooseConnection = await createMongooseConnection(envs.MONGO_URI);
  }

  return mongooseConnection;
};

const getDepositsRepository = async () => {
  if (!depositsRepository) {
    console.info("Creating new DepositsRepository");

    await getMongooseConnection();

    depositsRepository = new DepositsRepository(DepositModel);
  }

  return depositsRepository;
};

const getEthGateway = async () => {
  if (!ethGateway) {
    console.info("Creating new EthereumGateway");

    ethGateway = new EthereumGateway({
      rpcUrl: "https://eth-mainnet.g.alchemy.com",
      apiKey: envs.ALCHEMY_API_KEY,
      metadata: {
        network: "mainnet",
      },
    });
  }

  return ethGateway;
};

const getTelegramNotifierGateway = async () => {
  if (!telegramNotifierGateway) {
    console.info("Creating new TelegramNotifierGateway");

    telegramNotifierGateway = new TelegramNotifierGateway({
      botToken: envs.TELEGRAM_NOTIFICATIONS_BOT_TOKEN,
      chatId: envs.TELEGRAM_NOTIFICATIONS_CHAT_ID,
    });
  }

  return telegramNotifierGateway;
};

export const getEthBeaconDepositTrackerService = async () => {
  if (!ethBeaconService) {
    await getMongooseConnection();

    const depositsRepository = await getDepositsRepository();

    const telegramNotifierGateway = await getTelegramNotifierGateway();

    // Initialize the EthereumGateway with the Alchemy API key
    const ethGateway = await getEthGateway();

    ethBeaconService = new DepositsTrackerService({
      blockchainGateway: ethGateway,
      notificatorGateway: telegramNotifierGateway,
      depositsRepository: depositsRepository,
      filterIn: ["0x00000000219ab540356cBB839Cbe05303d7705Fa"],
    });

    console.info("EthBeaconService created");
  }

  return ethBeaconService;
};
