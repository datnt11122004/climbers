import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { BotManager } from './bot-manager';
import { TelegramBot } from 'src/bot/telegram-bot';
import { InteractBotService } from '#root/interact-bot/interact-bot.service';
import { PrismaService } from '#root/prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit {
	private readonly logger = new Logger(BotService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly interactBot: InteractBotService,
	) {}

	async onModuleInit() {
		await this.initAllBots();
	}

	/**
	 * Initialize all bots but not start them.
	 */
	async initAllBots() {
		const activeBotEntities = await this.prisma.bot.findMany({
			where: { active: true },
		});
		activeBotEntities.forEach((entity) => {
			this.logger.debug(`Initializing bot ${entity.name}`);
			const telegramBot = entity.interactive
				? this.interactBot.createInteractiveBot(entity)
				: new TelegramBot(entity.token);
			// Add the bot to the bot manager
			BotManager.addBot(entity.name, telegramBot);
		});
	}

	/**
	 * Schedule to start all bots after 3 minutes of the application start.
	 * We do not start the bots immediately because of CI/CD pipeline.
	 * The old pod is still running until the new pod is up and healthy.
	 * So, we will wait some time to make sure the old pod is terminated
	 * (that means the bot is stopped and bot.api.getUpdates method is available).
	 */
	@Timeout(0) // For testing, we use 10 seconds
	async startAllBots() {
		BotManager.startAllBots();
	}
}
