import { Api, Bot, BotConfig, BotError, Context } from 'grammy';
import { Logger } from '@nestjs/common';
// import * as Sentry from '@sentry/nestjs';

/**
 * A Telegram bot that extends the `Bot` class from `grammy`.
 * This class provides a protected method to handle bot errors and log them.
 * It also sends the error to Sentry.
 */
export class TelegramBot<C extends Context = Context, A extends Api = Api> extends Bot<C, A> {
	private readonly logger = new Logger(TelegramBot.name);

	constructor(token: string, config?: BotConfig<C>) {
		super(token, config);
		this.catch(this.handleError);
	}

	private handleError(botError: BotError) {
		this.logger.error(`${this.botInfo.username}: Error when handling update`);
		this.logger.error(`Bot error message: ${botError.message}`);
		this.logger.error(`Error: ${botError.error}`);
	}
}
