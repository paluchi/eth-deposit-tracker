import dotenv from "dotenv";
dotenv.config();

const envs = {
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY!,
  MONGO_URI: process.env.MONGO_URI!,

  TELEGRAM_NOTIFICATIONS_BOT_TOKEN:
    process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN!,
  TELEGRAM_NOTIFICATIONS_CHAT_ID: process.env.TELEGRAM_NOTIFICATIONS_CHAT_ID!,
};

export default envs;
