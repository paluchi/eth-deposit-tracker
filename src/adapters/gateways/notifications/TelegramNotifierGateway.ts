import { INotifierGateway } from "core/types.gateways";
import { Telegraf } from "telegraf";

interface TelegramNotifierConfig {
  botToken: string;
  chatId: string;
}

export class TelegramNotifierGateway implements INotifierGateway {
  private botToken: string;
  private chatId: string;
  private bot: Telegraf;

  constructor(config: TelegramNotifierConfig) {
    this.botToken = config.botToken;
    this.chatId = config.chatId;
    this.bot = new Telegraf(this.botToken);
  }

  public async sendNotification(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(this.chatId, message);
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }
}
