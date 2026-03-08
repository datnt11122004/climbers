import { Global, Module } from '@nestjs/common';
import { AuthenticationBotService } from '#root/interact-bot/middlewares/authentication-bot.service';
import { TelegramUserModule } from '#root/telegram-user/telegram-user.module';

@Global()
@Module({
	imports: [TelegramUserModule],
	providers: [AuthenticationBotService],
	exports: [AuthenticationBotService],
})
export class AuthenticationBotModule {}
