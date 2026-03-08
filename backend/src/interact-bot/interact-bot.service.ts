import { autoChatAction } from '@grammyjs/auto-chat-action';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { session } from 'grammy';
import { TelegramBot } from 'src/bot/telegram-bot';
import { Context } from './context';
import { i18n } from './i18n';
import { conversations, createConversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { AuthenticationBotService } from '#root/interact-bot/middlewares/authentication-bot.service';
import { BaseFeature } from '#root/interact-bot/features/base-feature/base-feature';
import { StartFeatureService } from '#root/interact-bot/features/start/start-feature.service';
import { Bot } from '@prisma/client';

@Injectable()
export class InteractBotService {
	constructor(
		private readonly authentication: AuthenticationBotService,
		private readonly baseFeature: BaseFeature,
		private readonly startFeature: StartFeatureService,
	) {}

	initial = () => ({});

	createInteractiveBot = (entity: Bot): TelegramBot => {
		const bot = new TelegramBot<Context>(entity.token);

		bot.api.config.use(parseMode('Markdown'));
		bot.use(autoChatAction(bot.api));
		bot.use(hydrateReply);
		bot.use(hydrate());
		bot.use(
			session({
				initial: () => this.initial(),
			}),
		);
		bot.use(i18n);

		// authentication
		bot.use(this.authentication.authentication(entity.id));

		// conversations
		bot.use(conversations());

		// features
		bot.use(this.startFeature);
		bot.use(this.baseFeature);

		return bot;
	};
}
