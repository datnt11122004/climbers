import { Module } from '@nestjs/common';
import { InteractBotService } from './interact-bot.service';
import { StartFeatureModule } from '#root/interact-bot/features/start/start-feature.module';
import { BaseFeatureModule } from '#root/interact-bot/features/base-feature/base-feature.module';
import { AuthenticationBotModule } from '#root/interact-bot/middlewares/authentication-bot.module';

@Module({
	imports: [
		AuthenticationBotModule,
		StartFeatureModule,
		BaseFeatureModule,
	],
	providers: [InteractBotService],
	exports: [InteractBotService],
})
export class InteractBotModule {}
