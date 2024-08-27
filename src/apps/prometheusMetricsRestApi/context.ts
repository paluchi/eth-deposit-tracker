import { Mongoose } from "mongoose";

import { DepositsFetcherService as IDepositsFetcherService } from "core/types.services";
import createMongooseConnection from "database/createMongooseConnection";
import envs from "utils/env";
import { IDepositsRepository } from "core/types.repositories";
import { DepositModel } from "database/schemas/Deposit";
import { DepositsRepository } from "adapters/repositories/DepositsRepository";
import { DepositsFetcherService } from "core/services/DepositsFetcherService";

// Mongoose connection
let mongooseConnection: Mongoose;

// Repositories
let depositsRepository: IDepositsRepository;

// Services
let depositsFetcherService: IDepositsFetcherService;

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

export const getDepositsFetcherService = async () => {
  if (!depositsFetcherService) {
    await getMongooseConnection();

    const depositsRepository = await getDepositsRepository();

    depositsFetcherService = new DepositsFetcherService({
      depositsRepository: depositsRepository,
    });

    console.info("EthBeaconService created");
  }

  return depositsFetcherService;
};
