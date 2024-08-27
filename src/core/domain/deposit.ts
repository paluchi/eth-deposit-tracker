import { z } from "zod";

// Define the Zod schema
export const DepositSchema = z.object({
  blockNumber: z.number(),
  blockTimestamp: z.number(),
  fee: z.bigint().optional(),
  hash: z.string().optional(),
  pubkey: z.string(),
  blockchain: z.string(),
  network: z.string(),
  token: z.string(),
});

// Infer the TypeScript interface from the Zod schema
export type Deposit = z.infer<typeof DepositSchema>;
