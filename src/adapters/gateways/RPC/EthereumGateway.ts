import { ethers } from "ethers";
import { BlockchainGateway } from "./BlockchainGateway";
import { IBlockchainProvider, IBlockchainGateway } from "core/types.gateways";
import { ProviderEvent } from "ethers";

// Define the configuration interface for EthereumGateway
interface EthereumGatewayConfig {
  rpcUrl: string;
  apiKey: string;
  network?: ethers.Networkish; // Optional network parameter
  version?: string; // Optional version parameter
  metadata: {
    network: "mainnet" | "ropsten" | "rinkeby" | "goerli" | "kovan";
  };
}

// Implement the Ethereum-specific provider that adheres to the IBlockchainProvider interface
class EthereumProvider implements IBlockchainProvider {
  private provider: ethers.JsonRpcProvider;

  constructor(config: EthereumGatewayConfig) {
    const fullRpcUrl = `${config.rpcUrl}/v2/${config.apiKey}`;
    this.provider = new ethers.JsonRpcProvider(fullRpcUrl, config.network);
  }

  async getTransaction(txHash: string): Promise<any> {
    return this.provider.getTransaction(txHash);
  }

  async getBlock(blockNumberOrHash: string | number): Promise<any> {
    return this.provider.getBlock(blockNumberOrHash);
  }

  async getBlockNumber(): Promise<any> {
    return this.provider.getBlockNumber();
  }

  async getTransactionTrace(
    txHash: string,
    options: {
      tracer?:
        | "callTracer"
        | "stateDiffTracer"
        | "structuredTracer"
        | "vmTracer"
        | "parity";
      timeout?: number;
    } = {}
  ): Promise<any> {
    try {
      // Make a request to the Ethereum node to get the transaction trace
      const opts = {
        tracer: "callTracer",
        ...options,
      };

      const trace = await this.provider.send("debug_traceTransaction", [
        txHash,
        opts,
      ]);
      return trace;
    } catch (error) {
      console.error("Error fetching transaction trace:", error);
      return null;
    }
  }

  on(event: ProviderEvent, listener: (data: any) => void): void {
    this.provider.on(event, listener);
  }
}

// Extend the generic BlockchainGateway to create an Ethereum-specific gateway
export class EthereumGateway
  extends BlockchainGateway
  implements IBlockchainGateway
{
  token: string = "ETH";
  constructor(config: EthereumGatewayConfig) {
    const ethereumProvider = new EthereumProvider(config);
    super({
      provider: ethereumProvider,
      blockchain: "ethereum",
      network: config.metadata.network,
      token: "ETH",
    });
  }
}
