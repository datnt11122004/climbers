import { Middleware } from 'grammy';
import { Context } from '#root/interact-bot/context';
import { Injectable, Logger } from '@nestjs/common';
import { TelegramUserService } from '#root/telegram-user/telegram-user.service';

@Injectable()
export class AuthenticationBotService {
	private readonly logger = new Logger(AuthenticationBotService.name);
	constructor(private readonly telegramUserService: TelegramUserService) {}

	authentication(botId: number): Middleware<Context> {
		return async (ctx: Context, next): Promise<void> => {
			if (!ctx.session) throw new Error('Session middleware must be applied before authentication middleware');
			if (ctx.session.authenticated) {
				await next();
				return;
			}

			if (!ctx.from || !ctx.chat) {
				await ctx.reply('Authentication failed. Cannot get user information.');
				return;
			}

			try {
				// Extract necessary fields from ctx.from and ctx.chat
				if (ctx.chat.type === 'private') {
					const {
						id: telegramId,
						first_name: firstName,
						last_name: lastName,
						username,
						language_code: language,
					} = ctx.from;
					const { id: privateChatId } = ctx.chat;

					const user = await this.telegramUserService.upsert(
						telegramId,
						firstName,
						lastName || '',
						username,
						language,
						privateChatId,
					);
					ctx.session.userId = telegramId;
					ctx.session.botId = botId;
					this.logger.debug(`User ${telegramId} authenticated via bot ${botId}`);
				}

				ctx.session.authenticated = true;
			} catch (error) {
				this.logger.error('Authentication failed', error);
				await ctx.reply('Authentication failed. Please try again later.');
				return;
			}

			await next();
		};
	}
}
