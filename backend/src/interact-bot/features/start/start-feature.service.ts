import { Composer } from 'grammy';
import type { Context } from '#root/interact-bot/context';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StartFeatureService extends Composer<Context> {
	private static COMMAND = 'start';
	private static ALIAS = [];

	constructor() {
		super();
		const feature = this.chatType(['private']);
		feature.command(
			[StartFeatureService.COMMAND, ...StartFeatureService.ALIAS],
			this.handleStartCommand.bind(this),
		);
	}

	private async handleStartCommand(ctx: Context) {
		return ctx.reply(ctx.t('start'));
	}
}
