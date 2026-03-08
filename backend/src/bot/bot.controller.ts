import { Controller, Get } from '@nestjs/common';
import { BotService } from './bot.service';
import { ApiResponse } from 'src/common/types';

@Controller('bot')
export class BotController {
	constructor(private readonly botService: BotService) {}

	@Get('start-all-bots')
	async startAllBots() {
		await this.botService.startAllBots();
		return ApiResponse.OK();
	}
}
