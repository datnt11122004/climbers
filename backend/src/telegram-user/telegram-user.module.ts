import { Module } from '@nestjs/common';
import { PrismaModule } from '#root/prisma/prisma.module';
import { TelegramUserService } from '#root/telegram-user/telegram-user.service';

@Module({
    controllers: [],
    providers: [TelegramUserService],
    exports: [TelegramUserService],
    imports: [PrismaModule]
})
export class TelegramUserModule {}
