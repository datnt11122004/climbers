import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { PrismaModule } from '#root/prisma/prisma.module';
import { InteractBotModule } from '#root/interact-bot/interact-bot.module';

@Module({
    providers: [BotService],
    controllers: [BotController],
    imports: [PrismaModule, InteractBotModule]
})
export class BotModule {}
