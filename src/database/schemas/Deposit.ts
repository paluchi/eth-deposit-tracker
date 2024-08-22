import { Deposit } from "core/domain/deposit";
import mongoose, { Schema, Document } from "mongoose";

// Define the Mongoose interface extending the Mongoose Document
export interface IDeposit extends Document, Deposit {}

// Define the Mongoose schema based on the Zod schema
const DepositSchema: Schema = new Schema({
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  fee: { type: Number, required: false },
  hash: { type: String, required: false },
  pubkey: { type: String, required: true },
});

// Create and export the Mongoose model
export const DepositModel = mongoose.model<Deposit>("Deposit", DepositSchema);
