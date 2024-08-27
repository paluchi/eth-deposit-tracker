import express, { Request, Response } from "express";
import { getDepositsFetcherService } from "./context";
import { Registry, Counter, Gauge } from "prom-client";

// Initialize Express app
const app = express();

// Create a Registry
const register = new Registry();

// Define metrics
const depositsTotal = new Counter({
  name: "crypto_deposits_total",
  help: "Total number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const latestBlockNumber = new Gauge({
  name: "crypto_deposits_latest_block",
  help: "Latest block number processed",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

const latestBlockTimestamp = new Gauge({
  name: "crypto_deposits_latest_timestamp",
  help: "Timestamp of the latest processed block",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

// Middleware to parse JSON
app.use(express.json());

// Define the metrics endpoint
app.get("/prometheus", async (req: Request, res: Response) => {
  const { blockchain, network, token } = req.query;

  // Current timestamp - 5 minutes, converted to seconds
  const fiveMinutesAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);

  // Check if all required parameters are present
  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();

    // Query the database for deposits matching the parameters
    const deposits = await depositsFetcherService.getDeposits({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: fiveMinutesAgo,
    });

    // Update metrics
    deposits.forEach((deposit) => {
      depositsTotal
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc();
      latestBlockNumber
        .labels(deposit.blockchain, deposit.network)
        .set(deposit.blockNumber);
      latestBlockTimestamp
        .labels(deposit.blockchain, deposit.network)
        .set(deposit.blockTimestamp);
    });

    // Return the metrics in Prometheus format
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics sent to Prometheus");
  } catch (error) {
    console.error("Error querying deposits:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    app.listen(3005, () => {
      console.log(`Server is running on http://localhost:3005`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
