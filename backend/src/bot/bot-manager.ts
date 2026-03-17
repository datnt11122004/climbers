import { Logger } from '@nestjs/common';
import { TelegramBot } from './telegram-bot';

export class BotManager {
    private static readonly logger = new Logger(BotManager.name);
    private static bots: Map<string, TelegramBot> = new Map<
        string,
        TelegramBot
    >();

    static addBot(name: string, bot: TelegramBot): void {
        if (this.bots.has(name)) {
            throw new Error(`Bot with name ${name} already exists.`);
        }
        this.bots.set(name, bot);
    }

    static getBot(name: string): TelegramBot | undefined {
        return this.bots.get(name);
    }

    static removeBot(name: string): void {
        if (!this.bots.has(name)) {
            throw new Error(`Bot with name ${name} does not exist.`);
        }
        this.bots.delete(name);
    }

    static listBots(): TelegramBot[] {
        return Array.from(this.bots.values());
    }

    static listBotNames(): string[] {
        return Array.from(this.bots.keys());
    }

    static startAllBots(): void {
        // wait all bot to start
        Promise.all(
            this.listBotNames().map((botName) => {
                const bot = this.getBot(botName);
                const pollingRunning = (bot as any).pollingRunning; // Access private property using type assertion
                if (pollingRunning) return; // Skip if bot is already running
                this.logger.debug(`Starting bot ${botName}`);
                return bot.start({
                    onStart: ({ username }) =>
                        this.logger.log(`Bot ${username} is started`)
                });
            })
        );
    }

    static stopAllBots(): void {
        // wait all bot to stop
        Promise.all(this.listBots().map((bot) => bot.stop()));
    }
}
