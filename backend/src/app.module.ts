import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { AppConfigModule } from '#root/config';
import { PrismaModule } from '#root/prisma/prisma.module';
import { BotModule } from '#root/bot/bot.module';
import { InteractBotModule } from '#root/interact-bot/interact-bot.module';
import { CategoryModule } from '#root/category/category.module';
import { AuthModule } from '#root/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppStoreSpyModule } from '#root/appstorespy/appstorespy.module';

@Module({
	imports: [
		// Global modules
		ScheduleModule.forRoot(),
		AppConfigModule,
		PrismaModule,

		// Feature modules
		AuthModule,
		BotModule,
		InteractBotModule,
		CategoryModule,
		AppStoreSpyModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}


